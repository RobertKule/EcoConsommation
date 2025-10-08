import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import AppButton from "../Button/AppButton";

const STORAGE_KEY = "@EcoConsommation_prices";

export default function EstimationConfig({ onClose }) {
  const [prices, setPrices] = useState({
    Eau: "0.003",
    Électricité: "0.18",
  });

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPrices(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erreur chargement prix:", error);
    }
  };

  const savePrices = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
      alert("Prix enregistrés avec succès !");
      onClose();
    } catch (error) {
      console.error("Erreur sauvegarde prix:", error);
      alert("Erreur lors de l'enregistrement des prix");
    }
  };

  const handlePriceChange = (type, value) => {
    setPrices(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Prix unitaires</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>💧 Eau (€/litre)</Text>
        <TextInput
          style={styles.input}
          value={prices.Eau}
          onChangeText={(value) => handlePriceChange("Eau", value)}
          keyboardType="decimal-pad"
          placeholder="0.003"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>⚡ Électricité (€/kWh)</Text>
        <TextInput
          style={styles.input}
          value={prices.Électricité}
          onChangeText={(value) => handlePriceChange("Électricité", value)}
          keyboardType="decimal-pad"
          placeholder="0.18"
        />
      </View>

      <View style={styles.buttonContainer}>
        <AppButton
          title="Annuler"
          onPress={onClose}
          variant="secondary"
          style={styles.button}
        />
        <AppButton
          title="Enregistrer"
          onPress={savePrices}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});