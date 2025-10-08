import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import AppButton from '../components/Button/AppButton';
import AdvancedChartContainer from '../components/Charts/AdvancedChartContainer';
import CustomBarChart from '../components/Charts/BarChart';
import ChartExport from '../components/Charts/ChartExport';
import CustomLineChart from '../components/Charts/LineChart';
import CustomPieChart from '../components/Charts/PieChart';
import LoadingScreen from '../components/LoadingScreen';
import BaseModal from '../components/Modal/BaseModal';
import { AnalyticsService } from '../services/AnalyticsService';
import { ChartService } from '../services/ChartService';
import { fetchReleves } from '../services/storageService';

const { width } = Dimensions.get('window');

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

const CHART_TYPES = {
  ADVANCED: 'advanced',
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie'
};

const PERIODS = {
  ALL: 'all',
  MONTH: 'month',
  '3MONTHS': '3months',
  YEAR: 'year'
};

export default function Graphiques() {
  const colorScheme = useColorScheme();
  const colors = useMemo(() => Colors[colorScheme] || Colors.light, [colorScheme]);

  const [dataEau, setDataEau] = useState([]);
  const [dataElectricite, setDataElectricite] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState(CHART_TYPES.ADVANCED);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS.ALL);
  const [selectedDataType, setSelectedDataType] = useState('both');
  const [exportModal, setExportModal] = useState({ visible: false, chart: null, title: '' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analysis, setAnalysis] = useState({ eau: null, electricite: null });

  // Mémoized values
  const hasData = useMemo(() => 
    dataEau.length > 0 || dataElectricite.length > 0, 
    [dataEau.length, dataElectricite.length]
  );

  const totalReleves = useMemo(() => 
    dataEau.length + dataElectricite.length, 
    [dataEau.length, dataElectricite.length]
  );

  const filteredDataEau = useMemo(() => 
    ChartService.filterByPeriod(dataEau, selectedPeriod),
    [dataEau, selectedPeriod]
  );

  const filteredDataElectricite = useMemo(() => 
    ChartService.filterByPeriod(dataElectricite, selectedPeriod),
    [dataElectricite, selectedPeriod]
  );

  // Callbacks optimisés
  const loadData = useCallback(async () => {
    try {
      await fetchReleves(
        (releves) => {
          const eauData = releves.filter(r => r.type === "Eau");
          const electriciteData = releves.filter(r => r.type === "Électricité");
          
          setDataEau(eauData);
          setDataElectricite(electriciteData);

          // Calculer les analyses
          const eauAnalysis = AnalyticsService.analyzeConsumption(releves, "Eau");
          const electriciteAnalysis = AnalyticsService.analyzeConsumption(releves, "Électricité");
          
          setAnalysis({
            eau: eauAnalysis,
            electricite: electriciteAnalysis
          });

          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error("Erreur chargement données:", error);
          setLoading(false);
          setRefreshing(false);
        }
      );
    } catch (error) {
      console.error("Erreur critique:", error);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleExportChart = useCallback((chartComponent, title) => {
    setExportModal({ visible: true, chart: chartComponent, title });
  }, []);

  const closeExportModal = useCallback(() => {
    setExportModal({ visible: false, chart: null, title: '' });
  }, []);

  const getPeriodLabel = useCallback((period) => {
    const labels = {
      [PERIODS.ALL]: 'Tout',
      [PERIODS.MONTH]: '1 mois',
      [PERIODS['3MONTHS']]: '3 mois',
      [PERIODS.YEAR]: '1 an'
    };
    return labels[period] || period;
  }, []);

  const getChartTypeIcon = useCallback((type) => {
    const icons = {
      [CHART_TYPES.ADVANCED]: 'stats-chart',
      [CHART_TYPES.LINE]: 'trending-up',
      [CHART_TYPES.BAR]: 'bar-chart',
      [CHART_TYPES.PIE]: 'pie-chart'
    };
    return icons[type] || 'stats-chart';
  }, []);

  // Rendu des sélecteurs mémoizé
  const renderPeriodSelector = useMemo(() => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.selectorContainer}
      contentContainerStyle={styles.selectorContent}
    >
      {Object.values(PERIODS).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.selectorButton,
            {
              backgroundColor: selectedPeriod === period ? colors.primary : colors.card,
              borderColor: colors.border,
            }
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[
            styles.selectorButtonText,
            { 
              color: selectedPeriod === period ? '#fff' : colors.textSecondary 
            }
          ]}>
            {getPeriodLabel(period)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ), [selectedPeriod, colors, getPeriodLabel]);

  const renderChartTypeSelector = useMemo(() => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.selectorContainer}
      contentContainerStyle={styles.selectorContent}
    >
      {Object.entries(CHART_TYPES).map(([key, type]) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.selectorButton,
            {
              backgroundColor: selectedChartType === type ? colors.primary : colors.card,
              borderColor: colors.border,
            }
          ]}
          onPress={() => setSelectedChartType(type)}
        >
          <Ionicons 
            name={getChartTypeIcon(type)} 
            size={16} 
            color={selectedChartType === type ? '#fff' : colors.textSecondary} 
          />
          <Text style={[
            styles.selectorButtonText,
            { 
              color: selectedChartType === type ? '#fff' : colors.textSecondary 
            }
          ]}>
            {key.charAt(0) + key.slice(1).toLowerCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ), [selectedChartType, colors, getChartTypeIcon]);

  const renderDataTypeSelector = useMemo(() => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.selectorContainer}
      contentContainerStyle={styles.selectorContent}
    >
      {[
        { key: 'both', label: '📈 Tous', icon: 'bar-chart' },
        { key: 'eau', label: '💧 Eau', icon: 'water' },
        { key: 'electricite', label: '⚡ Électricité', icon: 'flash' }
      ].map((type) => (
        <TouchableOpacity
          key={type.key}
          style={[
            styles.selectorButton,
            {
              backgroundColor: selectedDataType === type.key ? colors.primary : colors.card,
              borderColor: colors.border,
            }
          ]}
          onPress={() => setSelectedDataType(type.key)}
        >
          <Ionicons 
            name={type.icon} 
            size={16} 
            color={selectedDataType === type.key ? '#fff' : colors.textSecondary} 
          />
          <Text style={[
            styles.selectorButtonText,
            { 
              color: selectedDataType === type.key ? '#fff' : colors.textSecondary 
            }
          ]}>
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  ), [selectedDataType, colors]);

  // Rendu des graphiques mémoizé
  const renderCharts = useMemo(() => {
    if (!hasData) {
      return (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="bar-chart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Aucune donnée disponible
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Commencez par ajouter des relevés pour visualiser vos graphiques
          </Text>
        </View>
      );
    }

    const renderBasicChart = (data, type, title, color) => {
      const chartProps = {
        data,
        title,
        color,
        height: 240,
        showValues: true
      };

      let chartComponent;
      switch (selectedChartType) {
        case CHART_TYPES.LINE:
          chartComponent = <CustomLineChart {...chartProps} />;
          break;
        case CHART_TYPES.BAR:
          chartComponent = <CustomBarChart {...chartProps} />;
          break;
        case CHART_TYPES.PIE:
          chartComponent = <CustomPieChart {...chartProps} />;
          break;
        default:
          return null;
      }

      return (
        <View key={type} style={styles.chartSection}>
          <ChartExport
            chartComponent={chartComponent}
            chartTitle={`${title} - ${getPeriodLabel(selectedPeriod)}`}
            fileName={`${type.toLowerCase()}_${selectedChartType}`}
            onExportStart={() => console.log(`Export ${type}...`)}
            onExportSuccess={(message) => console.log(`Export ${type} réussi:`, message)}
            onExportError={(error) => console.error(`Erreur export ${type}:`, error)}
          />
        </View>
      );
    };

    const renderAdvancedChart = (data, type, title, colors) => (
      <View key={type} style={styles.chartSection}>
        <AdvancedChartContainer
          data={data}
          title={title}
          type={type}
          colors={colors}
        />
        <View style={styles.exportButtonContainer}>
          <AppButton
            title="Exporter l'analyse"
            onPress={() => handleExportChart(
              <AdvancedChartContainer
                data={data}
                title={title}
                type={type}
                colors={colors}
              />,
              `${title} - Analyse complète`
            )}
            variant="outline"
            size="small"
            icon="download-outline"
          />
        </View>
      </View>
    );

    const charts = [];

    if (selectedDataType === 'both' || selectedDataType === 'eau') {
      if (filteredDataEau.length > 0) {
        if (selectedChartType === CHART_TYPES.ADVANCED) {
          charts.push(renderAdvancedChart(
            filteredDataEau, 
            'Eau', 
            'Analyse détaillée - Eau', 
            ["#007AFF", "#5AC8FA", "#34C759", "#64D2FF"]
          ));
        } else {
          charts.push(renderBasicChart(
            filteredDataEau,
            'Eau',
            'Consommation d\'Eau',
            '#007AFF'
          ));
        }
      }
    }

    if (selectedDataType === 'both' || selectedDataType === 'electricite') {
      if (filteredDataElectricite.length > 0) {
        if (selectedChartType === CHART_TYPES.ADVANCED) {
          charts.push(renderAdvancedChart(
            filteredDataElectricite, 
            'Électricité', 
            'Analyse détaillée - Électricité', 
            ["#FF9500", "#FF3B30", "#FFD60A", "#FF9F0A"]
          ));
        } else {
          charts.push(renderBasicChart(
            filteredDataElectricite,
            'Électricité',
            'Consommation d\'Électricité',
            '#FF9500'
          ));
        }
      }
    }

    return charts;
  }, [
    hasData, colors, selectedChartType, selectedDataType, selectedPeriod,
    filteredDataEau, filteredDataElectricite, handleExportChart, getPeriodLabel
  ]);

  if (loading) {
    return <LoadingScreen message="Chargement des graphiques..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>
              📊 Graphiques Avancés
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {totalReleves} relevé(s) - Visualisations interactives
            </Text>
          </View>
          
          <AppButton 
            title="Actualiser" 
            onPress={handleRefresh}
            variant="secondary"
            size="small"
            loading={refreshing}
            icon="refresh-outline"
          />
        </View>

        {/* Sélecteurs */}
        <View style={styles.selectorsContainer}>
          <Text style={[styles.selectorLabel, { color: colors.text }]}>Période:</Text>
          {renderPeriodSelector}
          
          <Text style={[styles.selectorLabel, { color: colors.text }]}>Type de graphique:</Text>
          {renderChartTypeSelector}
          
          <Text style={[styles.selectorLabel, { color: colors.text }]}>Données:</Text>
          {renderDataTypeSelector}
        </View>

        {/* Stats rapides */}
        {hasData && (
          <View style={[styles.statsContainer, { backgroundColor: colors.primary + '15' }]}>
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={16} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {dataEau.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Relevés eau
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statItem}>
              <Ionicons name="flash-outline" size={16} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {dataElectricite.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Relevés élec.
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statItem}>
              <Ionicons name="stats-chart-outline" size={16} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {totalReleves}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Total
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Contenu des graphiques */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderCharts}

        {/* Section d'information */}
        {hasData && (
          <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              💡 Conseils d'utilisation
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              • <Text style={{ fontWeight: '600' }}>Graphique avancé</Text> : Analyse complète avec statistiques détaillées{'\n'}
              • <Text style={{ fontWeight: '600' }}>Ligne</Text> : Évolution dans le temps{'\n'}
              • <Text style={{ fontWeight: '600' }}>Barres</Text> : Comparaison mensuelle{'\n'}
              • <Text style={{ fontWeight: '600' }}>Circulaire</Text> : Répartition par type{'\n'}
              • Utilisez le bouton "Exporter" pour sauvegarder ou partager vos graphiques
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal d'export */}
      <BaseModal
        visible={exportModal.visible}
        onClose={closeExportModal}
        title="📤 Exporter le graphique"
        size="large"
      >
        {exportModal.chart && (
          <ChartExport
            chartComponent={exportModal.chart}
            chartTitle={exportModal.title}
            fileName={`export_${Date.now()}`}
            onExportStart={() => console.log('Début export...')}
            onExportSuccess={(message) => {
              console.log('Export réussi:', message);
              closeExportModal();
            }}
            onExportError={(error) => console.error('Erreur export:', error)}
          />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  selectorsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectorContainer: {
    backgroundColor: 'transparent',
  },
  selectorContent: {
    gap: 8,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectorButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
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
  },
  chartSection: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  exportButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  infoContainer: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
});