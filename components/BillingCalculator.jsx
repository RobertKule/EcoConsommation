import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { BillingService } from '../services/BillingService';
import { PriceConfigService } from '../services/PriceConfigService';

const Colors = {
  light: {
    primary: "#007AFF",
    secondary: "#5856D6",
    background: "#f8faff",
    card: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666",
    border: "#f0f0f0",
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30"
  },
  dark: {
    primary: "#0A84FF",
    secondary: "#BF5AF2",
    background: "#000000",
    card: "#1c1c1e",
    text: "#ffffff",
    textSecondary: "#98989f",
    border: "#38383a",
    success: "#30D158",
    warning: "#FF9F0A",
    error: "#FF453A"
  }
};

export default function BillingCalculator({ releves, onCalculationComplete }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;

  const [customPrices, setCustomPrices] = useState({
    Eau: '',
    Électricité: ''
  });
  const [calculations, setCalculations] = useState(null);

  const defaultPrices = useMemo(() => ({
    Eau: PriceConfigService.defaultConfig.Eau,
    Électricité: PriceConfigService.defaultConfig.Électricité
  }), []);

  const handleCalculate = async () => {
    try {
      const config = await PriceConfigService.loadPriceConfig();
      const results = {};

      // Calcul pour l'eau
      if (releves.some(r => r.type === "Eau")) {
        const prixEau = customPrices.Eau || config.Eau;
        results.Eau = BillingService.calculateDetailedBill(releves, "Eau", parseFloat(prixEau));
        
        if (results.Eau) {
          results.Eau.total = PriceConfigService.calculateTotalCost(
            results.Eau.consommation,
            parseFloat(prixEau),
            config.abonnementEau,
            config.tva
          );
        }
      }

      // Calcul pour l'électricité
      if (releves.some(r => r.type === "Électricité")) {
        const prixElectricite = customPrices.Électricité || config.Électricité;
        results.Électricité = BillingService.calculateDetailedBill(releves, "Électricité", parseFloat(prixElectricite));
        
        if (results.Électricité) {
          results.Électricité.total = PriceConfigService.calculateTotalCost(
            results.Électricité.consommation,
            parseFloat(prixElectricite),
            config.abonnementElectricite,
            config.tva
          );
        }
      }

      setCalculations(results);
      onCalculationComplete?.(results);
    } catch (error) {
      console.error('Erreur calcul facturation:', error);
    }
  };

  const handlePriceChange = (type, value) => {
    setCustomPrices(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const getTotalFacture = () => {
    if (!calculations) return 0;
    
    let total = 0;
    Object.values(calculations).forEach(calc => {
      if (calc?.total) {
        total += calc.total.total;
      }
    });
    
    return Math.round(total * 100) / 100;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Configuration des prix */}
      <View style={[styles.configSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          ⚙️ Configuration des Tarifs
        </Text>

        <View style={styles.priceInputs}>
          <View style={styles.priceInput}>
            <Text style={[styles.priceLabel, { color: colors.text }]}>💧 Prix de l'eau</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder={`Défaut: ${defaultPrices.Eau} €/L`}
                placeholderTextColor={colors.textSecondary}
                value={customPrices.Eau}
                onChangeText={(value) => handlePriceChange('Eau', value)}
                keyboardType="decimal-pad"
              />
              <Text style={[styles.unit, { color: colors.textSecondary }]}>€/L</Text>
            </View>
          </View>

          <View style={styles.priceInput}>
            <Text style={[styles.priceLabel, { color: colors.text }]}>⚡ Prix électricité</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder={`Défaut: ${defaultPrices.Électricité} €/kWh`}
                placeholderTextColor={colors.textSecondary}
                value={customPrices.Électricité}
                onChangeText={(value) => handlePriceChange('Électricité', value)}
                keyboardType="decimal-pad"
              />
              <Text style={[styles.unit, { color: colors.textSecondary }]}>€/kWh</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.calculateButton, { backgroundColor: colors.primary }]}
          onPress={handleCalculate}
        >
          <Ionicons name="calculator-outline" size={20} color="#fff" />
          <Text style={styles.calculateButtonText}>Calculer la Facture</Text>
        </TouchableOpacity>
      </View>

      {/* Résultats */}
      {calculations && (
        <View style={styles.resultsSection}>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>
            📊 Résultats du Calcul
          </Text>

          {calculations.Eau && (
            <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
              <View style={styles.resultHeader}>
                <Ionicons name="water" size={20} color="#007AFF" />
                <Text style={[styles.resultType, { color: colors.text }]}>Facture Eau</Text>
              </View>
              
              <View style={styles.resultDetails}>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Consommation:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {calculations.Eau.consommation} L
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Coût consommation:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {calculations.Eau.total.consommation} €
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Abonnement:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {calculations.Eau.total.abonnement} €
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>TVA {calculations.Eau.total.detailsTVA}:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {calculations.Eau.total.tva} €
                  </Text>
                </View>
                <View style={[styles.resultRow, styles.totalRow]}>
                  <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
                  <Text style={[styles.totalValue, { color: colors.primary }]}>
                    {calculations.Eau.total.total} €
                  </Text>
                </View>
              </View>
            </View>
          )}

          {calculations.Électricité && (
            <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
              <View style={styles.resultHeader}>
                <Ionicons name="flash" size={20} color="#FF9500" />
                <Text style={[styles.resultType, { color: colors.text }]}>Facture Électricité</Text>
              </View>
              
              <View style={styles.resultDetails}>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Consommation:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {calculations.Électricité.consommation} kWh
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Coût consommation:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {calculations.Électricité.total.consommation} €
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Abonnement:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {calculations.Électricité.total.abonnement} €
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>TVA {calculations.Électricité.total.detailsTVA}:</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {calculations.Électricité.total.tva} €
                  </Text>
                </View>
                <View style={[styles.resultRow, styles.totalRow]}>
                  <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
                  <Text style={[styles.totalValue, { color: colors.primary }]}>
                    {calculations.Électricité.total.total} €
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Total général */}
          <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.totalCardTitle}>Total Facture Mensuelle</Text>
            <Text style={styles.totalCardAmount}>{getTotalFacture()} €</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  configSection: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priceInputs: {
    gap: 10,
  },
  priceInput: {
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  unit: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsSection: {
    gap: 10,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultCard: {
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  resultType: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  resultDetails: {
    gap: 6,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 13,
  },
  resultValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 6,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalCard: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  totalCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  totalCardAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});