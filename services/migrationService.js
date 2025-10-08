import AsyncStorage from "@react-native-async-storage/async-storage";
import { SQLiteService } from './sqliteService';

const STORAGE_KEY = "@EcoConsommation_releves";

export class MigrationService {
  static async migrateToSQLite() {
    try {
      console.log('🔄 Début de la migration AsyncStorage → SQLite...');
      
      // Récupérer les données d'AsyncStorage
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('ℹ️ Aucune donnée à migrer depuis AsyncStorage');
        return { success: true, migrated: 0 };
      }

      const asyncStorageReleves = JSON.parse(stored);
      
      if (asyncStorageReleves.length === 0) {
        console.log('ℹ️ Aucune donnée à migrer');
        return { success: true, migrated: 0 };
      }

      // Insérer chaque relevé dans SQLite
      let migratedCount = 0;
      for (const releve of asyncStorageReleves) {
        try {
          await SQLiteService.insertReleve(releve.type, releve.index_val, releve.date);
          migratedCount++;
        } catch (error) {
          console.warn(`⚠️ Erreur migration relevé ${releve.id}:`, error);
        }
      }

      console.log(`✅ Migration réussie: ${migratedCount}/${asyncStorageReleves.length} relevés migrés`);
      
      // Sauvegarder un flag pour éviter les migrations multiples
      await AsyncStorage.setItem('@migration_completed', 'true');
      
      return { success: true, migrated: migratedCount };
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      return { success: false, error: error.message };
    }
  }

  static async shouldMigrate() {
    try {
      const migrationCompleted = await AsyncStorage.getItem('@migration_completed');
      return !migrationCompleted;
    } catch (error) {
      console.error('❌ Erreur vérification migration:', error);
      return true;
    }
  }

  static async clearMigrationFlag() {
    try {
      await AsyncStorage.removeItem('@migration_completed');
      console.log('🔄 Flag de migration réinitialisé');
    } catch (error) {
      console.error('❌ Erreur suppression flag migration:', error);
    }
  }
}