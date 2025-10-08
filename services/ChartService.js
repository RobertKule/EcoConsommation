import { fetchReleves } from './storageService';

export class ChartService {
  /**
   * Formate les données pour les graphiques
   */
  static formatChartData(releves, chartType = 'line', period = 'all') {
    if (!releves || releves.length === 0) {
      return this.getEmptyChartData();
    }

    const filteredData = this.filterByPeriod(releves, period);
    
    switch (chartType) {
      case 'line':
        return this.formatLineChartData(filteredData);
      case 'bar':
        return this.formatBarChartData(filteredData);
      case 'pie':
        return this.formatPieChartData(filteredData);
      default:
        return this.formatLineChartData(filteredData);
    }
  }

  /**
   * Données pour graphique en ligne
   */
  static formatLineChartData(releves) {
    const sortedData = [...releves].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedData.map(item => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const values = sortedData.map(item => parseFloat(item.index_val));

    return {
      labels: labels.length > 15 ? this.reduceLabels(labels) : labels,
      datasets: [
        {
          data: values.length > 15 ? this.reduceValues(values) : values,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Consommation"]
    };
  }

  /**
   * Données pour graphique en barres
   */
  static formatBarChartData(releves) {
    // Grouper par mois
    const monthlyData = this.groupByMonth(releves);
    
    const labels = Object.keys(monthlyData).map(monthKey => {
      const [year, month] = monthKey.split('-');
      return `${month}/${year.slice(2)}`;
    });

    const values = Object.values(monthlyData).map(month => month.average);

    return {
      labels: labels.slice(-6), // Derniers 6 mois
      datasets: [
        {
          data: values.slice(-6),
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
        }
      ],
      legend: ["Moyenne mensuelle"]
    };
  }

  /**
   * Données pour graphique circulaire
   */
  static formatPieChartData(releves) {
    const consumptionByType = releves.reduce((acc, item) => {
      const type = item.type;
      const value = parseFloat(item.index_val);
      
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += value;
      return acc;
    }, {});

    const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6'];
    
    return Object.entries(consumptionByType).map(([name, value], index) => ({
      name,
      value: Math.round(value),
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));
  }

  /**
   * Filtre les données par période
   */
  static filterByPeriod(releves, period) {
    const now = new Date();
    
    switch (period) {
      case 'week':
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return releves.filter(item => new Date(item.date) >= lastWeek);
      
      case 'month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return releves.filter(item => new Date(item.date) >= lastMonth);
      
      case '3months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        return releves.filter(item => new Date(item.date) >= threeMonthsAgo);
      
      case 'year':
        const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return releves.filter(item => new Date(item.date) >= lastYear);
      
      default:
        return releves;
    }
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
          dates: []
        };
      }
      
      acc[monthKey].total += parseFloat(item.index_val);
      acc[monthKey].count++;
      acc[monthKey].dates.push(date);
      
      return acc;
    }, {});
  }

  /**
   * Calcule les statistiques avancées
   */
  static calculateStatistics(releves) {
    if (!releves || releves.length === 0) {
      return null;
    }

    const values = releves.map(item => parseFloat(item.index_val));
    const total = values.reduce((a, b) => a + b, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Écart type
    const squareDiffs = values.map(value => Math.pow(value - average, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    const standardDeviation = Math.sqrt(avgSquareDiff);

    // Tendance (régression linéaire simple)
    const trend = this.calculateTrend(values);

    return {
      total: Math.round(total),
      average: Math.round(average),
      max: Math.round(max),
      min: Math.round(min),
      count: values.length,
      standardDeviation: Math.round(standardDeviation),
      trend: trend,
      coefficientVariation: Math.round((standardDeviation / average) * 100)
    };
  }

  /**
   * Calcule la tendance (régression linéaire)
   */
  static calculateTrend(values) {
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    if (slope > 0.1) return 'hausse';
    if (slope < -0.1) return 'baisse';
    return 'stable';
  }

  /**
   * Réduit les labels pour éviter la surcharge
   */
  static reduceLabels(labels) {
    const step = Math.ceil(labels.length / 10);
    return labels.filter((_, index) => index % step === 0);
  }

  /**
   * Réduit les valeurs pour éviter la surcharge
   */
  static reduceValues(values) {
    const step = Math.ceil(values.length / 10);
    return values.filter((_, index) => index % step === 0);
  }

  /**
   * Données vides pour état initial
   */
  static getEmptyChartData() {
    return {
      labels: ['Aucune', 'donnée'],
      datasets: [{ data: [0, 0] }],
      legend: ["Consommation"]
    };
  }

  /**
   * Récupère les données avec callback
   */
  static async getChartData(onSuccess, onError, chartType = 'line', period = 'all') {
    try {
      await fetchReleves(
        (releves) => {
          const chartData = this.formatChartData(releves, chartType, period);
          const statistics = this.calculateStatistics(releves);
          onSuccess?.({
            chartData,
            statistics,
            rawData: releves
          });
        },
        (error) => {
          onError?.(error);
        }
      );
    } catch (error) {
      onError?.(error);
    }
  }
}