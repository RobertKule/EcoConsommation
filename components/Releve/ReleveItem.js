import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";

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

export default function ReleveItem({ item, onEdit, onDelete }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;

  const getTypeIcon = () => {
    return item.type === "Eau" ? "💧" : "⚡";
  };

  const getTypeColor = () => {
    return item.type === "Eau" ? "#007AFF" : "#FF9500";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatIndex = (index) => {
    const value = parseFloat(index);
    if (item.type === "Eau") {
      return `${value.toLocaleString('fr-FR')} L`;
    } else {
      return `${value.toLocaleString('fr-FR')} kWh`;
    }
  };

  return (
    <View style={[styles.item, { backgroundColor: colors.card }]}>
      {/* En-tête avec type et date */}
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <View style={[styles.iconContainer, { backgroundColor: getTypeColor() + '20' }]}>
            <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
          </View>
          <View>
            <Text style={[styles.type, { color: colors.text }]}>
              {item.type}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {formatDate(item.date)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.indexContainer, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.indexValue, { color: colors.primary }]}>
            {formatIndex(item.index_val)}
          </Text>
        </View>
      </View>

      {/* Actions avec icônes */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
          onPress={() => onEdit(item)}
        >
          <Ionicons name="pencil" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Modifier
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.error + '15' }]}
          onPress={() => onDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>
            Supprimer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Version compacte avec seulement des icônes (alternative)
export function ReleveItemCompact({ item, onEdit, onDelete }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;

  const getTypeIcon = () => {
    return item.type === "Eau" ? "💧" : "⚡";
  };

  const getTypeColor = () => {
    return item.type === "Eau" ? "#007AFF" : "#FF9500";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatIndex = (index) => {
    const value = parseFloat(index);
    if (item.type === "Eau") {
      return `${value.toLocaleString('fr-FR')} L`;
    } else {
      return `${value.toLocaleString('fr-FR')} kWh`;
    }
  };

  return (
    <View style={[styles.compactItem, { backgroundColor: colors.card }]}>
      <View style={styles.compactMain}>
        <View style={styles.compactType}>
          <View style={[styles.compactIconContainer, { backgroundColor: getTypeColor() + '20' }]}>
            <Text style={styles.compactTypeIcon}>{getTypeIcon()}</Text>
          </View>
          <View>
            <Text style={[styles.compactTypeText, { color: colors.text }]}>
              {item.type}
            </Text>
            <Text style={[styles.compactDate, { color: colors.textSecondary }]}>
              {formatDate(item.date)}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.compactIndex, { color: colors.primary }]}>
          {formatIndex(item.index_val)}
        </Text>
      </View>

      <View style={styles.compactActions}>
        <TouchableOpacity 
          style={[styles.compactAction, { marginRight: 12 }]}
          onPress={() => onEdit(item)}
        >
          <Ionicons name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.compactAction}
          onPress={() => onDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Version standard
  item: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  typeIcon: {
    fontSize: 20,
  },
  type: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    fontWeight: "400",
  },
  indexContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  indexValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Version compacte
  compactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  compactMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  compactType: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  compactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  compactTypeIcon: {
    fontSize: 16,
  },
  compactTypeText: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  compactDate: {
    fontSize: 12,
    fontWeight: "400",
  },
  compactIndex: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
  compactActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactAction: {
    padding: 6,
    borderRadius: 8,
  },
});