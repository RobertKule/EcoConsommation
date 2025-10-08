import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
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

const chartTypes = [
  { key: "line", label: "Ligne", icon: "analytics-outline" },
  { key: "bar", label: "Barres", icon: "bar-chart-outline" },
  { key: "pie", label: "Circulaire", icon: "pie-chart-outline" },
  { key: "progress", label: "Progression", icon: "trending-up-outline" },
];

export default function ChartSelector({ selectedType, onTypeChange }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Type de graphique :</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buttonsContainer}
      >
        {chartTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.chartButton,
              { 
                backgroundColor: colors.card,
                borderColor: colors.primary,
              },
              selectedType === type.key && [styles.chartButtonActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => onTypeChange(type.key)}
          >
            <Ionicons
              name={type.icon}
              size={20}
              color={selectedType === type.key ? "#fff" : colors.primary}
            />
            <Text
              style={[
                styles.chartButtonText,
                { color: selectedType === type.key ? "#fff" : colors.primary },
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 20,
  },
  chartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 6,
    minWidth: 100,
  },
  chartButtonActive: {
    borderColor: 'transparent',
  },
  chartButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});