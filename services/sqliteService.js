import * as SQLite from 'expo-sqlite';

const DB_NAME = 'EcoConsommation.db';
const TABLE_NAME = 'releves';

export class SQLiteService {
  static db = null;

  static async initDB() {
    try {
      this.db = SQLite.openDatabaseSync(DB_NAME);
      
      // Créer la table si elle n'existe pas
      await this.createTable();
      console.log('✅ Base SQLite initialisée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation SQLite:', error);
      return false;
    }
  }

  static async createTable() {
    return new Promise((resolve, reject) => {
      this.db.execAsync([
        {
          sql: `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            index_val REAL NOT NULL,
            date TEXT NOT NULL
          )`,
          args: []
        }
      ]).then(() => {
        console.log('✅ Table relevés créée/verifiée');
        resolve();
      }).catch(reject);
    });
  }

  static async insertReleve(type, index_val, date) {
    return new Promise((resolve, reject) => {
      this.db.runAsync(
        `INSERT INTO ${TABLE_NAME} (type, index_val, date) VALUES (?, ?, ?)`,
        [type, index_val, date]
      ).then(result => {
        const newReleve = {
          id: result.lastInsertRowId,
          type,
          index_val,
          date
        };
        resolve(newReleve);
      }).catch(reject);
    });
  }

  static async fetchReleves() {
    return new Promise((resolve, reject) => {
      this.db.getAllAsync(
        `SELECT * FROM ${TABLE_NAME} ORDER BY date DESC`
      ).then(result => {
        resolve(result);
      }).catch(reject);
    });
  }

  static async deleteReleve(id) {
    return new Promise((resolve, reject) => {
      this.db.runAsync(
        `DELETE FROM ${TABLE_NAME} WHERE id = ?`,
        [id]
      ).then(result => {
        resolve(result.changes > 0);
      }).catch(reject);
    });
  }

  static async updateReleve(id, type, index_val, date) {
    return new Promise((resolve, reject) => {
      this.db.runAsync(
        `UPDATE ${TABLE_NAME} SET type = ?, index_val = ?, date = ? WHERE id = ?`,
        [type, index_val, date, id]
      ).then(result => {
        resolve(result.changes > 0);
      }).catch(reject);
    });
  }

  static async getReleveById(id) {
    return new Promise((resolve, reject) => {
      this.db.getFirstAsync(
        `SELECT * FROM ${TABLE_NAME} WHERE id = ?`,
        [id]
      ).then(result => {
        resolve(result);
      }).catch(reject);
    });
  }
}