import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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
import { fetchReleves } from "../services/Database";

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
  const colors = Colors[colorScheme] || Colors.light;
  
  const [dataEau, setDataEau] = useState([]);
  const [dataElectricite, setDataElectricite] = useState([]);
  const [chartType, setChartType] = useState("line");
  const [tooltip, setTooltip] = useState({ visible: false, point: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    loadData();
  }, []);

  const startAnimations = () => {
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
  };

  const loadData = () => {
    setLoading(true);
    fetchReleves(
      (releves) => {
        setDataEau(releves.filter((r) => r.type === "Eau"));
        setDataElectricite(releves.filter((r) => r.type === "Électricité"));
        setLoading(false);
        setRefreshing(false);
        startAnimations();
      },
      (err) => {
        console.error("Erreur chargement données:", err);
        setLoading(false);
        setRefreshing(false);
        startAnimations();
      }
    );
  };

  const handleDataPointClick = (data) => {
    setTooltip({ 
      visible: true, 
      point: {
        value: data.value,
        label: data.label,
        index: data.index,
        type: data.type
      }
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const hasData = dataEau.length > 0 || dataElectricite.length > 0;
  const totalReleves = dataEau.length + dataElectricite.length;

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
            // icon="refresh-outline"
            size="small"
          />
        </View>

        {/* Stats rapides */}
        {hasData && (
          <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={20} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {dataEau.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Relevés eau
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statItem}>
              <Ionicons name="flash-outline" size={20} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {dataElectricite.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Relevés électricité
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statItem}>
              <Ionicons name="stats-chart-outline" size={20} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {totalReleves}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
          </View>
        )}
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
          onTypeChange={setChartType} 
        />
      </Animated.View>

      {!hasData ? (
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
      ) : (
        <Animated.View 
          style={[
            styles.chartsContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
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
            {hasData && (
              <View style={[styles.analysisContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.analysisTitle, { color: colors.text }]}>
                  📈 Analyse des données
                </Text>
                <Text style={[styles.analysisText, { color: colors.textSecondary }]}>
                  {totalReleves >= 10 
                    ? "Vous avez suffisamment de données pour une analyse précise. Continuez à suivre votre consommation !"
                    : totalReleves >= 5
                    ? "Bonne progression ! Ajoutez plus de relevés pour améliorer la précision des analyses."
                    : "Commencez à voir vos tendances. Ajoutez régulièrement des relevés pour des analyses plus détaillées."
                  }
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Modal de détails */}
      <BaseModal
        visible={tooltip.visible}
        onClose={() => setTooltip({ visible: false, point: null })}
        title="📊 Détails du point de données"
      >
        {tooltip.point && (
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
        )}
      </BaseModal>
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
    // fontStyle:"italic",
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
});