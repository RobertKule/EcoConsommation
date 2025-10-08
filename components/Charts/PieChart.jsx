import { useMemo } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const Colors = {
  light: {
    text: '#1a1a1a',
    textSecondary: '#666',
    background: '#ffffff',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#98989f',
    background: '#1c1c1e',
  }
};

export default function CustomPieChart({ 
  data, 
  title, 
  height = 220,
  accessor = "value"
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { name: 'Aucune donnée', value: 1, color: '#999', legendFontColor: colors.textSecondary }
      ];
    }

    // Calculer la consommation totale par type
    const consumptionByType = data.reduce((acc, item) => {
      const type = item.type;
      const value = parseFloat(item.index_val);
      
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += value;
      return acc;
    }, {});

    const colorsPalette = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#FF2D55'];

    return Object.entries(consumptionByType).map(([type, value], index) => ({
      name: type,
      value: Math.round(value),
      color: colorsPalette[index % colorsPalette.length],
      legendFontColor: colors.text,
      legendFontSize: 12
    }));
  }, [data, colors.textSecondary, colors.text]);

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const total = useMemo(() => 
    chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Données insuffisantes pour le graphique
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      
      <PieChart
        data={chartData}
        width={width - 40}
        height={height}
        chartConfig={chartConfig}
        accessor={accessor}
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        hasLegend={true}
      />
      
      <View style={styles.summary}>
        <Text style={[styles.total, { color: colors.text }]}>
          Total: {total} {data[0]?.type === 'Eau' ? 'L' : 'kWh'}
        </Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {data.length} relevé(s)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyState: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  total: {
    fontSize: 14,
    fontWeight: '600',
  },
  count: {
    fontSize: 12,
  },
});