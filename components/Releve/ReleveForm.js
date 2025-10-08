import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import AppButton from "../Button/AppButton";
import TypeSelector from "../Input/TypeSelector";

// Couleurs pour les thèmes
const Colors = {
  light: {
    background: "#f8faff",
    text: "#1a1a1a",
    textSecondary: "#666",
    border: "#ccc",
    placeholder: "#999",
    card: "#ffffff",
  },
  dark: {
    background: "#000000",
    text: "#ffffff",
    textSecondary: "#98989f",
    border: "#38383a",
    placeholder: "#6d6d6f",
    card: "#1c1c1e",
  }
};

export default function ReleveForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitButtonText = "Enregistrer",
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  
  const [type, setType] = useState(initialData.type || "");
  const [indexVal, setIndexVal] = useState(initialData.indexVal?.toString() || "");
  const [date, setDate] = useState(initialData.date ? new Date(initialData.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const typeOptions = [
    { value: "Eau", label: "💧 Eau" },
    { value: "Électricité", label: "⚡ Électricité" },
  ];

  const handleSubmit = () => {
    if (!type || !indexVal) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const dateStr = date.toISOString().split("T")[0];
    onSubmit({
      type,
      indexVal: parseInt(indexVal),
      date: dateStr,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.label, { color: colors.text }]}>Type de relevé</Text>
      <TypeSelector
        value={type}
        onValueChange={setType}
        options={typeOptions}
      />

      <Text style={[styles.label, { color: colors.text }]}>Index relevé</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text
          }
        ]}
        value={indexVal}
        onChangeText={setIndexVal}
        placeholder="Ex: 245"
        placeholderTextColor={colors.placeholder}
        keyboardType="numeric"
      />

      <Text style={[styles.label, { color: colors.text }]}>Date du relevé</Text>
      <AppButton
        title={date.toISOString().split("T")[0]}
        onPress={() => setShowDatePicker(true)}
        variant="secondary"
        textStyle={styles.buttonText}
      />

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
          themeVariant={colorScheme}
        />
      )}

      <View style={styles.buttonContainer}>
  <AppButton
    title="Annuler"
    onPress={onCancel}
    variant="secondary"
    style={styles.cancelButton}
    textStyle={styles.buttonText}
    
  />
  <AppButton
    title={submitButtonText}
    onPress={handleSubmit}
    disabled={!type || !indexVal}
    style={styles.submitButton}
    textStyle={styles.buttonText}
    
  />
</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    fontSize: 16,
    minHeight: 52,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  cancelButton: {
    width: 'auto',
    minHeight: 44,
    paddingVertical: 10, // Réduit le padding interne
  },
  submitButton: {
    width: 'auto',
    minHeight: 44,
    paddingVertical: 10, // Réduit le padding interne
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});