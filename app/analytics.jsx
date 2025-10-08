import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import AppButton from '../components/Button/AppButton';
import AdvancedChartContainer from '../components/Charts/AdvancedChartContainer';
import LoadingScreen from '../components/LoadingScreen';
import { AnalyticsService } from '../services/AnalyticsService';
import { fetchReleves } from '../services/storageService';

const Colors = {
  light: {
    primary: "#007AFF",
    secondary: "#5856D6",
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
    secondary: "#BF5AF2",
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

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;

  const [dataEau, setDataEau] = useState([]);
  const [dataElectricite, setDataElectricite] = useState([]);
  const [selectedType, setSelectedType] = useState('both'); // 'eau', 'electricite', 'both'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analysis, setAnalysis] = useState({
    eau: null,
    electricite: null
  });

  const loadData = useCallback(async () => {
    try {
      await fetchReleves(
        (releves) => {
          const eauData = releves.filter(r => r.type === "Eau");
          const electriciteData = releves.filter(r => r.type === "Électricité");
          
          setDataEau(eauData);
          setDataElectricite(electriciteData);

          // Calculer les analyses
          const eauAnalysis = AnalyticsService.analyzeConsumption(releves, "Eau");
          const electriciteAnalysis = AnalyticsService.analyzeConsumption(releves, "Électricité");
          
          setAnalysis({
            eau: eauAnalysis,
            electricite: electriciteAnalysis
          });

          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error("Erreur chargement données:", error);
          setLoading(false);
          setRefreshing(false);
        }
      );
    } catch (error) {
      console.error("Erreur critique:", error);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleGenerateReport = useCallback((type) => {
    const releves = type === 'Eau' ? dataEau : dataElectricite;
    if (releves.length < 2) {
      Alert.alert('Données insuffisantes', `Ajoutez plus de relevés ${type} pour générer un rapport.`);
      return;
    }

    const report = AnalyticsService.generateReport(releves, type);
    Alert.alert(
      `Rapport ${type}`,
      `Consommation moyenne: ${report.consumption.daily.average} ${type === 'Eau' ? 'L/jour' : 'kWh/jour'}\n` +
      `Tendance: ${report.consumption.trends.direction}\n` +
      `Recommandations: ${report.recommendations.length}`,
      [{ text: 'OK' }]
    );
  }, [dataEau, dataElectricite]);

  const getAlertCount = useCallback((type) => {
    const analysisData = analysis[type === 'Eau' ? 'eau' : 'electricite'];
    return analysisData?.alerts?.length || 0;
  }, [analysis]);

  const getTrendIcon = useCallback((type) => {
    const analysisData = analysis[type === 'Eau' ? 'eau' : 'electricite'];
    if (!analysisData) return 'remove';
    
    switch (analysisData.trends.direction) {
      case 'hausse': return 'trending-up';
      case 'baisse': return 'trending-down';
      default: return 'remove';
    }
  }, [analysis]);

  if (loading) {
    return <LoadingScreen message="Analyse des données en cours..." />;
  }

  const totalReleves = dataEau.length + dataElectricite.length;
  const hasData = totalReleves > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>
              📊 Analyse Avancée
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Statistiques détaillées et tendances
            </Text>
          </View>
          
          <AppButton 
            title="Actualiser" 
            onPress={handleRefresh}
            variant="secondary"
            size="small"
            loading={refreshing}
          />
        </View>

        {/* Sélecteur de type */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.typeSelector}
          contentContainerStyle={styles.typeSelectorContent}
        >
          {[
            { key: 'both', label: '📈 Tous', icon: 'bar-chart' },
            { key: 'eau', label: '💧 Eau', icon: 'water' },
            { key: 'electricite', label: '⚡ Électricité', icon: 'flash' }
          ].map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeButton,
                {
                  backgroundColor: selectedType === type.key ? colors.primary : colors.card,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setSelectedType(type.key)}
            >
              <Ionicons 
                name={type.icon} 
                size={16} 
                color={selectedType === type.key ? '#fff' : colors.textSecondary} 
              />
              <Text style={[
                styles.typeButtonText,
                { 
                  color: selectedType === type.key ? '#fff' : colors.textSecondary 
                }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {!hasData ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="analytics" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Aucune donnée à analyser
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Ajoutez des relevés pour obtenir des analyses détaillées et des recommandations personnalisées
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Cartes de résumé */}
          <View style={styles.summaryCards}>
            {(selectedType === 'both' || selectedType === 'eau') && dataEau.length > 0 && (
              <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitle}>
                    <Ionicons name="water" size={20} color="#007AFF" />
                    <Text style={[styles.cardTitleText, { color: colors.text }]}>
                      Consommation Eau
                    </Text>
                  </View>
                  <View style={styles.cardStats}>
                    <Ionicons 
                      name={getTrendIcon('Eau')} 
                      size={16} 
                      color={analysis.eau?.trends.direction === 'hausse' ? colors.error : colors.success} 
                    />
                    {getAlertCount('Eau') > 0 && (
                      <View style={[styles.alertBadge, { backgroundColor: colors.error }]}>
                        <Text style={styles.alertCount}>{getAlertCount('Eau')}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {analysis.eau?.daily.average || 0} L/jour
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Moyenne quotidienne
                  </Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                    {dataEau.length} relevé(s)
                  </Text>
                  <AppButton 
                    title="Rapport" 
                    onPress={() => handleGenerateReport('Eau')}
                    variant="outline"
                    size="small"
                  />
                </View>
              </View>
            )}

            {(selectedType === 'both' || selectedType === 'electricite') && dataElectricite.length > 0 && (
              <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitle}>
                    <Ionicons name="flash" size={20} color="#FF9500" />
                    <Text style={[styles.cardTitleText, { color: colors.text }]}>
                      Consommation Électricité
                    </Text>
                  </View>
                  <View style={styles.cardStats}>
                    <Ionicons 
                      name={getTrendIcon('Électricité')} 
                      size={16} 
                      color={analysis.electricite?.trends.direction === 'hausse' ? colors.error : colors.success} 
                    />
                    {getAlertCount('Électricité') > 0 && (
                      <View style={[styles.alertBadge, { backgroundColor: colors.error }]}>
                        <Text style={styles.alertCount}>{getAlertCount('Électricité')}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {analysis.electricite?.daily.average || 0} kWh/jour
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Moyenne quotidienne
                  </Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                    {dataElectricite.length} relevé(s)
                  </Text>
                  <AppButton 
                    title="Rapport" 
                    onPress={() => handleGenerateReport('Électricité')}
                    variant="outline"
                    size="small"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Graphiques */}
          <View style={styles.chartsSection}>
            {(selectedType === 'both' || selectedType === 'eau') && dataEau.length > 0 && (
              <AdvancedChartContainer
                data={dataEau}
                title="Analyse détaillée - Eau"
                type="Eau"
                colors={["#007AFF", "#5AC8FA", "#34C759", "#64D2FF"]}
              />
            )}

            {(selectedType === 'both' || selectedType === 'electricite') && dataElectricite.length > 0 && (
              <AdvancedChartContainer
                data={dataElectricite}
                title="Analyse détaillée - Électricité"
                type="Électricité"
                colors={["#FF9500", "#FF3B30", "#FFD60A", "#FF9F0A"]}
              />
            )}
          </View>

          {/* Alertes et Recommandations */}
          <View style={styles.recommendationsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🚨 Alertes et Recommandations
            </Text>
            
            {analysis.eau?.alerts?.map((alert, index) => (
              <View key={index} style={[styles.alertCard, { backgroundColor: colors.card }]}>
                <Ionicons 
                  name="warning" 
                  size={20} 
                  color={colors.warning} 
                />
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: colors.text }]}>
                    {alert.message}
                  </Text>
                  <Text style={[styles.alertDate, { color: colors.textSecondary }]}>
                    {new Date(alert.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}

            {analysis.electricite?.alerts?.map((alert, index) => (
              <View key={index} style={[styles.alertCard, { backgroundColor: colors.card }]}>
                <Ionicons 
                  name="warning" 
                  size={20} 
                  color={colors.warning} 
                />
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: colors.text }]}>
                    {alert.message}
                  </Text>
                  <Text style={[styles.alertDate, { color: colors.textSecondary }]}>
                    {new Date(alert.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}

            {(!analysis.eau?.alerts?.length && !analysis.electricite?.alerts?.length) && (
              <View style={[styles.noAlerts, { backgroundColor: colors.card }]}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                <Text style={[styles.noAlertsText, { color: colors.text }]}>
                  Aucune alerte détectée
                </Text>
                <Text style={[styles.noAlertsSubtext, { color: colors.textSecondary }]}>
                  Votre consommation semble normale
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 20,
  },
  typeSelector: {
    backgroundColor: 'transparent',
  },
  typeSelectorContent: {
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryCards: {
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  alertCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
  chartsSection: {
    gap: 16,
    paddingHorizontal: 8,
  },
  recommendationsSection: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  alertDate: {
    fontSize: 12,
  },
  noAlerts: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
  },
  noAlertsText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  noAlertsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});