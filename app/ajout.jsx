import { View, Text, StyleSheet, TextInput, Button } from "react-native";

export default function Ajout() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un relevé</Text>
      <TextInput style={styles.input} placeholder="Type (Eau/Électricité)" />
      <TextInput style={styles.input} placeholder="Index" keyboardType="numeric" />
      <Button title="Enregistrer" onPress={() => alert("Relevé ajouté")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginVertical: 10,
    padding: 10,
  },
});
