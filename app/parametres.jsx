import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme
} from "react-native";
import EstimationConfig from "../components/Estimation/EstimationConfig";
import BaseModal from "../components/Modal/BaseModal";
import AppPreferences from "../components/Settings/AppPreferences";
import ProfileSettings from "../components/Settings/ProfileSettings";
import SettingsItem from "../components/Settings/SettingsItem";
import SettingsSection from "../components/Settings/SettingsSection";
import { PriceConfigService } from "../services/PriceConfigService";
import { fetchReleves } from "../services/storageService";

// Couleurs pour les thèmes
const Colors = {
  light: {
    primary: "#007AFF",
    background: "#f8faff",
    card: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666",
    border: "#f0f0f0",
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30"
  },
  dark: {
    primary: "#0A84FF",
    background: "#000000",
    card: "#1c1c1e",
    text: "#ffffff",
    textSecondary: "#98989f",
    border: "#38383a",
    success: "#30D158",
    warning: "#FF9F0A",
    error: "#FF453A"
  }
};

export default function Parametres() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [profile, setProfile] = useState(null);
  const [priceConfig, setPriceConfig] = useState(null);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    loadProfile();
    loadPriceConfig();
    startAnimations();
  }, []);

  const startAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem("@EcoConsommation_profile");
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  };

  const loadPriceConfig = async () => {
    try {
      const config = await PriceConfigService.loadPriceConfig();
      setPriceConfig(config);
    } catch (error) {
      console.error("Erreur chargement config prix:", error);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType("");
    // Recharger la config après fermeture du modal de tarifs
    if (modalType === "estimation") {
      loadPriceConfig();
    }
  };

  const handleResetData = () => {
    Alert.alert(
      "🗑️ Réinitialisation des données",
      "Cette action supprimera TOUTES vos données de consommation. Cette action est irréversible.",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Tout supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("@EcoConsommation_releves");
              Alert.alert("✅ Succès", "Toutes les données ont été supprimées.");
              closeModal();
            } catch (error) {
              Alert.alert("❌ Erreur", "Impossible de supprimer les données.");
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert("❌ Erreur", "Le partage n'est pas disponible sur cet appareil");
        return;
      }

      fetchReleves(
        async (releves) => {
          if (releves.length === 0) {
            Alert.alert("ℹ️ Information", "Aucune donnée à exporter.");
            return;
          }

          try {
            const csvContent = convertToCSV(releves);
            const fileUri = FileSystem.documentDirectory + 'eco_consommation_export.csv';
            
            await FileSystem.writeAsStringAsync(fileUri, csvContent);
            
            await Sharing.shareAsync(fileUri, {
              mimeType: 'text/csv',
              dialogTitle: 'Exporter les données EcoConsommation',
              UTI: 'public.comma-separated-values-text'
            });
            
          } catch (fileError) {
            console.error("Erreur création fichier:", fileError);
            Alert.alert("❌ Erreur", "Impossible de créer le fichier d'export.");
          }
        },
        (error) => {
          console.error("Erreur récupération données:", error);
          Alert.alert("❌ Erreur", "Impossible de récupérer les données à exporter.");
        }
      );
    } catch (error) {
      console.error("Erreur export:", error);
      Alert.alert("❌ Erreur", "Une erreur est survenue lors de l'export.");
    }
  };

  const convertToCSV = (releves) => {
    const headers = "\uFEFFDate;Type;Index;Unité\n";
    const rows = releves.map(releve => {
      const date = new Date(releve.date);
      const formattedDate = date.toLocaleDateString('fr-FR');
      const unite = releve.type === "Eau" ? "L" : "kWh";
      return `${formattedDate};${releve.type};${releve.index_val};${unite}`;
    }).join("\n");
    return headers + rows;
  };

  const getModalContent = () => {
    switch (modalType) {
      case "profile":
        return {
          title: "👤 Mon Profil",
          component: <ProfileSettings onClose={closeModal} />,
        };
      case "preferences":
        return {
          title: "⚙️ Préférences",
          component: <AppPreferences onClose={closeModal} />,
        };
      case "estimation":
        return {
          title: "💰 Configuration des Prix",
          component: <EstimationConfig onClose={closeModal} />,
        };
      case "about":
        return {
          title: "ℹ️ À Propos",
          message: `EcoConsommation v1.0

Une application développée avec ❤️ pour vous aider à suivre et optimiser votre consommation d'eau et d'électricité.

Fonctionnalités :
• Suivi précis de la consommation
• Graphiques détaillés
• Estimations de coûts
• Export de données

Développé avec React Native & Expo`,
        };
      default:
        return {};
    }
  };

  const modalConfig = getModalContent();
  const userName = profile?.nom || "Utilisateur";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header animé */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Paramètres
          </Text>
          <Text style={[styles.welcome, { color: colors.textSecondary }]}>
            Bonjour, {userName} 👋
          </Text>
        </Animated.View>

        {/* Section Profil et Compte */}
        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <SettingsSection title="👤 Profil & Compte" colors={colors}>
            <SettingsItem
              title="Mon profil"
              subtitle={profile?.nom || "Complétez votre profil"}
              icon={<Ionicons name="person" size={20} color={colors.primary} />}
              onPress={() => openModal("profile")}
              colors={colors}
            />
            <SettingsItem
              title="Préférences de l'application"
              subtitle="Personnaliser l'application"
              icon={<Ionicons name="settings" size={20} color={colors.primary} />}
              onPress={() => openModal("preferences")}
              colors={colors}
            />
          </SettingsSection>

          {/* Section Facturation & Estimation */}
          <SettingsSection title="💰 Facturation & Estimation" colors={colors}>
            <SettingsItem
              title="Configuration des prix"
              subtitle={`Eau: ${priceConfig?.Eau ? `${(priceConfig.Eau * 1000).toFixed(2)} €/m³` : '...'} • Élec: ${priceConfig?.Électricité ? `${priceConfig.Électricité} €/kWh` : '...'}`}
              icon={<Ionicons name="cash" size={20} color={colors.primary} />}
              onPress={() => openModal("estimation")}
              colors={colors}
            />
            <SettingsItem
              title="Budget mensuel"
              subtitle={priceConfig ? `Limite: ${priceConfig.budgetMensuel} €` : '...'}
              icon={<Ionicons name="wallet" size={20} color={colors.primary} />}
              onPress={() => openModal("estimation")}
              colors={colors}
            />
            <SettingsItem
              title="Seuils d'alerte"
              subtitle="Configurer les limites de consommation"
              icon={<Ionicons name="notifications" size={20} color={colors.primary} />}
              onPress={() => console.log("Alert thresholds")}
              colors={colors}
            />
          </SettingsSection>

          <SettingsSection title="📊 Consommation" colors={colors}>
            <SettingsItem
              title="Exporter les données"
              subtitle="Télécharger en format CSV"
              icon={<Ionicons name="download" size={20} color={colors.primary} />}
              onPress={handleExportData}
              colors={colors}
            />
          </SettingsSection>

          <SettingsSection title="💡 Support & Aide" colors={colors}>
            <SettingsItem
              title="Centre d'aide"
              subtitle="FAQ et tutoriels"
              icon={<Ionicons name="help-circle" size={20} color={colors.primary} />}
              onPress={() => console.log("Help center")}
              colors={colors}
            />
            <SettingsItem
              title="Contactez-nous"
              subtitle="Support technique"
              icon={<Ionicons name="mail" size={20} color={colors.primary} />}
              onPress={() => console.log("Contact us")}
              colors={colors}
            />
            <SettingsItem
              title="À propos"
              subtitle="Informations sur l'application"
              icon={<Ionicons name="information-circle" size={20} color={colors.primary} />}
              onPress={() => openModal("about")}
              colors={colors}
            />
          </SettingsSection>

          <SettingsSection title="⚡ Actions" colors={colors}>
            <SettingsItem
              title="Réinitialiser les données"
              subtitle="Supprimer tous les relevés"
              icon={<Ionicons name="trash" size={20} color={colors.error} />}
              onPress={handleResetData}
              destructive
              colors={colors}
            />
            <SettingsItem
              title="Mettre à jour l'application"
              subtitle="Vérifier les mises à jour"
              icon={<Ionicons name="refresh" size={20} color={colors.primary} />}
              onPress={() => console.log("Check updates")}
              colors={colors}
            />
          </SettingsSection>
        </Animated.View>

        {/* Informations version */}
        <Animated.View 
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={[styles.footerContent, { backgroundColor: colors.card }]}>
            <Ionicons name="water" size={24} color={colors.primary} />
            <Text style={[styles.version, { color: colors.text }]}>
              EcoConsommation v1.0.0
            </Text>
            <Text style={[styles.copyright, { color: colors.textSecondary }]}>
              © 2024 Tous droits réservés
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <BaseModal
        visible={modalVisible}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        buttons={modalConfig.buttons}
      >
        {modalConfig.component}
      </BaseModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  welcome: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  footerContent: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  version: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
  },
});