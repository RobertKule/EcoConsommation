import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import AppButton from "../Button/AppButton";

const STORAGE_KEY = "@EcoConsommation_profile";

export default function ProfileSettings({ onClose }) {
  const [profile, setProfile] = useState({
    nom: "",
    email: "",
    adresse: "",
    ville: "",
    codePostal: "",
  });
  const [loading, setLoading] = useState(false);

  // Corriger : utiliser useEffect au lieu de useState pour les effets secondaires
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      alert("Profil enregistré avec succès !");
      onClose();
    } catch (error) {
      console.error("Erreur sauvegarde profil:", error);
      alert("Erreur lors de l'enregistrement du profil");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👤 Mon Profil</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom complet</Text>
          <TextInput
            style={styles.input}
            value={profile.nom}
            onChangeText={(value) => updateField("nom", value)}
            placeholder="Votre nom"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(value) => updateField("email", value)}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={styles.input}
            value={profile.adresse}
            onChangeText={(value) => updateField("adresse", value)}
            placeholder="Votre adresse"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex]}>
            <Text style={styles.label}>Code postal</Text>
            <TextInput
              style={styles.input}
              value={profile.codePostal}
              onChangeText={(value) => updateField("codePostal", value)}
              placeholder="75000"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex, styles.marginLeft]}>
            <Text style={styles.label}>Ville</Text>
            <TextInput
              style={styles.input}
              value={profile.ville}
              onChangeText={(value) => updateField("ville", value)}
              placeholder="Votre ville"
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <AppButton
          title="Annuler"
          onPress={onClose}
          variant="secondary"
          style={styles.button}
        />
        <AppButton
          title={loading ? "Enregistrement..." : "Enregistrer"}
          onPress={saveProfile}
          disabled={loading}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#007AFF",
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
  },
  flex: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
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
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});