import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { initDB, MigrationService, setStorageMode, StorageConfig } from '../services/storageService';

const StorageSettings = () => {
  const [isSQLite, setIsSQLite] = useState(StorageConfig.STORAGE_MODE === 'sqlite');
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    // Synchroniser l'état avec la configuration
    setIsSQLite(StorageConfig.STORAGE_MODE === 'sqlite');
  }, []);

  const handleStorageChange = async (value) => {
    try {
      const newMode = value ? 'sqlite' : 'asyncstorage';
      setStorageMode(newMode);
      setIsSQLite(value);
      
      // Réinitialiser la base avec le nouveau mode
      await initDB();
      
      Alert.alert(
        'Succès',
        `Mode de stockage changé: ${newMode}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur changement mode stockage:', error);
      Alert.alert('Erreur', 'Impossible de changer le mode de stockage');
      // Revenir à l'état précédent
      setIsSQLite(!value);
    }
  };

  const handleManualMigration = async () => {
    if (StorageConfig.STORAGE_MODE !== 'sqlite') {
      Alert.alert('Info', 'Veuillez activer SQLite pour effectuer la migration');
      return;
    }

    setIsMigrating(true);
    try {
      const result = await MigrationService.migrateToSQLite();
      
      if (result.success) {
        Alert.alert(
          'Migration réussie',
          `${result.migrated} relevés migrés vers SQLite`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur migration manuelle:', error);
      Alert.alert('Erreur', 'Échec de la migration');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClearMigrationFlag = () => {
    MigrationService.clearMigrationFlag();
    Alert.alert('Info', 'Flag de migration réinitialisé');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuration du Stockage</Text>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Utiliser SQLite</Text>
        <Switch
          value={isSQLite}
          onValueChange={handleStorageChange}
        />
      </View>
      
      <Text style={styles.currentMode}>
        Mode actuel: <Text style={styles.modeValue}>{StorageConfig.STORAGE_MODE}</Text>
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, isMigrating && styles.buttonDisabled]}
        onPress={handleManualMigration}
        disabled={isMigrating}
      >
        <Text style={styles.buttonText}>
          {isMigrating ? 'Migration...' : 'Migrer vers SQLite'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]}
        onPress={handleClearMigrationFlag}
      >
        <Text style={styles.buttonText}>Réinitialiser Migration</Text>
      </TouchableOpacity>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Informations</Text>
        <Text style={styles.infoText}>
          • SQLite: Meilleures performances pour grandes quantités de données
        </Text>
        <Text style={styles.infoText}>
          • AsyncStorage: Stockage clé-valeur simple
        </Text>
        <Text style={styles.infoText}>
          • Migration: Copie automatique des données existantes
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  currentMode: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    color: '#666',
  },
  modeValue: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  secondaryButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
    color: '#333',
  },
});

export default StorageSettings;