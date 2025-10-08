import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { initDB } from "../services/Database";

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
  const colors = Colors[colorScheme] || Colors.light;
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  
  // Animations pour les tabs
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Animation pour le changement de thème
  const themeFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initDB();
    startTabAnimation();
  }, []);

  useEffect(() => {
    // Animation lors du changement de thème
    Animated.sequence([
      Animated.timing(themeFadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(themeFadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [colorScheme]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const startTabAnimation = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getTabBarIcon = (name, focused) => {
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
  };

  const HeaderBackground = () => (
    <Animated.View 
      style={[
        styles.headerBackground,
        {
          backgroundColor: colors.primary,
          opacity: themeFadeAnim,
        }
      ]}
    >
      <View style={[styles.headerGradient, { backgroundColor: colors.primary }]} />
    </Animated.View>
  );

  const CustomHeaderTitle = ({ title, showLogo = false }) => (
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
  );

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
          headerBackground: () => <HeaderBackground />,
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
            headerRight: () => (
              <TouchableOpacity 
                style={styles.themeToggle}
                onPress={toggleDarkMode}
              >
                <Ionicons 
                  name={isDarkMode ? "sunny" : "moon"} 
                  size={22} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            ),
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
    opacity: 0.9,
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
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});