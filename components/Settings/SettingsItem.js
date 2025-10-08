import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SettingsItem({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  type = "button",
  value,
  onValueChange,
  showChevron = true,
  destructive = false 
}) {
  const renderContent = () => {
    switch (type) {
      case "switch":
        return (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={value ? "#007AFF" : "#f4f3f4"}
          />
        );
      case "button":
      default:
        return (
          showChevron && (
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color="#ccc" 
            />
          )
        );
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      disabled={type === "switch"}
    >
      <View style={styles.leftContent}>
        {icon && (
          <View style={[
            styles.iconContainer,
            destructive && styles.iconContainerDestructive
          ]}>
            <Text style={[
              styles.icon,
              destructive && styles.iconDestructive
            ]}>
              {icon}
            </Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            destructive && styles.titleDestructive
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.rightContent}>
        {renderContent()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#007AFF20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconContainerDestructive: {
    backgroundColor: "#ff4d4d20",
  },
  icon: {
    fontSize: 18,
  },
  iconDestructive: {
    color: "#ff4d4d",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  titleDestructive: {
    color: "#ff4d4d",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  rightContent: {
    marginLeft: 10,
  },
});