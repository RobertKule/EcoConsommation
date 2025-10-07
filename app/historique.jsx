import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteReleve, fetchReleves, insertReleve, updateReleve } from "../services/Database";

export default function Historique() {
  const [releves, setReleves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReleve, setSelectedReleve] = useState(null);
  const [type, setType] = useState("");
  const [indexVal, setIndexVal] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadReleves = () => {
    setLoading(true);
    fetchReleves(
      (data) => {
        setReleves(data);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur récupération relevés:", error);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    loadReleves();
  }, []);

  const handleDelete = (id) => {
    Alert.alert(
      "Supprimer relevé",
      "Voulez-vous vraiment supprimer ce relevé ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            deleteReleve(id, loadReleves, (error) =>
              console.error("Erreur suppression :", error)
            );
          },
        },
      ]
    );
  };

  const handleEdit = (releve) => {
    setSelectedReleve(releve);
    setType(releve.type);
    setIndexVal(releve.index_val.toString());
    setDate(new Date(releve.date));
    setModalVisible(true);
  };

  const handleAdd = () => {
    setSelectedReleve(null);
    setType("");
    setIndexVal("");
    setDate(new Date());
    setModalVisible(true);
  };

  
  const handleSave = () => {
  if (!type || !indexVal) {
    Alert.alert("Erreur", "Veuillez remplir tous les champs.");
    return;
  }

  const dateStr = date ? date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

  if (selectedReleve) {
    // Modification
    updateReleve(
      selectedReleve.id,
      type,
      parseInt(indexVal),
      dateStr,
      () => {
        setModalVisible(false);
        loadReleves();
      },
      (error) => {
        console.error("Erreur modification relevé:", error);
      }
    );
  } else {
    // Ajout
    insertReleve(
      type,
      parseInt(indexVal),
      dateStr,
      () => {
        setModalVisible(false);
        loadReleves();
      },
      (error) => {
        console.error("Erreur ajout relevé:", error);
      }
    );
  }
};


  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.type}>
        {item.type === "Eau" ? "💧 Eau" : "⚡ Électricité"}
      </Text>
      <Text style={styles.index}>Index : {item.index_val}</Text>
      <Text style={styles.date}>{item.date}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const sortByDate = () => {
    setReleves([...releves].sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique des relevés</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.sortButton} onPress={sortByDate}>
        <Text style={styles.sortButtonText}>Trier par date ↓</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} />
      ) : releves.length === 0 ? (
        <Text style={styles.empty}>Aucun relevé pour le moment.</Text>
      ) : (
        <FlatList
          data={releves}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator
        />
      )}

      {/* Modal ajout / modification */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedReleve ? "Modifier le relevé" : "Ajouter un relevé"}
            </Text>

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

            <Text style={styles.label}>Index relevé</Text>
            <TextInput
              style={styles.input}
              value={indexVal}
              onChangeText={setIndexVal}
              placeholder="Ex: 245"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Date du relevé</Text>
            <Pressable
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {date.toISOString().split("T")[0]}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.saveButtonModal]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
  addButton: { backgroundColor: "#28a745", padding: 8, borderRadius: 6 },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  sortButton: { alignSelf: "flex-end", marginVertical: 10 },
  sortButtonText: { color: "#007AFF" },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#888" },
  list: { paddingBottom: 20 },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  type: { fontSize: 18, fontWeight: "bold" },
  index: { fontSize: 16, marginTop: 5 },
  date: { fontSize: 14, color: "#666", marginTop: 5 },
  buttonContainer: { flexDirection: "row", marginTop: 10, justifyContent: "flex-end" },
  button: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginLeft: 10 },
  editButton: { backgroundColor: "#007AFF" },
  deleteButton: { backgroundColor: "#FF3B30" },
  buttonText: { color: "#fff", fontWeight: "bold" },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 15, width: "90%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  label: { fontSize: 16, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 20, backgroundColor: "#fff" },
  typeContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  typeButton: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#007AFF", width: "40%", alignItems: "center" },
  typeButtonActive: { backgroundColor: "#007AFF" },
  typeText: { color: "#007AFF", fontWeight: "600" },
  typeTextActive: { color: "#fff" },
  datePickerButton: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 20 },
  datePickerText: { fontSize: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: { padding: 10, borderRadius: 8, flex: 1, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#ccc" },
  saveButtonModal: { backgroundColor: "#007AFF" },
});
