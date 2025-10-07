import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomModal from "../components/CustomModal"; // 📌 Assure-toi d’avoir créé ce composant

export default function Index() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    // Exemple d'utilisation du modal
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EcoConsommation</Text>
      <Text style={styles.subtitle}>Suivi de consommation Eau & Électricité</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/ajout")}>
        <Text style={styles.buttonText}>Ajouter un relevé</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handlePress}>
        <Text style={styles.buttonText}>Afficher Modal</Text>
      </TouchableOpacity>

      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Bienvenue sur EcoConsommation"
        message="Suivez facilement votre consommation d'eau et d'électricité !"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#007AFF",
  },
  subtitle: {
    fontSize: 16,
    marginVertical: 10,
    color: "#555",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
  },
  secondaryButton: {
    backgroundColor: "#28a745",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
