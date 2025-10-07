import AsyncStorage from "@react-native-async-storage/async-storage";

// Clé pour stocker les données
const STORAGE_KEY = "@EcoConsommation_releves";

// --- Données brutes initiales ---
let releves = [
  { id: 1, type: "Eau", index_val: 120, date: "2025-10-01" },
  { id: 2, type: "Électricité", index_val: 450, date: "2025-10-02" },
];

// --- Initialisation de la "base" ---
export const initDB = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(releves));
      console.log("✅ Base initialisée avec données brutes");
    } else {
      releves = JSON.parse(stored);
      console.log("✅ Base chargée depuis AsyncStorage");
    }
  } catch (error) {
    console.error("❌ Erreur initialisation base:", error);
  }
};

// --- Vérifie si la DB est prête ---
const ensureDB = () => {
  if (!releves) {
    console.warn("⚠️ Base non initialisée. Appelle initDB() avant.");
    return false;
  }
  return true;
};

// --- Insertion d’un relevé ---
export const insertReleve = async (type, index_val, date, onSuccess, onError) => {
  if (!ensureDB()) return;

  try {
    const newReleve = {
      id: releves.length ? releves[releves.length - 1].id + 1 : 1,
      type,
      index_val,
      date,
    };
    releves.push(newReleve);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(releves));
    console.log("✅ Relevé inséré avec succès !");
    onSuccess?.(newReleve);
  } catch (error) {
    console.error("❌ Erreur insertion relevé:", error);
    onError?.(error);
  }
};

// --- Récupération des relevés ---
export const fetchReleves = async (onSuccess, onError) => {
  if (!ensureDB()) return onSuccess?.([]);

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    releves = stored ? JSON.parse(stored) : [];
    console.log(`✅ ${releves.length} relevé(s) récupéré(s)`);
    onSuccess?.([...releves].sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    console.error("❌ Erreur récupération relevés:", error);
    onError?.(error);
  }
};

export const deleteReleve = async (id, onSuccess, onError) => {
  try {
    releves = releves.filter((r) => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(releves));
    console.log("✅ Relevé supprimé avec succès !");
    onSuccess?.();
  } catch (error) {
    console.error("❌ Erreur suppression relevé:", error);
    onError?.(error);
  }
};


export const updateReleve = async (id, type, index_val, date, onSuccess, onError) => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    let releves = stored ? JSON.parse(stored) : [];

    const index = releves.findIndex(r => r.id === id);
    if (index !== -1) {
      releves[index] = { ...releves[index], type, index_val, date };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(releves));
      console.log("✅ Relevé modifié avec succès !");
      onSuccess?.();
    } else {
      throw new Error("Relevé non trouvé");
    }
  } catch (error) {
    console.error("❌ Erreur modification relevé:", error);
    onError?.(error);
  }
};



