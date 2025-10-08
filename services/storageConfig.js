// Configuration du stockage
export const StorageConfig = {
  // Choisir le mode de stockage: 'sqlite' ou 'asyncstorage'
  STORAGE_MODE: 'sqlite',
  
  // Activer la migration automatique
  AUTO_MIGRATE: true,
  
  // Logger les opérations de stockage
  LOG_OPERATIONS: true,
};

// Fonction utilitaire pour changer le mode de stockage
export const setStorageMode = (mode) => {
  if (mode === 'sqlite' || mode === 'asyncstorage') {
    StorageConfig.STORAGE_MODE = mode;
    console.log(`🔄 Mode de stockage changé: ${mode}`);
  } else {
    console.warn('⚠️ Mode de stockage non valide. Utilisez "sqlite" ou "asyncstorage"');
  }
};

// Vérifier si SQLite est disponible
export const isSQLiteAvailable = () => {
  return StorageConfig.STORAGE_MODE === 'sqlite';
};