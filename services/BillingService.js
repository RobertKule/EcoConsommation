// services/BillingService.js
import { EstimationService } from './storageService';

export class BillingService {
  static defaultPrices = {
    Eau: 0.003, // €/litre (3€/m³)
    Électricité: 0.18 // €/kWh
  };

  /**
   * Calcule la facture détaillée
   */
  static calculateDetailedBill(releves, type, customPrice = null) {
    const prixUnitaire = customPrice || this.defaultPrices[type];
    const estimation = EstimationService.calculateMonthlyBill(releves, type, prixUnitaire);
    
    if (!estimation) return null;

    // Calculs supplémentaires
    const consommationJournaliere = estimation.consommation / 30; // Approximation
    const coutJournalier = consommationJournaliere * prixUnitaire;
    const projectionAnnuelle = estimation.estimation * 12;

    return {
      ...estimation,
      prixUnitaire,
      consommationJournaliere: Math.round(consommationJournaliere * 100) / 100,
      coutJournalier: Math.round(coutJournalier * 100) / 100,
      projectionAnnuelle: Math.round(projectionAnnuelle * 100) / 100,
      type
    };
  }

  /**
   * Compare avec la facture réelle
   */
  static compareWithActualBill(estimation, montantReel, periode) {
    const difference = montantReel - estimation.estimation;
    const pourcentageDifference = (difference / estimation.estimation) * 100;

    return {
      estimation: estimation.estimation,
      reel: montantReel,
      difference: Math.round(difference * 100) / 100,
      pourcentageDifference: Math.round(pourcentageDifference * 100) / 100,
      periode,
      status: difference > 0 ? 'supérieur' : difference < 0 ? 'inférieur' : 'égal'
    };
  }

  /**
   * Génère des alertes de budget
   */
  static generateBudgetAlerts(estimations, budgetMax) {
    const alerts = [];

    estimations.forEach(estimation => {
      if (estimation.estimation > budgetMax) {
        alerts.push({
          type: 'dépassement',
          severity: 'high',
          message: `Dépassement de budget ${estimation.type}: ${estimation.estimation}€ > ${budgetMax}€`,
          estimation: estimation.estimation,
          budget: budgetMax,
          difference: estimation.estimation - budgetMax
        });
      }

      // Alerte si consommation anormalement élevée
      if (estimation.consommation > this.getSeuilAnormal(estimation.type)) {
        alerts.push({
          type: 'consommation_anormale',
          severity: 'medium',
          message: `Consommation ${estimation.type} anormalement élevée`,
          consommation: estimation.consommation,
          seuil: this.getSeuilAnormal(estimation.type)
        });
      }
    });

    return alerts;
  }

  /**
   * Seuils de consommation anormale
   */
  static getSeuilAnormal(type) {
    const seuils = {
      Eau: 1000, // litres/jour
      Électricité: 50 // kWh/jour
    };
    return seuils[type];
  }

  /**
   * Calcule les économies potentielles
   */
  static calculateSavings(consommationActuelle, reductionPourcentage, prixUnitaire) {
    const economieConsommation = consommationActuelle * (reductionPourcentage / 100);
    const economieMontant = economieConsommation * prixUnitaire;
    
    return {
      economieConsommation: Math.round(economieConsommation * 100) / 100,
      economieMontant: Math.round(economieMontant * 100) / 100,
      nouvelleConsommation: Math.round((consommationActuelle - economieConsommation) * 100) / 100,
      reductionPourcentage
    };
  }

  /**
   * Historique des estimations
   */
  static generateEstimationHistory(releves, type, prixUnitaire, periodes = 6) {
    const history = [];
    const maintenant = new Date();

    for (let i = 0; i < periodes; i++) {
      const dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth() - i - 1, 1);
      const dateFin = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 0);
      
      const relevesPeriode = releves.filter(r => {
        const dateReleve = new Date(r.date);
        return dateReleve >= dateDebut && dateReleve <= dateFin && r.type === type;
      });

      if (relevesPeriode.length >= 2) {
        const estimation = this.calculateDetailedBill(relevesPeriode, type, prixUnitaire);
        if (estimation) {
          history.push({
            ...estimation,
            periode: `${dateDebut.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
            mois: dateDebut.getMonth() + 1,
            annee: dateDebut.getFullYear()
          });
        }
      }
    }

    return history.reverse(); // Du plus ancien au plus récent
  }
}