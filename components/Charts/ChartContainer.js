import { Dimensions, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import ProgressChart from "./ProgressChart";

const screenWidth = Dimensions.get("window").width;

// Couleurs pour les thèmes
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

export default function ChartContainer({ 
  data, 
  type, 
  title, 
  onDataPointClick,
  colors = ["#007AFF", "#34C759", "#FF9500", "#FF3B30"] 
}) {
  const colorScheme = useColorScheme();
  const colorsTheme = Colors[colorScheme] || Colors.light;

  const chartConfig = {
    backgroundGradientFrom: colorsTheme.card,
    backgroundGradientTo: colorsTheme.card,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
    labelColor: () => colorsTheme.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#007AFF"
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: colorScheme === 'dark' ? "#38383a" : "#e0e0e0",
      strokeWidth: 1,
    },
  };

  const pieChartConfig = {
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
    labelColor: () => colorsTheme.text,
  };

  const renderChart = () => {
    if (!data || data.length === 0) return null;

    const chartData = generateChartData(data);

    switch (type) {
      case "line":
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={chartData}
              width={Math.max(screenWidth - 40, chartData.labels.length * 60)}
              height={240}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              onDataPointClick={onDataPointClick}
              withVerticalLines={true}
              withHorizontalLines={true}
              withShadow={true}
              withInnerLines={true}
            />
          </ScrollView>
        );
      
      case "bar":
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={chartData}
              width={Math.max(screenWidth - 40, chartData.labels.length * 60)}
              height={240}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars={true}
              withCustomBarColorFromData={true}
              flatColor={true}
            />
          </ScrollView>
        );
      
      case "pie":
        return (
          <View style={styles.pieContainer}>
            <PieChart
              data={generatePieData(data)}
              width={screenWidth - 40}
              height={200}
              chartConfig={pieChartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <ScrollView 
              style={styles.legendScrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.legendContainer}>
                {generatePieData(data).map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View 
                      style={[
                        styles.legendColor, 
                        { backgroundColor: item.color }
                      ]} 
                    />
                    <Text style={[styles.legendText, { color: colorsTheme.text }]}>
                      {item.name}: {item.population}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        );
      
      case "progress":
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <ProgressChart
              data={data}
              width={Math.max(screenWidth - 40, data.length * 80)}
              height={240}
            />
          </ScrollView>
        );
      
      default:
        return (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={chartData}
              width={Math.max(screenWidth - 40, chartData.labels.length * 60)}
              height={240}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </ScrollView>
        );
    }
  };

  const generateChartData = (data) => {
    const labels = data.map((r) => {
      const date = new Date(r.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    return {
      labels,
      datasets: [
        {
          data: data.map((r) => r.index_val),
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const generatePieData = (data) => {
    if (data.length === 0) return [];
    
    // Grouper par mois pour éviter trop d'éléments
    const monthlyData = data.reduce((acc, item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += item.index_val;
      
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, total], index) => ({
      name: `Mois ${month}`,
      population: Math.round(total),
      color: colors[index % colors.length],
      legendFontColor: colorsTheme.text,
      legendFontSize: 12,
    }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colorsTheme.card }]}>
      <Text style={[styles.title, { color: colorsTheme.text }]}>{title}</Text>
      {renderChart()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  pieContainer: {
    alignItems: "center",
  },
  legendScrollContainer: {
    maxHeight: 120,
    width: "100%",
  },
  legendContainer: {
    marginTop: 10,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
});