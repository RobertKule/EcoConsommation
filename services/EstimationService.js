export class EstimationService {
  static calculateMonthlyBill(releves, type, prixUnitaire) {
    if (releves.length < 2) return null;

    const filteredReleves = releves
      .filter(r => r.type === type)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (filteredReleves.length < 2) return null;

    // Calcul de la consommation du dernier mois
    const lastMonthReleves = this.getLastMonthReleves(filteredReleves);
    if (lastMonthReleves.length < 2) return null;

    const consommation = lastMonthReleves[lastMonthReleves.length - 1].index_val - 
                         lastMonthReleves[0].index_val;
    
    const estimation = consommation * prixUnitaire;

    return {
      consommation,
      estimation: Math.round(estimation * 100) / 100,
      periode: this.getPeriodString(lastMonthReleves),
    };
  }

  static getLastMonthReleves(releves) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    return releves.filter(r => new Date(r.date) >= lastMonth);
  }

  static getPeriodString(releves) {
    if (releves.length < 2) return "";
    
    const start = new Date(releves[0].date);
    const end = new Date(releves[releves.length - 1].date);
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }

  // Prix unitaires par défaut (à personnaliser)
  static getDefaultPrices() {
    return {
      Eau: 0.003, // €/litre
      Électricité: 0.18, // €/kWh
    };
  }
}