import { useMemo } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

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

export default function CustomLineChart({ 
  data, 
  title, 
  color = '#007AFF',
  height = 220,
  bezier = true,
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

    const labels = data.map(item => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const values = data.map(item => parseFloat(item.index_val));

    return {
      labels: labels.length > 10 ? labels.slice(-10) : labels,
      datasets: [{ data: values.length > 10 ? values.slice(-10) : values }]
    };
  }, [data]);

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => color || `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${colorScheme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: color,
    },
    propsForBackgroundLines: {
      stroke: colors.grid,
      strokeWidth: 1,
    },
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
      
      <LineChart
        data={chartData}
        width={width - 40}
        height={height}
        chartConfig={chartConfig}
        bezier={bezier}
        style={styles.chart}
        withVerticalLines={true}
        withHorizontalLines={true}
        withInnerLines={true}
        withOuterLines={true}
        withShadow={true}
        withDots={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={false}
        segments={5}
      />
      
      {showValues && (
        <View style={styles.stats}>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            Min: {Math.min(...chartData.datasets[0].data)}
          </Text>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            Max: {Math.max(...chartData.datasets[0].data)}
          </Text>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            Moy: {Math.round(chartData.datasets[0].data.reduce((a, b) => a + b, 0) / chartData.datasets[0].data.length)}
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