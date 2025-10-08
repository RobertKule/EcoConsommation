import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";
import AppButton from "../components/Button/AppButton";
import BaseModal from "../components/Modal/BaseModal";
import ReleveForm from "../components/Releve/ReleveForm";
import { ReleveItemCompact } from "../components/Releve/ReleveItem";
import { deleteReleve, fetchReleves, insertReleve, updateReleve } from "../services/Database";

const { width } = Dimensions.get('window');

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

export default function Historique() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  
  const [releves, setReleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReleve, setSelectedReleve] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  const loadReleves = () => {
    setLoading(true);
    fetchReleves(
      (data) => {
        setReleves(data);
        setLoading(false);
        startAnimations();
      },
      (error) => {
        console.error("Erreur récupération relevés:", error);
        setLoading(false);
        startAnimations();
      }
    );
  };

  useEffect(() => {
    loadReleves();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Supprimer le relevé",
      "Êtes-vous sûr de vouloir supprimer ce relevé ? Cette action est irréversible.",
      [
        { 
          text: "Annuler", 
          style: "cancel" 
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            deleteReleve(id, loadReleves, (error) => {
              console.error("Erreur suppression :", error);
              Alert.alert("Erreur", "Impossible de supprimer le relevé");
            });
          },
        },
      ]
    );
  };

  const handleEdit = (releve) => {
    setSelectedReleve(releve);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setSelectedReleve(null);
    setModalVisible(true);
  };

  const handleSave = (formData) => {
    if (selectedReleve) {
      // Modification
      updateReleve(
        selectedReleve.id,
        formData.type,
        formData.indexVal,
        formData.date,
        () => {
          setModalVisible(false);
          loadReleves();
        },
        (error) => {
          console.error("Erreur modification relevé:", error);
          Alert.alert("Erreur", "Impossible de modifier le relevé");
        }
      );
    } else {
      // Ajout
      insertReleve(
        formData.type,
        formData.indexVal,
        formData.date,
        () => {
          setModalVisible(false);
          loadReleves();
        },
        (error) => {
          console.error("Erreur ajout relevé:", error);
          Alert.alert("Erreur", "Impossible d'ajouter le relevé");
        }
      );
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    
    setReleves([...releves].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return newOrder === 'desc' ? dateB - dateA : dateA - dateB;
    }));
  };

  const getStats = () => {
    const eauCount = releves.filter(r => r.type === "Eau").length;
    const electriciteCount = releves.filter(r => r.type === "Électricité").length;
    const totalConsumption = releves.reduce((sum, releve) => sum + parseFloat(releve.index_val), 0);
    
    return { eauCount, electriciteCount, totalConsumption };
  };

  const stats = getStats();

  const renderItem = ({ item, index }) => (
  <Animated.View
    style={{
      opacity: fadeAnim,
      transform: [
        { 
          translateY: slideAnim.interpolate({
            inputRange: [0, 30],
            outputRange: [0, 30 - (index * 2)]
          }) 
        }
      ]
    }}
  >
    <ReleveItemCompact  // ← Utilisez la version compacte ici
      item={item}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  </Animated.View>
);

  const EmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Aucun relevé pour le moment
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Commencez par ajouter votre premier relevé pour suivre votre consommation
      </Text>
      <AppButton 
        title="➕ Premier relevé" 
        onPress={handleAdd}
        variant="success"
        style={styles.emptyButton}
        size="large"
      />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: colors.text }]}>
            Historique des relevés
          </Text>
          <AppButton 
            title="+ Ajouter" 
            onPress={handleAdd}
            variant="success"
            style={styles.addButton}
            size="small"
          />
        </View>

        {/* Stats rapides */}
        {releves.length > 0 && (
          <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {releves.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {stats.eauCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Eau
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {stats.electriciteCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Électricité
              </Text>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Contrôles de tri */}
      {releves.length > 0 && (
        <Animated.View 
          style={[
            styles.controlsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.sortButton, { backgroundColor: colors.card }]}
            onPress={toggleSortOrder}
          >
            <Ionicons 
              name={sortOrder === 'desc' ? "arrow-down" : "arrow-up"} 
              size={16} 
              color={colors.primary} 
            />
            <Text style={[styles.sortText, { color: colors.primary }]}>
              Date {sortOrder === 'desc' ? '↓' : '↑'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Liste des relevés */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement des relevés...
          </Text>
        </View>
      ) : releves.length === 0 ? (
        <EmptyState />
      ) : (
        <Animated.View 
          style={[
            styles.listContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <FlatList
            data={releves}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </Animated.View>
      )}

      {/* Modal d'ajout/modification */}
      <BaseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={selectedReleve ? "Modifier le relevé" : "Nouveau relevé"}
      >
        <ReleveForm
          initialData={selectedReleve ? {
            type: selectedReleve.type,
            indexVal: selectedReleve.index_val,
            date: selectedReleve.date,
          } : {}}
          onSubmit={handleSave}
          onCancel={() => setModalVisible(false)}
          submitButtonText={selectedReleve ? "Modifier" : "Ajouter"}
        />
      </BaseModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 122, 255, 0.3)",
  },
  title: { 
    fontSize: 18, 
    fontWeight: "bold",
  },
  addButton: { 
    paddingVertical: 4, 
    paddingHorizontal: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    marginHorizontal: 10,
  },
  controlsContainer: {
    marginBottom: 15,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    gap: 6,
  },
  sortText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
    flex: 1,
  },
  list: { 
    paddingBottom: 30,
    gap: 12,
  },
});