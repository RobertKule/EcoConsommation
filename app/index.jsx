import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions, Easing, // ⬅️ AJOUTEZ CET IMPORT
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme
} from "react-native";
import AppButton from "../components/Button/AppButton";
import EstimationCard from "../components/Estimation/EstimationCard";
import LoadingScreen from "../components/LoadingScreen";
import { fetchReleves } from "../services/Database";
import { EstimationService } from "../services/EstimationService";

const { width } = Dimensions.get('window');

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
    gradient: ["#007AFF", "#5AC8FA"]
  },
  dark: {
    primary: "#0A84FF",
    background: "#000000",
    card: "#1c1c1e",
    text: "#ffffff",
    textSecondary: "#98989f",
    border: "#38383a",
    success: "#30D158",
    gradient: ["#0A84FF", "#5E5CE6"]
  }
};

export default function Index() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  
  const [releves, setReleves] = useState([]);
  const [prices, setPrices] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    loadData();
  }, []);

  const startAnimations = () => {
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }),
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.back(1.2)), // ⬅️ CORRECTION ICI
      useNativeDriver: true,
    }),
  ]).start();
};

  const loadData = async () => {
    setLoading(true);
    
    // Charger les relevés
    fetchReleves(
      (data) => {
        setReleves(data);
        setLoading(false);
        setRefreshing(false);
        startAnimations();
      },
      (error) => {
        console.error("Erreur:", error);
        setLoading(false);
        setRefreshing(false);
        startAnimations();
      }
    );

    // Charger les prix
    try {
      const storedPrices = await AsyncStorage.getItem("@EcoConsommation_prices");
      if (storedPrices) {
        setPrices(JSON.parse(storedPrices));
      } else {
        setPrices(EstimationService.getDefaultPrices());
      }
    } catch (error) {
      console.error("Erreur chargement prix:", error);
      setPrices(EstimationService.getDefaultPrices());
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getEstimation = (type) => {
    if (!prices || releves.length < 2) return null;
    return EstimationService.calculateMonthlyBill(
      releves, 
      type, 
      parseFloat(prices[type])
    );
  };

  const eauEstimation = getEstimation("Eau");
  const electriciteEstimation = getEstimation("Électricité");

  const hasEstimations = eauEstimation || electriciteEstimation;
  const totalReleves = releves.length;
  const eauCount = releves.filter(r => r.type === "Eau").length;
  const electriciteCount = releves.filter(r => r.type === "Électricité").length;

  if (loading) {
    return <LoadingScreen message="Chargement de vos données..." />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header avec animation */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.logoContainer,
            { 
              backgroundColor: colors.primary,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.logo}>💧⚡</Text>
        </Animated.View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          EcoConsommation
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Maîtrisez votre consommation d'eau et d'électricité
        </Text>
        
        {/* Stats rapides */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {totalReleves}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Relevés
            </Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {eauCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Eau
            </Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {electriciteCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Électricité
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Section Estimations */}
      {hasEstimations ? (
        <Animated.View 
          style={[
            styles.estimationsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📊 Estimations du mois
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Basé sur vos derniers relevés
            </Text>
          </View>
          
          <View style={styles.estimationsGrid}>
            {eauEstimation && (
              <View style={styles.estimationItem}>
                <EstimationCard
                  type="Eau"
                  estimation={eauEstimation}
                  icon="💧"
                />
              </View>
            )}
            
            {electriciteEstimation && (
              <View style={styles.estimationItem}>
                <EstimationCard
                  type="Électricité"
                  estimation={electriciteEstimation}
                  icon="⚡"
                />
              </View>
            )}
          </View>
        </Animated.View>
      ) : (
        <Animated.View 
          style={[
            styles.noDataContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.noDataEmoji}>📈</Text>
          <Text style={[styles.noDataTitle, { color: colors.text }]}>
            Commencez dès maintenant !
          </Text>
          <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
            Ajoutez vos premiers relevés d'eau et d'électricité{"\n"}
            pour voir vos estimations et statistiques.
          </Text>
          
          <AppButton 
            title="➕ Premier relevé" 
            onPress={() => router.push("/ajout")}
            variant="success"
            style={styles.startButton}
            size="large"
          />
        </Animated.View>
      )}

      {/* Section d'encouragement */}
      {totalReleves > 0 && (
        <Animated.View 
          style={[
            styles.encouragementContainer,
            {
              opacity: fadeAnim,
              backgroundColor: colors.card,
            }
          ]}
        >
          <Text style={[styles.encouragementTitle, { color: colors.text }]}>
            {totalReleves === 1 ? "Premier relevé ajouté !" : "Excellent travail !"}
          </Text>
          <Text style={[styles.encouragementText, { color: colors.textSecondary }]}>
            {totalReleves === 1 
              ? "Continuez à ajouter des relevés pour obtenir des estimations précises."
              : `Vous avez déjà ${totalReleves} relevés. Continuez comme ça !`
            }
          </Text>
          
          <View style={styles.encouragementActions}>
            <AppButton 
              title="📝 Nouveau relevé" 
              onPress={() => router.push("/ajout")}
              variant="primary"
              style={styles.encouragementButton}
            />
          </View>
        </Animated.View>
      )}

      {/* Tips écologiques */}
      <Animated.View 
        style={[
          styles.tipsContainer,
          {
            opacity: fadeAnim,
            backgroundColor: colors.success,
          }
        ]}
      >
        <Text style={styles.tipsTitle}>💡 Le saviez-vous ?</Text>
        <Text style={styles.tipsText}>
          {totalReleves === 0 
            ? "Suivre régulièrement sa consommation peut vous aider à réduire votre facture jusqu'à 15%."
            : "Réduire sa consommation d'eau chaude de 10% peut économiser jusqu'à 3% sur votre facture d'électricité."
          }
        </Text>
      </Animated.View>

      {/* Section progression */}
      {totalReleves > 0 && (
        <Animated.View 
          style={[
            styles.progressionContainer,
            {
              opacity: fadeAnim,
              backgroundColor: colors.card,
            }
          ]}
        >
          <Text style={[styles.progressionTitle, { color: colors.text }]}>
            🎯 Votre progression
          </Text>
          
          <View style={styles.progressionStats}>
            <View style={styles.progressionItem}>
              <Text style={[styles.progressionNumber, { color: colors.primary }]}>
                {eauCount}
              </Text>
              <Text style={[styles.progressionLabel, { color: colors.textSecondary }]}>
                Relevés d'eau
              </Text>
            </View>
            
            <View style={styles.progressionItem}>
              <Text style={[styles.progressionNumber, { color: colors.primary }]}>
                {electriciteCount}
              </Text>
              <Text style={[styles.progressionLabel, { color: colors.textSecondary }]}>
                Relevés d'électricité
              </Text>
            </View>
          </View>
          
          <Text style={[styles.progressionTip, { color: colors.textSecondary }]}>
            {totalReleves >= 10 
              ? "Expert en suivi ! Pensez à analyser vos tendances dans l'onglet Graphiques."
              : totalReleves >= 5
              ? "Bonne régularité ! Continuez pour des analyses plus précises."
              : "Bien commencé ! Ajoutez plus de relevés pour améliorer la précision."
            }
          </Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logo: {
    fontSize: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: width - 40,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    marginHorizontal: 10,
  },
  estimationsContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  estimationsGrid: {
    gap: 15,
  },
  estimationItem: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noDataContainer: {
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  noDataEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  noDataText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
  },
  startButton: {
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  encouragementContainer: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  encouragementTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  encouragementText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  encouragementActions: {
    alignItems: "center",
  },
  encouragementButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#34C759",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
    opacity: 0.9,
  },
  progressionContainer: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  progressionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  progressionStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  progressionItem: {
    alignItems: "center",
  },
  progressionNumber: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  progressionLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  progressionTip: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    fontStyle: "italic",
  },
});