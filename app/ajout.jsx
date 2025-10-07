import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { initDB, insertReleve } from "../services/Database"; // ✅ ton fichier DB

export default function AjoutScreen() {
  const [type, setType] = useState("");
  const [indexVal, setIndexVal] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Initialisation de la base dès le chargement
  useEffect(() => {
    initDB();
  }, []);

  const handleSave = () => {
    if (!type || !indexVal) {
      alert("Veuillez remplir tous les champs avant de continuer.");
      return;
    }

    setLoading(true);
    const date = new Date().toISOString().split("T")[0];

    insertReleve(
      type,
      parseInt(indexVal),
      date,
      () => {
        setLoading(false);
        setModalVisible(true);
        setIndexVal("");
        setType("");
      },
      (error) => {
        setLoading(false);
        alert("Erreur lors de l'enregistrement : " + error.message);
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Ajouter un relevé</Text>

      {/* Sélection du type */}
      <Text style={styles.label}>Type de relevé</Text>
      <View style={styles.typeContainer}>
        {["Eau", "Électricité"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.typeButton,
              type === item && styles.typeButtonActive,
            ]}
            onPress={() => setType(item)}
          >
            <Text
              style={[
                styles.typeText,
                type === item && styles.typeTextActive,
              ]}
            >
              {item === "Eau" ? "💧 Eau" : "⚡ Électricité"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Champ d’index */}
      <Text style={styles.label}>Index relevé</Text>
      <TextInput
        style={styles.input}
        value={indexVal}
        onChangeText={setIndexVal}
        placeholder="Ex: 245"
        keyboardType="numeric"
      />

      {/* Bouton d’enregistrement */}
      <TouchableOpacity
        onPress={handleSave}
        style={[
          styles.saveButton,
          (!type || !indexVal || loading) && styles.saveButtonDisabled,
        ]}
        disabled={!type || !indexVal || loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Text>
      </TouchableOpacity>

      {/* Modal de confirmation */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✅ Ajout réussi !</Text>
            <Text style={styles.modalText}>
              Votre relevé a été enregistré avec succès.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 25,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  typeButton: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    width: "40%",
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#007AFF",
  },
  typeText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  typeTextActive: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#A0CFFF",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
