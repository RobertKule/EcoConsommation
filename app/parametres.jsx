import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Parametres() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType("");
  };

  const getModalContent = () => {
    switch (modalType) {
      case "profile":
        return "👤 Ici vous pouvez modifier votre profil utilisateur.";
      case "preferences":
        return "🛠 Ici vous pouvez changer vos préférences.";
      case "about":
        return "ℹ️ EcoConsommation v1.0\nDéveloppé avec ❤️.";
      case "reset":
        return "⚠️ Êtes-vous sûr de vouloir réinitialiser toutes vos données ?";
      default:
        return "";
    }
  };

  const handleAction = () => {
    if (modalType === "reset") {
      console.log("Réinitialisation effectuée"); // Ici tu mets ta fonction de reset
    }
    closeModal();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Paramètres</Text>

      {/* Boutons paramètres */}
      <TouchableOpacity style={styles.optionButton} onPress={() => openModal("profile")}>
        <Text style={styles.optionText}>👤 Mon profil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={() => openModal("preferences")}>
        <Text style={styles.optionText}>🛠 Préférences</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={() => openModal("about")}>
        <Text style={styles.optionText}>ℹ️ À propos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.optionButton, styles.optionButtonDestructive]} onPress={() => openModal("reset")}>
        <Text style={[styles.optionText, styles.optionTextDestructive]}>🗑 Réinitialiser les données</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{getModalContent()}</Text>

            {modalType === "reset" ? (
              <View style={styles.modalButtons}>
                <Pressable style={styles.cancelButton} onPress={closeModal}>
                  <Text style={styles.modalButtonText}>Annuler</Text>
                </Pressable>
                <Pressable style={styles.confirmButton} onPress={handleAction}>
                  <Text style={styles.modalButtonText}>Confirmer</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.modalButtonText}>Fermer</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#007AFF",
  },
  optionButton: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#007AFF",
  },
  optionButtonDestructive: {
    borderColor: "#ff4d4d",
    backgroundColor: "#ffe6e6",
  },
  optionTextDestructive: {
    color: "#ff4d4d",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    width: "85%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#ff4d4d",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "60%",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
