import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import SettingsItem from "./SettingsItem";

const STORAGE_KEY = "@EcoConsommation_preferences";

export default function AppPreferences({ onClose }) {
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    autoSync: true,
    dataBackup: true,
    usageAlerts: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erreur chargement préférences:", error);
    }
  };

  const savePreferences = async (newPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error("Erreur sauvegarde préférences:", error);
    }
  };

  const togglePreference = (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    savePreferences(newPreferences);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🛠 Préférences</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingsItem
          title="Notifications push"
          subtitle="Recevoir des alertes de consommation"
          icon="🔔"
          type="switch"
          value={preferences.notifications}
          onValueChange={() => togglePreference("notifications")}
          showChevron={false}
        />
        <SettingsItem
          title="Alertes d'usage"
          subtitle="Alertes en cas de consommation élevée"
          icon="⚠️"
          type="switch"
          value={preferences.usageAlerts}
          onValueChange={() => togglePreference("usageAlerts")}
          showChevron={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apparence</Text>
        <SettingsItem
          title="Mode sombre"
          subtitle="Activer le thème sombre"
          icon="🌙"
          type="switch"
          value={preferences.darkMode}
          onValueChange={() => togglePreference("darkMode")}
          showChevron={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Données</Text>
        <SettingsItem
          title="Synchronisation automatique"
          subtitle="Sauvegarder automatiquement les données"
          icon="🔄"
          type="switch"
          value={preferences.autoSync}
          onValueChange={() => togglePreference("autoSync")}
          showChevron={false}
        />
        <SettingsItem
          title="Sauvegarde des données"
          subtitle="Sauvegarder dans le cloud"
          icon="☁️"
          type="switch"
          value={preferences.dataBackup}
          onValueChange={() => togglePreference("dataBackup")}
          showChevron={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export</Text>
        <SettingsItem
          title="Exporter les données"
          subtitle="Télécharger vos données en CSV"
          icon="📤"
          onPress={() => console.log("Export data")}
        />
        <SettingsItem
          title="Générer rapport"
          subtitle="Créer un rapport mensuel"
          icon="📊"
          onPress={() => console.log("Generate report")}
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 10,
    marginLeft: 5,
  },
});