import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme
} from "react-native";
import AppButton from "../components/Button/AppButton";
import ChartContainer from "../components/Charts/ChartContainer";
import ChartSelector from "../components/Charts/ChartSelector";
import LoadingScreen from "../components/LoadingScreen";
import BaseModal from "../components/Modal/BaseModal";
import { fetchReleves } from "../services/storageService";

const { width } = Dimensions.get('window');

// Couleurs pour les thèmes
const Colors = {
  light: {
    primary: "#007AFF",
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

export default function Graphiques() {
  const colorScheme = useColorScheme();
  const colors = useMemo(() => Colors[colorScheme] || Colors.light, [colorScheme]);
  
  const [dataEau, setDataEau] = useState([]);
  const [dataElectricite, setDataElectricite] = useState([]);
  const [chartType, setChartType] = useState("line");
  const [tooltip, setTooltip] = useState({ visible: false, point: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Animations avec useRef pour éviter les réinitialisations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Mémoized values
  const hasData = useMemo(() => 
    dataEau.length > 0 || dataElectricite.length > 0, 
    [dataEau.length, dataElectricite.length]
  );

  const totalReleves = useMemo(() => 
    dataEau.length + dataElectricite.length, 
    [dataEau.length, dataElectricite.length]
  );

  const analysisMessage = useMemo(() => {
    if (totalReleves >= 10) {
      return "Vous avez suffisamment de données pour une analyse précise. Continuez à suivre votre consommation !";
    } else if (totalReleves >= 5) {
      return "Bonne progression ! Ajoutez plus de relevés pour améliorer la précision des analyses.";
    } else {
      return "Commencez à voir vos tendances. Ajoutez régulièrement des relevés pour des analyses plus détaillées.";
    }
  }, [totalReleves]);

  // Callbacks optimisés
  const startAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const loadData = useCallback(() => {
    setError(null);
    fetchReleves(
      (releves) => {
        const eauData = releves.filter((r) => r.type === "Eau");
        const electriciteData = releves.filter((r) => r.type === "Électricité");
        
        setDataEau(eauData);
        setDataElectricite(electriciteData);
        setLoading(false);
        setRefreshing(false);
        
        if (eauData.length > 0 || electriciteData.length > 0) {
          startAnimations();
        }
      },
      (err) => {
        console.error("Erreur chargement données:", err);
        setError("Impossible de charger les données");
        setLoading(false);
        setRefreshing(false);
        startAnimations();
      }
    );
  }, [startAnimations]);

  const handleDataPointClick = useCallback((data) => {
    setTooltip({ 
      visible: true, 
      point: {
        value: data.value,
        label: data.label,
        index: data.index,
        type: data.type
      }
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const closeTooltip = useCallback(() => {
    setTooltip({ visible: false, point: null });
  }, []);

  const handleChartTypeChange = useCallback((type) => {
    setChartType(type);
  }, []);

  // Effet d'initialisation
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rendu des statistiques mémoizé
  const renderStats = useMemo(() => {
    if (!hasData) return null;

    const statItems = [
      { 
        icon: "water-outline", 
        count: dataEau.length, 
        label: "Relevés eau",
        color: colors.primary 
      },
      { 
        icon: "flash-outline", 
        count: dataElectricite.length, 
        label: "Relevés électricité",
        color: colors.primary 
      },
      { 
        icon: "stats-chart-outline", 
        count: totalReleves, 
        label: "Total",
        color: colors.primary 
      }
    ];

    return (
      <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
        {statItems.map((item, index) => (
          <View key={item.label} style={styles.statItem}>
            {index > 0 && (
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            )}
            <Ionicons name={item.icon} size={20} color={item.color} />
            <Text style={[styles.statNumber, { color: item.color }]}>
              {item.count}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    );
  }, [hasData, dataEau.length, dataElectricite.length, totalReleves, colors]);

  // Rendu du contenu des graphiques mémoizé
  const renderChartsContent = useMemo(() => {
    if (!hasData) {
      return (
        <Animated.View 
          style={[
            styles.emptyContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Ionicons name="bar-chart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Aucune donnée disponible
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Commencez par ajouter des relevés pour visualiser vos graphiques de consommation
          </Text>
          <AppButton 
            title="➕ Premier relevé" 
            onPress={() => console.log("Navigate to add")}
            variant="success"
            style={styles.emptyButton}
            size="large"
          />
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[styles.chartsContainer, { opacity: fadeAnim }]}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {dataEau.length > 0 && (
            <View style={styles.chartSection}>
              <ChartContainer
                data={dataEau}
                type={chartType}
                title="💧 Consommation d'Eau"
                onDataPointClick={handleDataPointClick}
                colors={["#007AFF", "#5AC8FA", "#34C759", "#64D2FF"]}
              />
            </View>
          )}

          {dataElectricite.length > 0 && (
            <View style={styles.chartSection}>
              <ChartContainer
                data={dataElectricite}
                type={chartType}
                title="⚡ Consommation d'Électricité"
                onDataPointClick={handleDataPointClick}
                colors={["#FF9500", "#FF3B30", "#FFD60A", "#FF9F0A"]}
              />
            </View>
          )}

          {/* Section d'analyse */}
          <View style={[styles.analysisContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.analysisTitle, { color: colors.text }]}>
              📈 Analyse des données
            </Text>
            <Text style={[styles.analysisText, { color: colors.textSecondary }]}>
              {analysisMessage}
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }, [
    hasData, dataEau, dataElectricite, chartType, colors, 
    fadeAnim, slideAnim, refreshing, onRefresh, 
    handleDataPointClick, analysisMessage
  ]);

  // Rendu du tooltip mémoizé
  const renderTooltipContent = useMemo(() => {
    if (!tooltip.point) return null;

    return (
      <View style={styles.tooltipContent}>
        <View style={[styles.tooltipHeader, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons 
            name={tooltip.point.type === "Eau" ? "water" : "flash"} 
            size={24} 
            color={colors.primary} 
          />
          <Text style={[styles.tooltipType, { color: colors.primary }]}>
            {tooltip.point.type || "Donnée"}
          </Text>
        </View>
        
        <View style={styles.tooltipRows}>
          <View style={styles.tooltipRow}>
            <Text style={[styles.tooltipLabel, { color: colors.text }]}>Valeur :</Text>
            <Text style={[styles.tooltipValue, { color: colors.primary }]}>
              {tooltip.point.value} {tooltip.point.type === "Eau" ? "L" : "kWh"}
            </Text>
          </View>
          <View style={styles.tooltipRow}>
            <Text style={[styles.tooltipLabel, { color: colors.text }]}>Date :</Text>
            <Text style={[styles.tooltipValue, { color: colors.text }]}>
              {tooltip.point.label}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [tooltip.point, colors]);

  if (loading) {
    return <LoadingScreen message="Chargement des graphiques..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header animé */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>
              Analyse des Consommations
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Visualisez vos données d'eau et d'électricité
            </Text>
          </View>
          
          <AppButton 
            title="Actualiser" 
            onPress={handleRefresh}
            variant="secondary"
            style={styles.refreshButton}
            size="small"
            loading={refreshing}
          />
        </View>

        {renderStats}
      </Animated.View>

      {/* Sélecteur de graphique */}
      <Animated.View 
        style={[
          styles.selectorContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ChartSelector 
          selectedType={chartType} 
          onTypeChange={handleChartTypeChange} 
        />
      </Animated.View>

      {renderChartsContent}

      {/* Modal de détails */}
      <BaseModal
        visible={tooltip.visible}
        onClose={closeTooltip}
        title="📊 Détails du point de données"
      >
        {renderTooltipContent}
      </BaseModal>

      {/* Affichage d'erreur */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.error + '20' }]}>
          <Ionicons name="warning-outline" size={20} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <AppButton 
            title="Réessayer" 
            onPress={loadData}
            variant="error"
            size="small"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 20,
  },
  refreshButton: {
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  statsContainer: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 8,
  },
  selectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chartsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  chartSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisContainer: {
    margin: 10,
    borderRadius: 16,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 13,
    lineHeight: 18,
  },
  tooltipContent: {
    width: '100%',
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  tooltipType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tooltipRows: {
    gap: 12,
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tooltipLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  tooltipValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});