import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";
import { getStorageMode, initDB } from "../services/storageService";

// Couleurs pour les thèmes
const Colors = {
  light: {
    primary: "#007AFF",
    secondary: "#5856D6",
    background: "#f8faff",
    card: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666",
    border: "#f0f0f0",
    tabBar: "#ffffff",
    headerGradient: ["#007AFF", "#5AC8FA"],
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30"
  },
  dark: {
    primary: "#0A84FF",
    secondary: "#BF5AF2",
    background: "#000000",
    card: "#1c1c1e",
    text: "#ffffff",
    textSecondary: "#98989f",
    border: "#38383a",
    tabBar: "#1c1c1e",
    headerGradient: ["#0A84FF", "#5E5CE6"],
    success: "#30D158",
    warning: "#FF9F0A",
    error: "#FF453A"
  }
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = useMemo(() => Colors[colorScheme] || Colors.light, [colorScheme]);
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState(null);
  
  // Animations pour les tabs
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Animation pour le changement de thème
  const themeFadeAnim = useRef(new Animated.Value(1)).current;

  // Initialisation de la base de données avec gestion d'erreur
  const initializeApp = useCallback(async () => {
    try {
      console.log('🔄 Initialisation de la base de données...');
      await initDB();
      setDbInitialized(true);
      setDbError(null);
      
      const storageMode = getStorageMode();
      console.log(`✅ Base initialisée (${storageMode})`);
    } catch (error) {
      console.error('❌ Erreur initialisation base:', error);
      setDbError(error.message);
      setDbInitialized(true); // On laisse quand même l'app se lancer
    }
  }, []);

  useEffect(() => {
    initializeApp();
    startTabAnimation();
  }, [initializeApp]);

  const startTabAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, rotateAnim]);

  // Animation du changement de thème
  useEffect(() => {
    const themeAnimation = Animated.sequence([
      Animated.timing(themeFadeAnim, {
        toValue: 0.3,
        duration: 100,
        useNativeDriver: true,
        useNativeDriver: true,
      }),
      Animated.timing(themeFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        useNativeDriver: true,
      }),
    ]);

    themeAnimation.start();
  }, [colorScheme, themeFadeAnim]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const getTabBarIcon = useCallback((name, focused) => {
    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const scale = focused ? 
      scaleAnim.interpolate({
        inputRange: [0.8, 1],
        outputRange: [1, 1.2],
      }) : 1;

    return (
      <Animated.View style={{ transform: [{ rotate }, { scale }] }}>
        <Ionicons 
          name={name} 
          size={24} 
          color={focused ? colors.primary : colors.textSecondary} 
        />
      </Animated.View>
    );
  }, [scaleAnim, rotateAnim, colors]);

  const HeaderBackground = useCallback(() => (
    <Animated.View 
      style={[
        styles.headerBackground,
        {
          backgroundColor: colors.primary,
          opacity: themeFadeAnim,
        }
      ]}
    >
      <View style={[styles.headerGradient, { 
        backgroundColor: colors.primary,
        opacity: 0.9,
      }]} />
    </Animated.View>
  ), [colors.primary, themeFadeAnim]);

  const CustomHeaderTitle = useCallback(({ title, showLogo = false }) => (
    <Animated.View 
      style={[
        styles.headerTitleContainer,
        { opacity: themeFadeAnim }
      ]}
    >
      {showLogo && (
        <Text style={[styles.headerLogo, { color: colors.text }]}>
          💧⚡
        </Text>
      )}
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        {title}
      </Text>
    </Animated.View>
  ), [colors.text, themeFadeAnim]);

  const ThemeToggleButton = useCallback(() => (
    <TouchableOpacity 
      style={[
        styles.themeToggle,
        { backgroundColor: colors.text + '15' } // 15 = ~10% opacity en hex
      ]}
      onPress={toggleDarkMode}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons 
        name={isDarkMode ? "sunny-outline" : "moon-outline"} 
        size={22} 
        color={colors.text} 
      />
    </TouchableOpacity>
  ), [isDarkMode, colors.text, toggleDarkMode]);

  // Écran de chargement pendant l'initialisation
  if (!dbInitialized) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.loadingContent, { opacity: themeFadeAnim }]}>
          <View style={styles.loadingAnimation}>
            <Ionicons name="water" size={48} color={colors.primary} />
            <Ionicons name="flash" size={48} color={colors.secondary} />
          </View>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            EcoConsommation
          </Text>
          <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
            Initialisation en cours...
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Écran d'erreur si l'initialisation a échoué
  if (dbError) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.errorContent, { opacity: themeFadeAnim }]}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Erreur d'initialisation
          </Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {dbError}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={initializeApp}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: colors.background,
          opacity: themeFadeAnim 
        }
      ]}
    >
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.primary}
        animated={true}
      />
      
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: colors.tabBar,
              borderTopColor: colors.border,
            }
          ],
          tabBarLabelStyle: styles.tabBarLabel,
          headerStyle: [
            styles.header,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            }
          ],
          headerTitleStyle: [styles.headerTitle, { color: colors.text }],
          headerTitleAlign: 'center',
          headerShadowVisible: true,
          headerTintColor: colors.text,
          headerBackground: HeaderBackground,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Tableau de bord",
            tabBarIcon: ({ focused }) => getTabBarIcon("home-outline", focused),
            headerTitle: () => (
              <CustomHeaderTitle title="EcoConsommation" showLogo={true} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="historique"
          options={{
            title: "Historique",
            tabBarIcon: ({ focused }) => getTabBarIcon("time-outline", focused),
            headerTitle: () => (
              <CustomHeaderTitle title="Mes Relevés" />
            ),
          }}
        />
        
        <Tabs.Screen
          name="graphiques"
          options={{
            title: "Graphiques",
            tabBarIcon: ({ focused }) => getTabBarIcon("bar-chart-outline", focused),
            headerTitle: () => (
              <CustomHeaderTitle title="Analyses" />
            ),
          }}
        />
        
        <Tabs.Screen
          name="parametres"
          options={{
            title: "Paramètres",
            tabBarIcon: ({ focused }) => getTabBarIcon("settings-outline", focused),
            headerTitle: () => (
              <CustomHeaderTitle title="Paramètres" />
            ),
            headerRight: ThemeToggleButton,
          }}
        />
        
        <Tabs.Screen
          name="ajout"
          options={{
            title: "Ajouter",
            tabBarButton: () => null,
            headerTitle: () => (
              <CustomHeaderTitle title="Nouveau Relevé" />
            ),
          }}
        />
      </Tabs>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 20,
  },
  loadingAnimation: {
    flexDirection: 'row',
    gap: 16,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingSubtext: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContent: {
    alignItems: 'center',
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 20,
    paddingTop: 10,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  header: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  themeToggle: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});