import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, useColorScheme } from "react-native";

const Colors = {
  light: {
    primary: "#007AFF",
    background: "#f8faff",
    card: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666",
    border: "#f0f0f0",
  },
  dark: {
    primary: "#0A84FF",
    background: "#000000",
    card: "#1c1c1e",
    text: "#ffffff",
    textSecondary: "#98989f",
    border: "#38383a",
  }
};

export default function SettingsSection({ title, children, style, colors, icon, subtitle }) {
  const colorScheme = useColorScheme();
  const themeColors = colors || Colors[colorScheme] || Colors.light;

  const renderTitle = () => {
    if (typeof title === 'string') {
      return (
        <View style={styles.sectionHeader}>
          <View style={styles.titleContent}>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: themeColors.primary + '15' }]}>
                <Ionicons 
                  name={icon} 
                  size={18} 
                  color={themeColors.primary} 
                />
              </View>
            )}
            <View style={styles.textContainer}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                {title}
              </Text>
              {subtitle && (
                <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          <View style={[styles.titleSeparator, { backgroundColor: themeColors.primary + '30' }]} />
        </View>
      );
    }
    
    return (
      <View style={styles.sectionHeader}>
        {title}
        <View style={[styles.titleSeparator, { backgroundColor: themeColors.primary + '30' }]} />
      </View>
    );
  };

  return (
    <View style={[styles.section, style]}>
      {title && renderTitle()}
      <View style={[
        styles.sectionContent, 
        { 
          backgroundColor: themeColors.card,
          shadowColor: themeColors.primary,
        }
      ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  titleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    opacity: 0.8,
  },
  titleSeparator: {
    height: 3,
    borderRadius: 2,
    width: '100%',
  },
  sectionContent: {
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    overflow: "hidden",
    marginHorizontal: 20,
  },
});