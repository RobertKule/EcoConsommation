import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ReleveModal from "../components/ReleveModal";
import { deleteReleve, fetchReleves, insertReleve, updateReleve } from "../services/Database";

export default function Historique() {
  const [releves, setReleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReleve, setSelectedReleve] = useState(null);

  const loadReleves = () => {
    setLoading(true);
    fetchReleves((data) => { setReleves(data); setLoading(false); }, (err) => { console.error(err); setLoading(false); });
  };

  useEffect(() => { loadReleves(); }, []);

  const handleDelete = (id) => {
    Alert.alert("Supprimer ?", "Voulez-vous vraiment supprimer ce relevé ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => deleteReleve(id, loadReleves) },
    ]);
  };

  const handleSave = ({ id, type, index_val, date }) => {
    if (id) {
      updateReleve(id, type, index_val, date, loadReleves, (err) => console.error(err));
    } else {
      insertReleve(type, index_val, date, loadReleves, (err) => console.error(err));
    }
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.type}>{item.type === "Eau" ? "💧 Eau" : "⚡ Électricité"}</Text>
      <Text>Index: {item.index_val}</Text>
      <Text>Date: {item.date}</Text>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 5 }}>
        <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => { setSelectedReleve(item); setModalVisible(true); }}>
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDelete(item.id)}>
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => { setSelectedReleve(null); setModalVisible(true); }}>
        <Text style={styles.addButtonText}>+ Ajouter</Text>
      </TouchableOpacity>

      {loading ? <ActivityIndicator /> : (
        <FlatList data={releves} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} />
      )}

      <ReleveModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={handleSave} releve={selectedReleve} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  addButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  item: { backgroundColor: "#fff", padding: 15, marginBottom: 10, borderRadius: 10, shadowColor: "#000", shadowOpacity: 0.1, elevation: 2 },
  type: { fontWeight: "bold", fontSize: 16 },
  button: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, marginLeft: 5 },
  editButton: { backgroundColor: "#007AFF" },
  deleteButton: { backgroundColor: "#FF3B30" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
