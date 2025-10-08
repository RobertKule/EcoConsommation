import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState } from 'react';
import {
    Alert,
    Platform,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import AppButton from '../Button/AppButton';

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

export default function ChartExport({ 
  chartComponent, 
  chartTitle = "Graphique",
  fileName = "graphique",
  onExportStart,
  onExportSuccess,
  onExportError 
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  const viewShotRef = useRef();
  const [isExporting, setIsExporting] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS === 'ios') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    }
    return true;
  };

  const captureChart = async () => {
    try {
      if (!viewShotRef.current) return null;
      
      const uri = await viewShotRef.current.capture();
      return uri;
    } catch (error) {
      console.error('Erreur capture graphique:', error);
      onExportError?.(error);
      return null;
    }
  };

  const saveToGallery = async (uri) => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      
      if (status !== 'granted') {
        const permissionGranted = await requestPermissions();
        if (!permissionGranted) {
          throw new Error('Permission galerie refusée');
        }
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('EcoConsommation', asset, false);
      
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde galerie:', error);
      throw error;
    }
  };

  const shareImage = async (uri) => {
    try {
      await Share.share({
        url: uri,
        title: `Graphique EcoConsommation - ${chartTitle}`,
        message: `Voici mon graphique de consommation: ${chartTitle}`
      });
    } catch (error) {
      console.error('Erreur partage:', error);
      throw error;
    }
  };

  const saveToFile = async (uri) => {
    try {
      const directory = `${FileSystem.documentDirectory}exports/`;
      const fileUri = `${directory}${fileName}_${Date.now()}.png`;
      
      // Créer le dossier s'il n'existe pas
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      
      // Copier le fichier
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri
      });
      
      return fileUri;
    } catch (error) {
      console.error('Erreur sauvegarde fichier:', error);
      throw error;
    }
  };

  const handleExport = async (action) => {
    try {
      setIsExporting(true);
      onExportStart?.();

      // Capturer le graphique
      const imageUri = await captureChart();
      if (!imageUri) {
        throw new Error('Impossible de capturer le graphique');
      }

      let success = false;
      let message = '';

      switch (action) {
        case 'gallery':
          await saveToGallery(imageUri);
          success = true;
          message = 'Graphique sauvegardé dans la galerie 📸';
          break;

        case 'share':
          await shareImage(imageUri);
          success = true;
          message = 'Graphique partagé avec succès 📤';
          break;

        case 'file':
          const filePath = await saveToFile(imageUri);
          success = true;
          message = `Graphique sauvegardé: ${filePath.split('/').pop()} 💾`;
          break;

        default:
          throw new Error('Action non supportée');
      }

      if (success) {
        onExportSuccess?.(message);
        Alert.alert('Succès 🎉', message);
      }

    } catch (error) {
      console.error('Erreur export:', error);
      const errorMessage = error.message || 'Erreur lors de l\'export';
      onExportError?.(error);
      Alert.alert('Erreur ❌', errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const showExportOptions = () => {
    Alert.alert(
      'Exporter le graphique',
      'Choisissez une option d\'export:',
      [
        {
          text: 'Partager',
          onPress: () => handleExport('share'),
          icon: '📤'
        },
        {
          text: 'Sauvegarder dans la galerie',
          onPress: () => handleExport('gallery'),
          icon: '📸'
        },
        {
          text: 'Sauvegarder en fichier',
          onPress: () => handleExport('file'),
          icon: '💾'
        },
        {
          text: 'Annuler',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Zone de capture du graphique */}
      <ViewShot
        ref={viewShotRef}
        options={{ 
          format: 'png', 
          quality: 1.0,
          result: 'data-uri'
        }}
        style={styles.captureArea}
      >
        <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
          {/* En-tête du graphique pour l'export */}
          <View style={styles.exportHeader}>
            <Text style={[styles.exportTitle, { color: colors.text }]}>
              {chartTitle}
            </Text>
            <Text style={[styles.exportSubtitle, { color: colors.textSecondary }]}>
              Généré le {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
          
          {/* Le graphique à exporter */}
          {chartComponent}
          
          {/* Pied de page pour l'export */}
          <View style={styles.exportFooter}>
            <Text style={[styles.exportFooterText, { color: colors.textSecondary }]}>
              EcoConsommation App - Suivi de consommation
            </Text>
          </View>
        </View>
      </ViewShot>

      {/* Boutons d'export */}
      <View style={styles.exportButtons}>
        <Text style={[styles.exportLabel, { color: colors.text }]}>
          Exporter ce graphique:
        </Text>
        
        <View style={styles.buttonRow}>
          <AppButton
            title="Partager"
            onPress={() => handleExport('share')}
            variant="secondary"
            size="small"
            loading={isExporting}
            icon="share-outline"
            style={styles.exportButton}
          />
          
          <AppButton
            title="Galerie"
            onPress={() => handleExport('gallery')}
            variant="secondary"
            size="small"
            loading={isExporting}
            icon="image-outline"
            style={styles.exportButton}
          />
          
          <TouchableOpacity
            style={[styles.moreButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={showExportOptions}
            disabled={isExporting}
          >
            <Ionicons 
              name="ellipsis-horizontal" 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicateur d'export */}
      {isExporting && (
        <View style={[styles.exportingOverlay, { backgroundColor: colors.background + 'CC' }]}>
          <View style={[styles.exportingContent, { backgroundColor: colors.card }]}>
            <Ionicons name="cloud-upload" size={32} color={colors.primary} />
            <Text style={[styles.exportingText, { color: colors.text }]}>
              Export en cours...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  captureArea: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartContainer: {
    padding: 16,
  },
  exportHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exportSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  exportFooter: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  exportFooterText: {
    fontSize: 10,
    textAlign: 'center',
  },
  exportButtons: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  exportLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  exportButton: {
    flex: 1,
  },
  moreButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  exportingContent: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  exportingText: {
    fontSize: 16,
    fontWeight: '600',
  },
});