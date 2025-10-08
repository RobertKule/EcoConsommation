import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";
import { initDB, insertReleve } from "../services/Database"; // ✅ IMPORT CORRIGÉ

// Couleurs pour les thèmes
const Colors = {
  light: {
    primary: "#007AFF",
    background: "#f8faff",
    card: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666",
    border: "#e5e5e7",
    success: "#34C759",
    overlay: "rgba(0, 0, 0, 0.5)"
  },
  dark: {
    primary: "#0A84FF",
    background: "#000000",
    card: "#1c1c1e",
    text: "#ffffff",
    textSecondary: "#98989f",
    border: "#38383a",
    success: "#30D158",
    overlay: "rgba(0, 0, 0, 0.7)"
  }
};

export default function AjoutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  
  const [type, setType] = useState("");
  const [indexVal, setIndexVal] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

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

  const getPlaceholder = () => {
    if (type === "Eau") return "Ex: 245 (en litres)";
    if (type === "Électricité") return "Ex: 1250 (en kWh)";
    return "Entrez la valeur de l'index";
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* En-tête */}
        <View style={styles.header}>
          <Ionicons name="add-circle" size={32} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            Nouveau relevé
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ajoutez un relevé d'eau ou d'électricité
          </Text>
        </View>

        {/* Section Type */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="water-outline" size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Type de relevé
            </Text>
          </View>
          
          <View style={styles.typeContainer}>
            {["Eau", "Électricité"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.typeButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  type === item && [styles.typeButtonActive, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setType(item)}
              >
                <Text
                  style={[
                    styles.typeText,
                    { color: colors.primary },
                    type === item && styles.typeTextActive,
                  ]}
                >
                  {item === "Eau" ? "💧 Eau" : "⚡ Électricité"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section Index */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="speedometer-outline" size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Valeur de l'index
            </Text>
          </View>
          
          <View style={[
            styles.inputContainer,
            { 
              backgroundColor: colors.card,
              borderColor: focusedInput === 'index' ? colors.primary : colors.border
            }
          ]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={indexVal}
              onChangeText={setIndexVal}
              placeholder={getPlaceholder()}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              onFocus={() => setFocusedInput('index')}
              onBlur={() => setFocusedInput(null)}
            />
            {type && (
              <Text style={[styles.unit, { color: colors.textSecondary }]}>
                {type === "Eau" ? "L" : "kWh"}
              </Text>
            )}
          </View>
        </View>

        {/* Bouton d'enregistrement */}
        <TouchableOpacity
          onPress={handleSave}
          style={[
            styles.saveButton,
            { backgroundColor: colors.primary },
            (!type || !indexVal || loading) && styles.saveButtonDisabled,
          ]}
          disabled={!type || !indexVal || loading}
        >
          {loading ? (
            <Ionicons name="time-outline" size={20} color="#fff" />
          ) : (
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>
            {loading ? "Enregistrement..." : "Enregistrer le relevé"}
          </Text>
        </TouchableOpacity>

        {/* Aide */}
        <View style={[styles.tipContainer, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.primary }]}>
            {type 
              ? `Entrez la valeur de votre compteur ${type.toLowerCase()} en ${type === "Eau" ? "litres" : "kWh"}`
              : "Sélectionnez d'abord le type de relevé"
            }
          </Text>
        </View>
      </ScrollView>

      {/* Modal de confirmation */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              ✅ Relevé enregistré !
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Votre relevé a été ajouté avec succès à l'historique.
            </Text>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Continuer</Text>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    minHeight: 60,
    justifyContent: 'center',
  },
  typeButtonActive: {
    borderColor: 'transparent',
  },
  typeText: {
    fontSize: 15,
    fontWeight: "600",
  },
  typeTextActive: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 8,
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    gap: 8,
    minHeight: 56,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: 'center',
  },
});