import { useMemo } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const Colors = {
  light: {
    text: '#1a1a1a',
    textSecondary: '#666',
    background: '#ffffff',
    grid: '#f0f0f0',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#98989f',
    background: '#1c1c1e',
    grid: '#38383a',
  }
};

export default function CustomBarChart({ 
  data, 
  title, 
  color = '#34C759',
  height = 220,
  showValues = true 
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: ['Aucune', 'donnée'],
        datasets: [{ data: [0, 0] }]
      };
    }

    // Grouper par mois pour le bar chart
    const monthlyData = data.reduce((acc, item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          total: 0,
          count: 0,
          dates: []
        };
      }
      
      acc[monthKey].total += parseFloat(item.index_val);
      acc[monthKey].count++;
      acc[monthKey].dates.push(date);
      
      return acc;
    }, {});

    const labels = Object.keys(monthlyData).map(key => {
      const [year, month] = key.split('-');
      return `${month}/${year.slice(2)}`;
    });

    const values = Object.values(monthlyData).map(month => 
      Math.round(month.total / month.count)
    );

    return {
      labels: labels.slice(-6), // Derniers 6 mois
      datasets: [{ data: values.slice(-6) }]
    };
  }, [data]);

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => color || `rgba(52, 199, 89, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${colorScheme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      stroke: colors.grid,
      strokeWidth: 1,
    },
    barPercentage: 0.7,
  };

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
      
      <BarChart
        data={chartData}
        width={width - 40}
        height={height}
        chartConfig={chartConfig}
        style={styles.chart}
        showValuesOnTopOfBars={true}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        fromZero={true}
        segments={5}
      />
      
      {showValues && (
        <View style={styles.stats}>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            Période: {chartData.labels[0]} - {chartData.labels[chartData.labels.length - 1]}
          </Text>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            Moyenne: {Math.round(chartData.datasets[0].data.reduce((a, b) => a + b, 0) / chartData.datasets[0].data.length)}
          </Text>
        </View>
      )}
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  stat: {
    fontSize: 12,
    fontWeight: '500',
  },
});