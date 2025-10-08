import { EstimationService } from './storageService';

export class AnalyticsService {
  /**
   * Analyse la consommation sur différentes périodes
   */
  static analyzeConsumption(releves, type) {
    if (!releves || releves.length < 2) {
      return this.getEmptyAnalysis();
    }

    const filteredReleves = releves.filter(r => r.type === type);
    
    if (filteredReleves.length < 2) {
      return this.getEmptyAnalysis();
    }

    const sortedReleves = [...filteredReleves].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      daily: this.analyzeDailyConsumption(sortedReleves),
      weekly: this.analyzeWeeklyConsumption(sortedReleves),
      monthly: this.analyzeMonthlyConsumption(sortedReleves),
      trends: this.analyzeTrends(sortedReleves),
      alerts: this.generateAlerts(sortedReleves)
    };
  }

  /**
   * Analyse la consommation quotidienne
   */
  static analyzeDailyConsumption(releves) {
    const dailyStats = releves.map((releve, index) => {
      const consumption = index > 0 
        ? parseFloat(releve.index_val) - parseFloat(releves[index - 1].index_val)
        : 0;

      return {
        date: releve.date,
        consumption: Math.max(0, consumption),
        index: parseFloat(releve.index_val)
      };
    }).filter(stat => stat.consumption > 0); // Retirer la première entrée

    const consumptions = dailyStats.map(stat => stat.consumption);
    const average = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;

    return {
      average: Math.round(average),
      max: Math.round(Math.max(...consumptions)),
      min: Math.round(Math.min(...consumptions)),
      total: Math.round(consumptions.reduce((a, b) => a + b, 0)),
      data: dailyStats
    };
  }

  /**
   * Analyse la consommation hebdomadaire
   */
  static analyzeWeeklyConsumption(releves) {
    const weeklyData = this.groupByWeek(releves);
    const weeklyConsumptions = Object.values(weeklyData).map(week => week.total);

    return {
      average: Math.round(weeklyConsumptions.reduce((a, b) => a + b, 0) / weeklyConsumptions.length),
      max: Math.round(Math.max(...weeklyConsumptions)),
      min: Math.round(Math.min(...weeklyConsumptions)),
      data: weeklyData
    };
  }

  /**
   * Analyse la consommation mensuelle
   */
  static analyzeMonthlyConsumption(releves) {
    const monthlyData = this.groupByMonth(releves);
    const monthlyConsumptions = Object.values(monthlyData).map(month => month.total);

    // Estimation des factures
    const prices = EstimationService.getDefaultPrices();
    const monthlyEstimations = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      consumption: data.total,
      estimation: Math.round(data.total * prices[releves[0].type]),
      averageDaily: Math.round(data.total / data.count)
    }));

    return {
      average: Math.round(monthlyConsumptions.reduce((a, b) => a + b, 0) / monthlyConsumptions.length),
      max: Math.round(Math.max(...monthlyConsumptions)),
      min: Math.round(Math.min(...monthlyConsumptions)),
      estimations: monthlyEstimations,
      data: monthlyData
    };
  }

  /**
   * Analyse les tendances
   */
  static analyzeTrends(releves) {
    const consumptions = releves.map(item => parseFloat(item.index_val));
    const dates = releves.map(item => new Date(item.date).getTime());
    
    // Régression linéaire simple
    const n = consumptions.length;
    const sumX = dates.reduce((a, b) => a + b, 0);
    const sumY = consumptions.reduce((a, b) => a + b, 0);
    const sumXY = dates.reduce((sum, x, i) => sum + x * consumptions[i], 0);
    const sumX2 = dates.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Prévision pour les 7 prochains jours
    const lastDate = new Date(Math.max(...dates));
    const forecast = Array.from({length: 7}, (_, i) => {
      const forecastDate = new Date(lastDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
      const forecastValue = slope * forecastDate.getTime() + intercept;
      return {
        date: forecastDate.toISOString().split('T')[0],
        value: Math.max(0, Math.round(forecastValue))
      };
    });

    return {
      slope: slope,
      direction: slope > 0 ? 'hausse' : slope < 0 ? 'baisse' : 'stable',
      strength: Math.abs(slope) > 1000 ? 'forte' : Math.abs(slope) > 500 ? 'modérée' : 'faible',
      forecast: forecast,
      rSquared: this.calculateRSquared(consumptions, dates, slope, intercept)
    };
  }

  /**
   * Génère des alertes basées sur les données
   */
  static generateAlerts(releves) {
    const alerts = [];
    const consumptions = releves.map(item => parseFloat(item.index_val));
    
    // Détection de pics
    const average = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
    const standardDeviation = Math.sqrt(
      consumptions.map(c => Math.pow(c - average, 2)).reduce((a, b) => a + b, 0) / consumptions.length
    );

    consumptions.forEach((consumption, index) => {
      if (consumption > average + 2 * standardDeviation) {
        alerts.push({
          type: 'peak',
          severity: 'high',
          message: `Pic de consommation détecté le ${new Date(releves[index].date).toLocaleDateString()}`,
          date: releves[index].date,
          value: consumption
        });
      }
    });

    // Tendance à la hausse
    const lastThree = consumptions.slice(-3);
    if (lastThree.length === 3 && lastThree[2] > lastThree[1] && lastThree[1] > lastThree[0]) {
      alerts.push({
        type: 'trend',
        severity: 'medium',
        message: 'Tendance à la hausse détectée sur les 3 derniers relevés',
        date: releves[releves.length - 1].date
      });
    }

    return alerts;
  }

  /**
   * Groupe les données par semaine
   */
  static groupByWeek(releves) {
    return releves.reduce((acc, item) => {
      const date = new Date(item.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Début de semaine (dimanche)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!acc[weekKey]) {
        acc[weekKey] = {
          total: 0,
          count: 0,
          startDate: weekKey,
          endDate: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
      }
      
      acc[weekKey].total += parseFloat(item.index_val);
      acc[weekKey].count++;
      
      return acc;
    }, {});
  }

  /**
   * Groupe les données par mois
   */
  static groupByMonth(releves) {
    return releves.reduce((acc, item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          total: 0,
          count: 0,
          month: monthKey
        };
      }
      
      acc[monthKey].total += parseFloat(item.index_val);
      acc[monthKey].count++;
      
      return acc;
    }, {});
  }

  /**
   * Calcule le coefficient de détermination R²
   */
  static calculateRSquared(consumptions, dates, slope, intercept) {
    const yMean = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
    
    const totalSumSquares = consumptions.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const residualSumSquares = consumptions.reduce((sum, y, i) => {
      const predicted = slope * dates[i] + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    
    return 1 - (residualSumSquares / totalSumSquares);
  }

  /**
   * Analyse vide pour état initial
   */
  static getEmptyAnalysis() {
    return {
      daily: { average: 0, max: 0, min: 0, total: 0, data: [] },
      weekly: { average: 0, max: 0, min: 0, data: {} },
      monthly: { average: 0, max: 0, min: 0, estimations: [], data: {} },
      trends: { slope: 0, direction: 'stable', strength: 'faible', forecast: [], rSquared: 0 },
      alerts: []
    };
  }

  /**
   * Génère un rapport complet
   */
  static generateReport(releves, type) {
    const analysis = this.analyzeConsumption(releves, type);
    const prices = EstimationService.getDefaultPrices();
    const currentEstimation = EstimationService.calculateMonthlyBill(releves, type, prices[type]);

    return {
      summary: {
        type,
        totalReleves: releves.filter(r => r.type === type).length,
        period: `${new Date(releves[0].date).toLocaleDateString()} - ${new Date(releves[releves.length - 1].date).toLocaleDateString()}`,
        generatedAt: new Date().toISOString()
      },
      consumption: analysis,
      estimation: currentEstimation,
      recommendations: this.generateRecommendations(analysis)
    };
  }

  /**
   * Génère des recommandations basées sur l'analyse
   */
  static generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.daily.average > 100) {
      recommendations.push({
        type: 'economy',
        priority: 'high',
        title: 'Consommation élevée',
        description: 'Votre consommation quotidienne moyenne est élevée. Vérifiez les éventuelles fuites ou appareils énergivores.',
        action: 'Audit énergétique recommandé'
      });
    }

    if (analysis.trends.direction === 'hausse') {
      recommendations.push({
        type: 'trend',
        priority: 'medium',
        title: 'Tendance à la hausse',
        description: 'Votre consommation montre une tendance à la hausse. Surveillez vos habitudes de consommation.',
        action: 'Comparer avec la période précédente'
      });
    }

    if (analysis.alerts.length > 0) {
      recommendations.push({
        type: 'alert',
        priority: 'high',
        title: 'Pics de consommation détectés',
        description: `${analysis.alerts.length} pic(s) de consommation ont été détectés.`,
        action: 'Analyser les causes des pics'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'good',
        priority: 'low',
        title: 'Consommation stable',
        description: 'Votre consommation est stable et dans les normes. Continuez vos bonnes habitudes !',
        action: 'Maintenir le suivi régulier'
      });
    }

    return recommendations;
  }
}