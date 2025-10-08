import { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { PriceConfigService } from '../services/PriceConfigService';

const Colors = {
  light: {
    primary: "#007AFF",
    card: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666",
    border: "#f0f0f0",
  },
  dark: {
    primary: "#0A84FF",
    card: "#1c1c1e",
    text: "#ffffff",
    textSecondary: "#98989f",
    border: "#38383a",
  }
};

export default function PriceSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  const [config, setConfig] = useState({
    Eau: '',
    Électricité: '',
    budgetMensuel: '',
    abonnementEau: '',
    abonnementElectricite: '',
    tva: ''
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const saved = await PriceConfigService.loadPriceConfig();
    setConfig({
      Eau: saved.Eau.toString(),
      Électricité: saved.Électricité.toString(),
      budgetMensuel: saved.budgetMensuel.toString(),
      abonnementEau: saved.abonnementEau.toString(),
      abonnementElectricite: saved.abonnementElectricite.toString(),
      tva: saved.tva.toString(),
    });
  };

  const handleSave = async () => {
    const updated = {
      Eau: parseFloat(config.Eau) || 0.003,
      Électricité: parseFloat(config.Électricité) || 0.18,
      budgetMensuel: parseFloat(config.budgetMensuel) || 150,
      abonnementEau: parseFloat(config.abonnementEau) || 15,
      abonnementElectricite: parseFloat(config.abonnementElectricite) || 12,
      tva: parseFloat(config.tva) || 20,
    };
    const success = await PriceConfigService.savePriceConfig(updated);
    if (success) {
      Alert.alert('✅ Succès', 'Configuration enregistrée');
    } else {
      Alert.alert('❌ Erreur', 'Impossible d’enregistrer');
    }
  };

  const handleReset = async () => {
    Alert.alert(
      'Réinitialiser',
      'Voulez-vous restaurer les valeurs par défaut ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Réinitialiser', onPress: async () => {
          await PriceConfigService.resetToDefaults();
          loadConfig();
        }}
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>⚙️ Tarifs & Budget</Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>💧 Prix de l’eau (€/L)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={config.Eau}
          onChangeText={(v) => setConfig({ ...config, Eau: v })}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>⚡ Prix électricité (€/kWh)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={config.Électricité}
          onChangeText={(v) => setConfig({ ...config, Électricité: v })}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>💰 Budget mensuel (€)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={config.budgetMensuel}
          onChangeText={(v) => setConfig({ ...config, budgetMensuel: v })}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>💧 Abonnement eau (€/mois)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={config.abonnementEau}
          onChangeText={(v) => setConfig({ ...config, abonnementEau: v })}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>⚡ Abonnement électricité (€/mois)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={config.abonnementElectricite}
          onChangeText={(v) => setConfig({ ...config, abonnementElectricite: v })}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>🧾 TVA (%)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={config.tva}
          onChangeText={(v) => setConfig({ ...config, tva: v })}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Enregistrer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF3B30' }]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Réinitialiser</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});