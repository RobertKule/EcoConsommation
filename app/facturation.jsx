import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import BillEstimationCard from '../components/BillEstimationCard';
import BillingCalculator from '../components/BillingCalculator';
import BudgetAlert from '../components/BudgetAlert';
import LoadingScreen from '../components/LoadingScreen';
import { BillingService } from '../services/BillingService';
import { PriceConfigService } from '../services/PriceConfigService';
import { fetchReleves } from '../services/storageService';

const Colors = {
  light: {
    background: "#f8faff",
    text: "#1a1a1a",
    textSecondary: "#666",
    card: "#ffffff",
    primary: "#007AFF",
    error: "#FF3B30",
  },
  dark: {
    background: "#000000",
    text: "#ffffff",
    textSecondary: "#98989f",
    card: "#1c1c1e",
    primary: "#0A84FF",
    error: "#FF453A",
  }
};

export default function FacturationScreen() {
  const colorScheme = useColorScheme();
  const colors = useMemo(() => Colors[colorScheme] || Colors.light, [colorScheme]);
  const [releves, setReleves] = useState([]);
  const [estimations, setEstimations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [config, setConfig] = useState(null);

  // Charger la configuration une fois
  const loadConfig = useCallback(async () => {
    const cfg = await PriceConfigService.loadPriceConfig();
    setConfig(cfg);
    return cfg;
  }, []);

  const generateEstimationsAndAlerts = useCallback(async (data, cfg) => {
    const estims = [];
    if (data.some(r => r.type === "Eau")) {
      const eauEstim = BillingService.calculateDetailedBill(data, "Eau", cfg.Eau);
      if (eauEstim) estims.push({ ...eauEstim, type: "Eau" });
    }
    if (data.some(r => r.type === "Électricité")) {
      const elecEstim = BillingService.calculateDetailedBill(data, "Électricité", cfg.Électricité);
      if (elecEstim) estims.push({ ...elecEstim, type: "Électricité" });
    }
    setEstimations(estims);

    // Générer les alertes
    const newAlerts = BillingService.generateBudgetAlerts(estims, cfg.budgetMensuel);
    setAlerts(newAlerts);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const cfg = await loadConfig();
      await fetchReleves(
        (data) => {
          setReleves(data);
          generateEstimationsAndAlerts(data, cfg);
          setLoading(false);
          setRefreshing(false);
        },
        (err) => {
          console.error("Erreur chargement relevés:", err);
          Alert.alert("Erreur", "Impossible de charger les données.");
          setLoading(false);
          setRefreshing(false);
        }
      );
    } catch (error) {
      console.error("Erreur critique:", error);
      Alert.alert("Erreur", "Une erreur inattendue est survenue.");
      setLoading(false);
    }
  }, [loadConfig, generateEstimationsAndAlerts]);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const onCalculationComplete = useCallback((results) => {
    const newEstims = [];
    if (results.Eau) newEstims.push({ ...results.Eau, type: "Eau" });
    if (results.Électricité) newEstims.push({ ...results.Électricité, type: "Électricité" });
    setEstimations(newEstims);
    // Mettre à jour les alertes si nécessaire
    if (config) {
      const newAlerts = BillingService.generateBudgetAlerts(newEstims, config.budgetMensuel);
      setAlerts(newAlerts);
    }
  }, [config]);

  const handleAdjustBudget = useCallback(() => {
    // Navigation vers les paramètres pour ajuster le budget
    // À implémenter selon votre système de navigation
    Alert.alert("Redirection", "Naviguer vers Paramètres > Tarifs & Budget");
  }, []);

  const handleDismissAlert = useCallback((index) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);

  if (loading) {
    return <LoadingScreen message="Chargement des données..." />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadData} colors={[colors.primary]} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>💰 Estimation de Facture</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Calculez et suivez vos coûts de consommation
        </Text>
      </View>

      {/* Alertes de budget */}
      {alerts.map((alert, index) => (
        <BudgetAlert
          key={index}
          alert={alert}
          onDismiss={() => handleDismissAlert(index)}
          onAdjustBudget={handleAdjustBudget}
        />
      ))}

      {/* Calculateur interactif */}
      <BillingCalculator
        releves={releves}
        onCalculationComplete={onCalculationComplete}
      />

      {/* Résumé des estimations */}
      {estimations.length > 0 && (
        <View style={styles.estimationsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📋 Résumé</Text>
          {estimations.map((estim, index) => (
            <BillEstimationCard
              key={index}
              estimation={estim}
              onEdit={() => Alert.alert("Modifier", `Modifier ${estim.type}`)}
              onDelete={() => Alert.alert("Supprimer", `Supprimer ${estim.type}?`, [
                { text: "Annuler", style: "cancel" },
                { text: "Supprimer", style: "destructive", onPress: () => console.log("Supprimé") }
              ])}
            />
          ))}
        </View>
      )}

      {estimations.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Aucune estimation disponible. Ajoutez des relevés pour commencer le calcul.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  estimationsSection: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyState: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});