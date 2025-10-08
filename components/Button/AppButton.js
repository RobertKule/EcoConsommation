import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";

// Couleurs pour les thèmes
const Colors = {
  light: {
    primary: "#007AFF",
    secondary: "#6c757d",
    destructive: "#FF3B30",
    success: "#34C759",
    background: "#f8faff",
    text: "#1a1a1a",
    textSecondary: "#666",
    border: "#f0f0f0",
    disabled: "#E9ECEF"
  },
  dark: {
    primary: "#0A84FF",
    secondary: "#8e8e93",
    destructive: "#FF453A",
    success: "#30D158",
    background: "#000000",
    text: "#ffffff",
    textSecondary: "#98989f",
    border: "#38383a",
    disabled: "#2c2c2e"
  }
};

export default function AppButton({ 
  title, 
  onPress, 
  variant = "primary", 
  disabled = false,
  style = {},
  textStyle = {},
  icon, // Maintenant c'est le nom de l'icône Ionicons
  loading = false,
  size = "medium" 
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 2,
      borderColor: "transparent",
    };

    switch (variant) {
      case "secondary":
        return { ...baseStyle, backgroundColor: colors.secondary };
      case "destructive":
        return { ...baseStyle, backgroundColor: colors.destructive, shadowColor: colors.destructive, shadowOpacity: 0.3 };
      case "success":
        return { ...baseStyle, backgroundColor: colors.success, shadowColor: colors.success, shadowOpacity: 0.3 };
      case "outline":
        return { 
          ...baseStyle, 
          backgroundColor: "transparent", 
          borderColor: colors.primary,
          shadowOpacity: 0,
          elevation: 0,
        };
      case "ghost":
        return { 
          ...baseStyle, 
          backgroundColor: "transparent", 
          shadowOpacity: 0,
          elevation: 0,
        };
      default:
        return { ...baseStyle, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3 };
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontSize: 16,
      fontWeight: "600",
    };

    switch (variant) {
      case "outline":
      case "ghost":
        return { ...baseStyle, color: colors.primary };
      default:
        return { ...baseStyle, color: "#FFFFFF" };
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return colors.primary;
      default:
        return "#FFFFFF";
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return { paddingVertical: 10, paddingHorizontal: 16 };
      case "large":
        return { paddingVertical: 18, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 20 };
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case "small":
        return { fontSize: 14 };
      case "large":
        return { fontSize: 18 };
      default:
        return { fontSize: 16 };
    }
  };

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    setIsPressed(false);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          getButtonStyle(),
          getSizeStyle(),
          disabled && { backgroundColor: colors.disabled, borderColor: colors.disabled, shadowOpacity: 0, elevation: 0 },
          loading && { opacity: 0.8 },
          isPressed && { shadowOpacity: 0.2 },
          style,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        <View style={styles.buttonContent}>
          {icon && !loading && (
            <Ionicons 
              name={icon} 
              size={getTextSizeStyle().fontSize} 
              color={getIconColor()} 
            />
          )}
          
          {loading && (
            <View style={styles.loadingContainer}>
              <Animated.View style={[styles.loadingDot, { backgroundColor: getIconColor() }]} />
              <Animated.View style={[styles.loadingDot, { backgroundColor: getIconColor() }]} />
              <Animated.View style={[styles.loadingDot, { backgroundColor: getIconColor() }]} />
            </View>
          )}
          
          <Text style={[
            getTextStyle(),
            getTextSizeStyle(),
            loading && styles.loadingText,
            textStyle,
          ]}>
            {loading ? "Chargement..." : title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  loadingText: {
    opacity: 0.8,
  },
});