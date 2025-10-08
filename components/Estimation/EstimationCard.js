import { StyleSheet, Text, View } from "react-native";

export default function EstimationCard({ type, estimation, icon }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.type}>{type}</Text>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Consommation :</Text>
          <Text style={styles.value}>{estimation.consommation} {type === "Eau" ? "L" : "kWh"}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.label}>Estimation :</Text>
          <Text style={styles.estimationValue}>{estimation.estimation} €</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.label}>Période :</Text>
          <Text style={styles.value}>{estimation.periode}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  type: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
  details: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  estimationValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
});