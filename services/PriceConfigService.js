import AsyncStorage from "@react-native-async-storage/async-storage";

const PRICE_CONFIG_KEY = "@EcoConsommation_priceConfig";

export class PriceConfigService {
  static defaultConfig = {
    Eau: 0.003, // €/litre (3€/m³)
    Électricité: 0.18, // €/kWh
    budgetMensuel: 150, // €
    tva: 20, // %
    abonnementEau: 15, // €/mois
    abonnementElectricite: 12, // €/mois
    alertes: {
      depassementBudget: true,
      consommationAnormale: true,
      tendanceHausse: true
    }
  };

  /**
   * Charge la configuration des prix
   */
  static async loadPriceConfig() {
    try {
      const stored = await AsyncStorage.getItem(PRICE_CONFIG_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        return { ...this.defaultConfig, ...config };
      }
      await this.savePriceConfig(this.defaultConfig);
      return this.defaultConfig;
    } catch (error) {
      console.error('Erreur chargement configuration prix:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Sauvegarde la configuration des prix
   */
  static async savePriceConfig(config) {
    try {
      await AsyncStorage.setItem(PRICE_CONFIG_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde configuration prix:', error);
      return false;
    }
  }

  /**
   * Met à jour un prix spécifique
   */
  static async updatePrice(type, nouveauPrix) {
    try {
      const config = await this.loadPriceConfig();
      config[type] = parseFloat(nouveauPrix);
      return await this.savePriceConfig(config);
    } catch (error) {
      console.error('Erreur mise à jour prix:', error);
      return false;
    }
  }

  /**
   * Met à jour le budget mensuel
   */
  static async updateBudget(budget) {
    try {
      const config = await this.loadPriceConfig();
      config.budgetMensuel = parseFloat(budget);
      return await this.savePriceConfig(config);
    } catch (error) {
      console.error('Erreur mise à jour budget:', error);
      return false;
    }
  }

  /**
   * Calcule le coût total avec abonnement et TVA
   */
  static calculateTotalCost(consommation, prixUnitaire, abonnement, tva = 20) {
    const coutConsommation = consommation * prixUnitaire;
    const totalHorsTVA = coutConsommation + abonnement;
    const montantTVA = totalHorsTVA * (tva / 100);
    const totalTTC = totalHorsTVA + montantTVA;

    return {
      consommation: Math.round(coutConsommation * 100) / 100,
      abonnement: abonnement,
      horsTVA: Math.round(totalHorsTVA * 100) / 100,
      tva: Math.round(montantTVA * 100) / 100,
      total: Math.round(totalTTC * 100) / 100,
      detailsTVA: `${tva}%`
    };
  }

  /**
   * Récupère les tarifs pour un type donné
   */
  static async getPriceForType(type) {
    const config = await this.loadPriceConfig();
    return config[type] || this.defaultConfig[type];
  }

  /**
   * Récupère les abonnements
   */
  static async getAbonnements() {
    const config = await this.loadPriceConfig();
    return {
      Eau: config.abonnementEau || this.defaultConfig.abonnementEau,
      Électricité: config.abonnementElectricite || this.defaultConfig.abonnementElectricite
    };
  }

  /**
   * Réinitialise la configuration aux valeurs par défaut
   */
  static async resetToDefaults() {
    return await this.savePriceConfig(this.defaultConfig);
  }

  /**
   * Vérifie si la configuration est personnalisée
   */
  static async isCustomConfig() {
    const config = await this.loadPriceConfig();
    return JSON.stringify(config) !== JSON.stringify(this.defaultConfig);
  }
}