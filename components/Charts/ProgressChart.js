import { Dimensions, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";

const screenWidth = Dimensions.get("window").width;

const Colors = {
  light: {
    primary: "#007AFF",
    background: "#f8faff",
    card: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666",
  },
  dark: {
    primary: "#0A84FF",
    background: "#000000",
    card: "#1c1c1e",
    text: "#ffffff",
    textSecondary: "#98989f",
  }
};

export default function ProgressChart({ data, width = screenWidth - 40, height = 240 }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;

  if (!data || data.length === 0) return null;

  // Calculer la progression
  const progressionData = calculateProgression(data);
  const maxValue = Math.max(...progressionData.map(d => d.consumption));

  return (
    <View style={[styles.container, { width, height, backgroundColor: colors.card }]}>
      <Text style={[styles.chartTitle, { color: colors.text }]}>Progression de la consommation</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.barsContainer}>
          {progressionData.map((item, index) => (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: `${(item.consumption / maxValue) * 80}%`,
                      backgroundColor: getBarColor(index, progressionData.length)
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{item.period}</Text>
              <Text style={[styles.barValue, { color: colors.text }]}>{item.consumption}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const calculateProgression = (data) => {
  if (data.length < 2) return [];

  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const progression = [];

  for (let i = 1; i < sortedData.length; i++) {
    const consumption = sortedData[i].index_val - sortedData[i - 1].index_val;
    const startDate = new Date(sortedData[i - 1].date);
    const endDate = new Date(sortedData[i].date);
    
    progression.push({
      period: `${startDate.getDate()}/${startDate.getMonth() + 1}`,
      consumption: Math.max(0, consumption), // Éviter les valeurs négatives
    });
  }

  return progression;
};

const getBarColor = (index, total) => {
  const colors = ["#007AFF", "#34C759", "#FF9500", "#FF3B30", "#5856D6", "#AF52DE"];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  scrollContent: {
    paddingRight: 20,
  },
  barsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    height: "80%",
    gap: 16,
  },
  barWrapper: {
    alignItems: "center",
    minWidth: 50,
  },
  barContainer: {
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: 24,
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  barValue: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
  },
});