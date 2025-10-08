import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { getStorageMode, insertReleve } from '../services/storageService';

const Colors = {
  light: {
    primary: "#007AFF",
    secondary: "#5856D6",
    background: "#f8faff",
    card: "#ffffff",
    text: "#1a1a1a",
    textSecondary: "#666",
    border: "#f0f0f0",
    inputBackground: "#ffffff",
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
    inputBackground: "#2c2c2e",
    success: "#30D158",
    warning: "#FF9F0A",
    error: "#FF453A"
  }
};

// Types de relevés constants
const TYPES_RELEVE = [
  { id: 'Eau', label: '💧 Eau', unit: 'm³' },
  { id: 'Électricité', label: '⚡ Électricité', unit: 'kWh' },
];

export default function AjoutReleve() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  const router = useRouter();

  const [type, setType] = useState('Eau');
  const [index_val, setIndexVal] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mémoization des valeurs calculées
  const currentType = useMemo(() => 
    TYPES_RELEVE.find(t => t.id === type), 
    [type]
  );

  const storageMode = useMemo(() => getStorageMode(), []);

  // Callbacks optimisés avec useCallback
  const handleDateChange = useCallback((event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  const formatDate = useCallback((date) => {
    return date.toISOString().split('T')[0];
  }, []);

  const validateForm = useCallback(() => {
    const numericValue = parseFloat(index_val);
    
    if (!index_val.trim() || isNaN(numericValue)) {
      Alert.alert('Erreur', 'Veuillez saisir un index valide');
      return false;
    }

    if (numericValue < 0) {
      Alert.alert('Erreur', "L'index ne peut pas être négatif");
      return false;
    }

    // Validation supplémentaire : valeur trop élevée
    if (numericValue > 1000000) {
      Alert.alert('Erreur', "L'index semble trop élevé. Vérifiez votre saisie.");
      return false;
    }

    return true;
  }, [index_val]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await insertReleve(
        type,
        parseFloat(index_val),
        formatDate(date),
        (newReleve) => {
          console.log('✅ Relevé ajouté avec succès:', newReleve);
          Alert.alert(
            'Succès 🎉',
            `Relevé ${type} ajouté avec succès !\nIndex: ${index_val} ${currentType?.unit}`,
            [
              {
                text: 'Retour à l\'accueil',
                onPress: () => router.replace('/(tabs)')
              },
              {
                text: 'Ajouter un autre',
                onPress: () => {
                  setIndexVal('');
                  setDate(new Date());
                },
                style: 'default'
              }
            ]
          );
        },
        (error) => {
          console.error('❌ Erreur ajout relevé:', error);
          Alert.alert(
            'Erreur',
            'Une erreur est survenue lors de l\'ajout du relevé. Veuillez réessayer.'
          );
        }
      );
    } catch (error) {
      console.error('❌ Erreur critique:', error);
      Alert.alert(
        'Erreur Critique',
        'Impossible d\'ajouter le relevé. Vérifiez votre connexion et réessayez.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [type, index_val, date, validateForm, formatDate, currentType?.unit, router]);

  const handleTypeSelect = useCallback((selectedType) => {
    setType(selectedType);
    // Réinitialiser l'index quand on change de type pour éviter les confusions
    if (index_val) {
      Alert.alert(
        'Changement de type',
        `Vous changez de ${type} à ${selectedType}. L'index actuel sera réinitialisé.`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Continuer', 
            onPress: () => setIndexVal(''),
            style: 'destructive'
          }
        ]
      );
    }
  }, [type, index_val]);

  const handleCancel = useCallback(() => {
    if (index_val.trim() && !isSubmitting) {
      Alert.alert(
        'Annuler',
        'Voulez-vous vraiment annuler ? Les données saisies seront perdues.',
        [
          { text: 'Continuer la saisie', style: 'cancel' },
          { text: 'Annuler', onPress: () => router.back(), style: 'destructive' }
        ]
      );
    } else {
      router.back();
    }
  }, [index_val, isSubmitting, router]);

  const showDatePickerModal = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  // Rendu optimisé des boutons de type
  const renderTypeButtons = useMemo(() => 
    TYPES_RELEVE.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.typeButton,
          {
            backgroundColor: type === item.id ? colors.primary : colors.card,
            borderColor: type === item.id ? colors.primary : colors.border,
          }
        ]}
        onPress={() => handleTypeSelect(item.id)}
        disabled={isSubmitting}
      >
        <Text
          style={[
            styles.typeButtonText,
            {
              color: type === item.id ? '#fff' : colors.text,
              opacity: isSubmitting ? 0.6 : 1,
            }
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    )), 
    [type, colors, isSubmitting, handleTypeSelect]
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Nouveau Relevé
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Ajoutez un nouveau relevé de consommation
          </Text>
        </View>

        {/* Sélection du type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Type de consommation
          </Text>
          <View style={styles.typeContainer}>
            {renderTypeButtons}
          </View>
        </View>

        {/* Saisie de l'index */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Index de consommation
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                  opacity: isSubmitting ? 0.6 : 1,
                }
              ]}
              placeholder={`Saisir l'index en ${currentType?.unit || ''}`}
              placeholderTextColor={colors.textSecondary}
              value={index_val}
              onChangeText={setIndexVal}
              keyboardType="decimal-pad"
              returnKeyType="done"
              editable={!isSubmitting}
              selectTextOnFocus={!isSubmitting}
            />
            <Text style={[styles.unit, { color: colors.textSecondary }]}>
              {currentType?.unit || ''}
            </Text>
          </View>
        </View>

        {/* Sélection de la date */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Date du relevé
          </Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: isSubmitting ? 0.6 : 1,
              }
            ]}
            onPress={showDatePickerModal}
            disabled={isSubmitting}
          >
            <Ionicons 
              name="calendar" 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Bouton de soumission */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isSubmitting ? colors.textSecondary : colors.primary,
                opacity: isSubmitting ? 0.7 : 1,
              }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Ionicons name="hourglass-outline" size={20} color="#fff" />
            ) : (
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
            )}
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Ajout en cours...' : 'Ajouter le relevé'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                borderColor: colors.border,
                opacity: isSubmitting ? 0.6 : 1,
              }
            ]}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <Ionicons 
              name="arrow-back" 
              size={16} 
              color={colors.text} 
            />
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
              Annuler
            </Text>
          </TouchableOpacity>
        </View>

        {/* Informations */}
        <View style={[
          styles.infoBox,
          {
            backgroundColor: colorScheme === 'dark' ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 122, 255, 0.1)',
            borderColor: colorScheme === 'dark' ? 'rgba(10, 132, 255, 0.3)' : 'rgba(0, 122, 255, 0.3)',
          }
        ]}>
          <Ionicons 
            name="information-circle-outline" 
            size={20} 
            color={colors.primary} 
          />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Stockage {storageMode === 'sqlite' ? 'SQLite' : 'AsyncStorage'}
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {storageMode === 'sqlite' 
                ? 'Vos données sont stockées dans une base de données locale sécurisée.'
                : 'Vos données sont stockées dans le stockage local de l\'application.'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    paddingRight: 60,
    fontWeight: '500',
  },
  unit: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    marginTop: 20,
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 30,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});