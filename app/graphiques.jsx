import { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { fetchReleves } from "../services/Database";

export default function Graphiques() {
  const [dataEau, setDataEau] = useState([]);
  const [dataElectricite, setDataElectricite] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, point: null });

  useEffect(() => {
    fetchReleves(
      (releves) => {
        setDataEau(releves.filter((r) => r.type === "Eau"));
        setDataElectricite(releves.filter((r) => r.type === "Électricité"));
      },
      (err) => console.error(err)
    );
  }, []);

  const generateChartData = (data) => ({
    labels: data.map((r) => r.date),
    datasets: [
      {
        data: data.map((r) => r.index_val),
        strokeWidth: 2,
      },
    ],
  });

  const chartConfig = {
    backgroundGradientFrom: "#f8f9fa",
    backgroundGradientTo: "#f8f9fa",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    labelColor: () => "#333",
  };

  const screenWidth = Dimensions.get("window").width;

  const handleDataPointClick = (data) => {
    setTooltip({ visible: true, point: data });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Graphiques de consommation</Text>

      {dataEau.length > 0 && (
        <>
          <Text style={styles.subtitle}>💧 Eau</Text>
          <LineChart
            data={generateChartData(dataEau)}
            width={screenWidth - 20}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            onDataPointClick={handleDataPointClick}
          />
        </>
      )}

      {dataElectricite.length > 0 && (
        <>
          <Text style={styles.subtitle}>⚡ Électricité</Text>
          <LineChart
            data={generateChartData(dataElectricite)}
            width={screenWidth - 20}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            onDataPointClick={handleDataPointClick}
          />
        </>
      )}

      {dataEau.length === 0 && dataElectricite.length === 0 && (
        <Text style={styles.noData}>Aucune donnée disponible.</Text>
      )}

      {/* --- Modal Tooltip --- */}
      <Modal
        visible={tooltip.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltip({ visible: false, point: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📊 Détails du point</Text>
            {tooltip.point && (
              <>
                <Text>Date : {tooltip.point.label}</Text>
                <Text>Valeur : {tooltip.point.value}</Text>
              </>
            )}
            <Pressable
              style={styles.modalButton}
              onPress={() => setTooltip({ visible: false, point: null })}
            >
              <Text style={styles.modalButtonText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#007AFF",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    marginBottom: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 15,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
