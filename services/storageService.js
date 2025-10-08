import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from 'expo-sqlite';

const STORAGE_KEY = "@EcoConsommation_releves";

// Configuration du stockage - COMMENÇONS PAR ASYNCSTORAGE POUR ÉVITER LES ERREURS
export const StorageConfig = {
  STORAGE_MODE: 'asyncstorage', // Changé à asyncstorage pour stabiliser
  AUTO_MIGRATE: false, // Désactivé temporairement
  LOG_OPERATIONS: __DEV__,
};

// Données par défaut
const defaultReleves = [
  { id: 1, type: "Eau", index_val: 120, date: "2025-10-01" },
  { id: 2, type: "Électricité", index_val: 450, date: "2025-10-02" },
];

// Service SQLite avec meilleure gestion d'erreurs
class SQLiteService {
  static db = null;
  static isInitialized = false;

  static async initDB() {
    try {
      if (this.isInitialized) return true;
      
      this.db = SQLite.openDatabaseSync('EcoConsommation.db');
      
      // Créer la table
      await this.createTable();
      
      this.isInitialized = true;
      
      if (StorageConfig.LOG_OPERATIONS) {
        console.log('✅ Base SQLite initialisée');
      }
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation SQLite:', error);
      this.isInitialized = false;
      return false;
    }
  }

  static async createTable() {
    try {
      return await this.db.execAsync([
        {
          sql: `CREATE TABLE IF NOT EXISTS releves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            index_val REAL NOT NULL,
            date TEXT NOT NULL
          )`,
          args: []
        }
      ]);
    } catch (error) {
      console.error('❌ Erreur création table SQLite:', error);
      throw error;
    }
  }

  static async insertReleve(type, index_val, date) {
    try {
      const result = await this.db.runAsync(
        `INSERT INTO releves (type, index_val, date) VALUES (?, ?, ?)`,
        [type, index_val, date]
      );
      
      return {
        id: result.lastInsertRowId,
        type,
        index_val,
        date
      };
    } catch (error) {
      console.error('❌ Erreur insertion SQLite:', error);
      throw error;
    }
  }

  static async fetchReleves() {
    try {
      return await this.db.getAllAsync(
        `SELECT * FROM releves ORDER BY date DESC`
      );
    } catch (error) {
      console.error('❌ Erreur récupération SQLite:', error);
      throw error;
    }
  }

  static async deleteReleve(id) {
    try {
      const result = await this.db.runAsync(
        `DELETE FROM releves WHERE id = ?`,
        [id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('❌ Erreur suppression SQLite:', error);
      throw error;
    }
  }

  static async updateReleve(id, type, index_val, date) {
    try {
      const result = await this.db.runAsync(
        `UPDATE releves SET type = ?, index_val = ?, date = ? WHERE id = ?`,
        [type, index_val, date, id]
      );
      return result.changes > 0;
    } catch (error) {
      console.error('❌ Erreur modification SQLite:', error);
      throw error;
    }
  }
}

// Service de migration - VERSION SIMPLIFIÉE
class MigrationService {
  static async migrateToSQLite() {
    try {
      console.log('🔄 Tentative de migration vers SQLite...');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('ℹ️ Aucune donnée à migrer depuis AsyncStorage');
        return { success: true, migrated: 0 };
      }

      const asyncStorageReleves = JSON.parse(stored);
      let migratedCount = 0;

      // Vérifier d'abord si SQLite fonctionne
      const sqliteReady = await SQLiteService.initDB();
      if (!sqliteReady) {
        throw new Error('SQLite non disponible pour la migration');
      }

      for (const releve of asyncStorageReleves) {
        try {
          await SQLiteService.insertReleve(releve.type, releve.index_val, releve.date);
          migratedCount++;
        } catch (error) {
          console.warn(`⚠️ Erreur migration relevé ${releve.id}:`, error);
          // Continuer avec les autres relevés
        }
      }

      console.log(`✅ Migration: ${migratedCount}/${asyncStorageReleves.length} relevés migrés`);
      
      await AsyncStorage.setItem('@migration_completed', 'true');
      return { success: true, migrated: migratedCount };
      
    } catch (error) {
      console.error('❌ Erreur migration:', error);
      return { success: false, error: error.message };
    }
  }

  static async shouldMigrate() {
    try {
      const migrationCompleted = await AsyncStorage.getItem('@migration_completed');
      return !migrationCompleted;
    } catch (error) {
      return false; // En cas d'erreur, ne pas migrer
    }
  }
}

// Fonctions principales exportées - VERSION STABILISÉE
export const initDB = async () => {
  try {
    // TOUJOURS utiliser AsyncStorage pour l'instant
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultReleves));
      console.log("✅ Base AsyncStorage initialisée avec données par défaut");
    } else {
      console.log("✅ Base AsyncStorage chargée depuis le stockage");
    }

    // Tentative d'initialisation SQLite en arrière-plan (sans bloquer)
    if (StorageConfig.STORAGE_MODE === 'sqlite') {
      setTimeout(async () => {
        try {
          const sqliteSuccess = await SQLiteService.initDB();
          if (sqliteSuccess && StorageConfig.AUTO_MIGRATE) {
            const shouldMigrate = await MigrationService.shouldMigrate();
            if (shouldMigrate) {
              await MigrationService.migrateToSQLite();
            }
          }
        } catch (error) {
          console.log('⚠️ SQLite en arrière-plan a échoué, continuation avec AsyncStorage');
        }
      }, 1000);
    }
    
  } catch (error) {
    console.error("❌ Erreur initialisation base:", error);
    throw error;
  }
};

export const insertReleve = async (type, index_val, date, onSuccess, onError) => {
  try {
    let newReleve;
    
    if (StorageConfig.STORAGE_MODE === 'sqlite') {
      try {
        newReleve = await SQLiteService.insertReleve(type, index_val, date);
      } catch (sqliteError) {
        console.warn('⚠️ SQLite échoue, fallback vers AsyncStorage');
        // Fallback vers AsyncStorage
        StorageConfig.STORAGE_MODE = 'asyncstorage';
        newReleve = await insertWithAsyncStorage(type, index_val, date);
      }
    } else {
      newReleve = await insertWithAsyncStorage(type, index_val, date);
    }
    
    console.log("✅ Relevé inséré avec succès !");
    onSuccess?.(newReleve);
    return newReleve;
    
  } catch (error) {
    console.error("❌ Erreur insertion relevé:", error);
    onError?.(error);
    throw error;
  }
};

// Fonction helper pour AsyncStorage
const insertWithAsyncStorage = async (type, index_val, date) => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  let currentReleves = stored ? JSON.parse(stored) : [];
  
  const newReleve = {
    id: currentReleves.length ? Math.max(...currentReleves.map(r => r.id)) + 1 : 1,
    type,
    index_val,
    date,
  };
  
  currentReleves.push(newReleve);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentReleves));
  return newReleve;
};

export const fetchReleves = async (onSuccess, onError) => {
  try {
    let currentReleves;
    
    if (StorageConfig.STORAGE_MODE === 'sqlite') {
      try {
        currentReleves = await SQLiteService.fetchReleves();
      } catch (sqliteError) {
        console.warn('⚠️ SQLite échoue, fallback vers AsyncStorage');
        StorageConfig.STORAGE_MODE = 'asyncstorage';
        currentReleves = await fetchWithAsyncStorage();
      }
    } else {
      currentReleves = await fetchWithAsyncStorage();
    }
    
    console.log(`✅ ${currentReleves.length} relevé(s) récupéré(s)`);
    const sortedReleves = [...currentReleves].sort((a, b) => new Date(b.date) - new Date(a.date));
    onSuccess?.(sortedReleves);
    return sortedReleves;
    
  } catch (error) {
    console.error("❌ Erreur récupération relevés:", error);
    onError?.(error);
    throw error;
  }
};

// Fonction helper pour AsyncStorage
const fetchWithAsyncStorage = async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deleteReleve = async (id, onSuccess, onError) => {
  try {
    let success;
    
    if (StorageConfig.STORAGE_MODE === 'sqlite') {
      try {
        success = await SQLiteService.deleteReleve(id);
      } catch (sqliteError) {
        console.warn('⚠️ SQLite échoue, fallback vers AsyncStorage');
        StorageConfig.STORAGE_MODE = 'asyncstorage';
        success = await deleteWithAsyncStorage(id);
      }
    } else {
      success = await deleteWithAsyncStorage(id);
    }
    
    if (success) {
      console.log("✅ Relevé supprimé avec succès !");
      onSuccess?.();
    } else {
      throw new Error("Relevé non trouvé");
    }
    
    return success;
    
  } catch (error) {
    console.error("❌ Erreur suppression relevé:", error);
    onError?.(error);
    throw error;
  }
};

// Fonction helper pour AsyncStorage
const deleteWithAsyncStorage = async (id) => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  let currentReleves = stored ? JSON.parse(stored) : [];
  
  const initialLength = currentReleves.length;
  currentReleves = currentReleves.filter((r) => r.id !== id);
  const success = currentReleves.length < initialLength;
  
  if (success) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentReleves));
  }
  
  return success;
};

export const updateReleve = async (id, type, index_val, date, onSuccess, onError) => {
  try {
    let success;
    
    if (StorageConfig.STORAGE_MODE === 'sqlite') {
      try {
        success = await SQLiteService.updateReleve(id, type, index_val, date);
      } catch (sqliteError) {
        console.warn('⚠️ SQLite échoue, fallback vers AsyncStorage');
        StorageConfig.STORAGE_MODE = 'asyncstorage';
        success = await updateWithAsyncStorage(id, type, index_val, date);
      }
    } else {
      success = await updateWithAsyncStorage(id, type, index_val, date);
    }
    
    if (success) {
      console.log("✅ Relevé modifié avec succès !");
      onSuccess?.();
    } else {
      throw new Error("Relevé non trouvé");
    }
    
    return success;
    
  } catch (error) {
    console.error("❌ Erreur modification relevé:", error);
    onError?.(error);
    throw error;
  }
};

// Fonction helper pour AsyncStorage
const updateWithAsyncStorage = async (id, type, index_val, date) => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  let currentReleves = stored ? JSON.parse(stored) : [];

  const index = currentReleves.findIndex(r => r.id === id);
  if (index !== -1) {
    currentReleves[index] = { ...currentReleves[index], type, index_val, date };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentReleves));
    return true;
  }
  return false;
};

// Service d'estimation (inchangé)
export class EstimationService {
  static calculateMonthlyBill(releves, type, prixUnitaire) {
    if (releves.length < 2) return null;

    const filteredReleves = releves
      .filter(r => r.type === type)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (filteredReleves.length < 2) return null;

    const lastMonthReleves = this.getLastMonthReleves(filteredReleves);
    if (lastMonthReleves.length < 2) return null;

    const consommation = lastMonthReleves[lastMonthReleves.length - 1].index_val - 
                         lastMonthReleves[0].index_val;
    
    const estimation = consommation * prixUnitaire;

    return {
      consommation,
      estimation: Math.round(estimation * 100) / 100,
      periode: this.getPeriodString(lastMonthReleves),
    };
  }

  static getLastMonthReleves(releves) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return releves.filter(r => new Date(r.date) >= lastMonth);
  }

  static getPeriodString(releves) {
    if (releves.length < 2) return "";
    const start = new Date(releves[0].date);
    const end = new Date(releves[releves.length - 1].date);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }

  static getDefaultPrices() {
    return {
      Eau: 0.003,
      Électricité: 0.18,
    };
  }
}

// Fonctions utilitaires
export const setStorageMode = (mode) => {
  if (mode === 'sqlite' || mode === 'asyncstorage') {
    StorageConfig.STORAGE_MODE = mode;
    console.log(`🔄 Mode de stockage changé: ${mode}`);
  }
};

export const getStorageMode = () => StorageConfig.STORAGE_MODE;

// Fonction pour tester SQLite (optionnelle)
export const testSQLite = async () => {
  try {
    const success = await SQLiteService.initDB();
    if (success) {
      console.log('✅ SQLite fonctionne correctement');
      return true;
    } else {
      console.log('❌ SQLite ne fonctionne pas');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur test SQLite:', error);
    return false;
  }
};