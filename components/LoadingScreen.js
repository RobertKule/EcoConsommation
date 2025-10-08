import { useEffect, useRef } from 'react';
import {
    Animated,
    Easing, // ⬅️ IMPORT CORRECT
    StyleSheet,
    Text,
    useColorScheme,
    View
} from 'react-native';

const Colors = {
  light: {
    primary: "#007AFF",
    background: "#f8faff",
    text: "#1a1a1a",
  },
  dark: {
    primary: "#0A84FF",
    background: "#000000",
    text: "#ffffff",
  }
};

export default function LoadingScreen({ message = "Chargement..." }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Animation en parallèle
    Animated.parallel([
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Scale - CORRECTION ICI
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)), // ⬅️ UTILISEZ Easing DIRECTEMENT
        useNativeDriver: true,
      }),
      // Rotation continue - CORRECTION ICI
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear, // ⬅️ UTILISEZ Easing DIRECTEMENT
          useNativeDriver: true,
        })
      ),
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* Logo animé */}
        <Animated.View 
          style={[
            styles.logoContainer,
            { transform: [{ rotate }] }
          ]}
        >
          <Text style={styles.logo}>💧⚡</Text>
        </Animated.View>
        
        {/* Message */}
        <Text style={[styles.message, { color: colors.text }]}>
          {message}
        </Text>
        
        {/* Points de chargement animés */}
        <View style={styles.dotsContainer}>
          <Animated.View 
            style={[
              styles.dot,
              { 
                backgroundColor: colors.primary,
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.dot,
              { 
                backgroundColor: colors.primary,
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.dot,
              { 
                backgroundColor: colors.primary,
              }
            ]} 
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  logo: {
    fontSize: 40,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});