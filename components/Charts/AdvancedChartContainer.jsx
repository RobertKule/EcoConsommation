import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import CustomBarChart from './BarChart';
import CustomLineChart from './LineChart';
import CustomPieChart from './PieChart';

const { width } = Dimensions.get('window');

const Colors = {
  light: {
    primary: "#007AFF",
    background: "#f8faff",
    card: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666",
    border: "#f0f0f0",
  },
  dark: {
    primary: "#0A84FF",
    background: "#000000",
    card: "#1c1c1e",
    text: "#ffffff",
    textSecondary: "#98989f",
    border: "#38383a",
  }
};

const CHART_TYPES = {
  LINE: { key: 'line', label: 'Ligne', icon: 'trending-up' },
  BAR: { key: 'bar', label: 'Barres', icon: 'bar-chart' },
  PIE: { key: 'pie', label: 'Circulaire', icon: 'pie-chart' },
};

export default function AdvancedChartContainer({ 
  data, 
  title, 
  type = 'Eau',
  colors = ["#007AFF", "#5AC8FA", "#34C759", "#64D2FF"],
  onDataPointClick 
}) {
  const colorScheme = useColorScheme();
  const colorsTheme = Colors[colorScheme] || Colors.light;
  const [selectedChart, setSelectedChart] = useState('line');

  const filteredData = useMemo(() => 
    data.filter(item => item.type === type),
    [data, type]
  );

  const chartColor = useMemo(() => 
    type === 'Eau' ? '#007AFF' : '#FF9500',
    [type]
  );

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const values = filteredData.map(item => parseFloat(item.index_val));
    const total = values.reduce((a, b) => a + b, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { total, average, max, min, count: values.length };
  }, [filteredData]);

  const renderChart = () => {
    if (filteredData.length === 0) {
      return (
        <View style={[styles.emptyContainer, { backgroundColor: colorsTheme.card }]}>
          <Ionicons name="stats-chart" size={48} color={colorsTheme.textSecondary} />
          <Text style={[styles.emptyText, { color: colorsTheme.text }]}>
            Aucune donnée pour {type}
          </Text>
          <Text style={[styles.emptySubtext, { color: colorsTheme.textSecondary }]}>
            Ajoutez des relevés pour voir les graphiques
          </Text>
        </View>
      );
    }

    switch (selectedChart) {
      case 'line':
        return (
          <CustomLineChart
            data={filteredData}
            title={`📈 Évolution - ${type}`}
            color={chartColor}
            height={240}
            bezier={true}
            showValues={true}
          />
        );
      
      case 'bar':
        return (
          <CustomBarChart
            data={filteredData}
            title={`📊 Comparaison mensuelle - ${type}`}
            color={chartColor}
            height={240}
            showValues={true}
          />
        );
      
      case 'pie':
        return (
          <CustomPieChart
            data={filteredData}
            title={`🥧 Répartition - ${type}`}
            height={240}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorsTheme.background }]}>
      {/* En-tête avec titre et sélecteur */}
      <View style={[styles.header, { backgroundColor: colorsTheme.card }]}>
        <View style={styles.titleContainer}>
          <Ionicons 
            name={type === 'Eau' ? 'water' : 'flash'} 
            size={20} 
            color={chartColor} 
          />
          <Text style={[styles.title, { color: colorsTheme.text }]}>
            {title || `Analyses ${type}`}
          </Text>
        </View>
        
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={[styles.stat, { color: colorsTheme.textSecondary }]}>
              {stats.count} relevés
            </Text>
            <Text style={[styles.stat, { color: colorsTheme.textSecondary }]}>
              Moy: {Math.round(stats.average)}
            </Text>
          </View>
        )}
      </View>

      {/* Sélecteur de type de graphique */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.selectorContainer}
        contentContainerStyle={styles.selectorContent}
      >
        {Object.values(CHART_TYPES).map((chartType) => (
          <TouchableOpacity
            key={chartType.key}
            style={[
              styles.chartTypeButton,
              {
                backgroundColor: selectedChart === chartType.key 
                  ? colorsTheme.primary 
                  : colorsTheme.card,
                borderColor: colorsTheme.border,
              }
            ]}
            onPress={() => setSelectedChart(chartType.key)}
          >
            <Ionicons 
              name={chartType.icon} 
              size={16} 
              color={selectedChart === chartType.key ? '#fff' : colorsTheme.textSecondary} 
            />
            <Text style={[
              styles.chartTypeText,
              { 
                color: selectedChart === chartType.key 
                  ? '#fff' 
                  : colorsTheme.textSecondary 
              }
            ]}>
              {chartType.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Graphique */}
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {/* Statistiques détaillées */}
      {stats && (
        <View style={[styles.detailedStats, { backgroundColor: colorsTheme.card }]}>
          <Text style={[styles.detailedTitle, { color: colorsTheme.text }]}>
            📋 Statistiques détaillées
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: chartColor }]}>
                {Math.round(stats.total)}
              </Text>
              <Text style={[styles.statLabel, { color: colorsTheme.textSecondary }]}>
                Total
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: chartColor }]}>
                {Math.round(stats.average)}
              </Text>
              <Text style={[styles.statLabel, { color: colorsTheme.textSecondary }]}>
                Moyenne
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: chartColor }]}>
                {stats.max}
              </Text>
              <Text style={[styles.statLabel, { color: colorsTheme.textSecondary }]}>
                Maximum
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: chartColor }]}>
                {stats.min}
              </Text>
              <Text style={[styles.statLabel, { color: colorsTheme.textSecondary }]}>
                Minimum
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectorContainer: {
    backgroundColor: 'transparent',
  },
  selectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chartTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chartTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    paddingHorizontal: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    margin: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  detailedStats: {
    padding: 16,
    margin: 8,
    borderRadius: 12,
  },
  detailedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});