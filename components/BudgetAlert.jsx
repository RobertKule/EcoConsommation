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

export default function BudgetAlert({ alert, onDismiss, onAdjustBudget }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;

  if (!alert) return null;

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'dépassement':
        return 'alert-circle';
      case 'consommation_anormale':
        return 'water';
      case 'tendance_hausse':
        return 'trending-up';
      default:
        return 'information-circle';
    }
  };

  const getAlertColor = () => {
    switch (alert.severity) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[styles.alertContainer, { backgroundColor: getAlertColor() + '15', borderColor: getAlertColor() }]}>
      <View style={styles.alertContent}>
        <Ionicons name={getAlertIcon()} size={20} color={getAlertColor()} />
        <View style={styles.alertTextContainer}>
          <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.message}</Text>
          {alert.estimation && alert.budget && (
            <Text style={[styles.alertDetails, { color: colors.textSecondary }]}>
              Dépassement de {Math.round(alert.difference * 100) / 100} €
            </Text>
          )}
        </View>
      </View>
      <View style={styles.alertActions}>
        {onAdjustBudget && (
          <TouchableOpacity style={styles.actionButton} onPress={onAdjustBudget}>
            <Text style={[styles.actionText, { color: getAlertColor() }]}>Ajuster budget</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Ionicons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alertContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertDetails: {
    fontSize: 12,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
    borderRadius: 12,
  },
});