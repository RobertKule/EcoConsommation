import { Ionicons } from '@expo/vector-icons';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

const Colors = {
  light: {
    primary: "#007AFF",
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
    card: "#1c1c1e",
    text: "#ffffff",
    textSecondary: "#98989f",
    border: "#38383a",
    success: "#30D158",
    warning: "#FF9F0A",
    error: "#FF453A"
  }
};

export default function BillEstimationCard({ estimation, onEdit, onDelete }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;

  if (!estimation) return null;

  const isOverBudget = estimation.estimation > 150; // budget par défaut

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <Ionicons 
            name={estimation.type === "Eau" ? "water" : "flash"} 
            size={16} 
            color={estimation.type === "Eau" ? "#007AFF" : "#FF9500"} 
          />
          <Text style={[styles.typeText, { color: estimation.type === "Eau" ? "#007AFF" : "#FF9500" }]}>
            {estimation.type}
          </Text>
        </View>
        {isOverBudget && (
          <View style={[styles.alertBadge, { backgroundColor: colors.error }]}>
            <Ionicons name="alert-circle" size={12} color="#fff" />
            <Text style={styles.alertText}>Budget dépassé</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Période :</Text>
          <Text style={[styles.value, { color: colors.text }]}>{estimation.periode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Consommation :</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {estimation.consommation} {estimation.type === "Eau" ? "L" : "kWh"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Estimation :</Text>
          <Text style={[styles.value, { color: colors.primary, fontWeight: 'bold' }]}>
            {estimation.estimation} €
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Ionicons name="pencil" size={16} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  alertText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  body: {
    flex: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
  },
});