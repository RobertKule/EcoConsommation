import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState } from 'react';
import { Alert, Platform, Share, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import AppButton from '../Button/AppButton';

const Colors = {
  light: { primary: "#007AFF", card: "#ffffff", text: "#1a1a1a", textSecondary: "#666", border: "#f0f0f0" },
  dark: { primary: "#0A84FF", card: "#1c1c1e", text: "#ffffff", textSecondary: "#98989f", border: "#38383a" }
};

export default function ChartExport({ chartComponent, chartTitle = "Graphique", fileName = "graphique", onExportStart, onExportSuccess, onExportError }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme] || Colors.light;
  const viewShotRef = useRef();
  const [isExporting, setIsExporting] = useState(false);

  const captureChart = async () => {
    try { return await viewShotRef.current?.capture(); } 
    catch (error) { onExportError?.(error); return null; }
  };

  const handleExport = async (action) => {
    try {
      setIsExporting(true); onExportStart?.();
      const imageUri = await captureChart();
      if (!imageUri) throw new Error('Capture impossible');

      let message = '';
      switch (action) {
        case 'share': await Share.share({ url: imageUri, title: `EcoConsommation - ${chartTitle}` }); message = 'Partagé 📤'; break;
        case 'gallery': 
          if (Platform.OS === 'ios') {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') throw new Error('Permission refusée');
          }
          await MediaLibrary.createAssetAsync(imageUri); message = 'Galerie 📸'; break;
        case 'file': 
          const dir = `${FileSystem.documentDirectory}exports/`;
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
          await FileSystem.copyAsync({ from: imageUri, to: `${dir}${fileName}_${Date.now()}.png` });
          message = 'Fichier 💾'; break;
        default: throw new Error('Action non supportée');
      }

      onExportSuccess?.(message); Alert.alert('Succès 🎉', message);
    } catch (error) {
      onExportError?.(error); Alert.alert('Erreur ❌', error.message || 'Erreur export');
    } finally { setIsExporting(false); }
  };

  const showExportOptions = () => Alert.alert('Exporter', 'Choisissez:', [
    { text: 'Partager', onPress: () => handleExport('share') },
    { text: 'Galerie', onPress: () => handleExport('gallery') },
    { text: 'Fichier', onPress: () => handleExport('file') },
    { text: 'Annuler', style: 'cancel' }
  ]);

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={styles.captureArea}>
        <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
          <View style={styles.exportHeader}>
            <Text style={[styles.exportTitle, { color: colors.text }]}>{chartTitle}</Text>
            <Text style={[styles.exportSubtitle, { color: colors.textSecondary }]}>
              {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
          {chartComponent}
          <View style={styles.exportFooter}>
            <Text style={[styles.exportFooterText, { color: colors.textSecondary }]}>EcoConsommation</Text>
          </View>
        </View>
      </ViewShot>

      <View style={styles.exportButtons}>
        <View style={styles.buttonRow}>
          <AppButton title="Partager" onPress={() => handleExport('share')} variant="secondary" size="small" 
            loading={isExporting} icon="share-outline" style={styles.exportButton} />
          <AppButton title="Galerie" onPress={() => handleExport('gallery')} variant="secondary" size="small" 
            loading={isExporting} icon="image-outline" style={styles.exportButton} />
          <TouchableOpacity style={[styles.moreButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
            onPress={showExportOptions} disabled={isExporting}>
            <Ionicons name="ellipsis-horizontal" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {isExporting && (
        <View style={[styles.exportingOverlay, { backgroundColor: colors.card + 'CC' }]}>
          <View style={styles.exportingContent}>
            <Ionicons name="cloud-upload" size={20} color={colors.primary} />
            <Text style={[styles.exportingText, { color: colors.text }]}>Export...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 1,overflow:"scroll"},
  captureArea: { borderRadius: 4, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 0.5 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 0.5 },
  chartContainer: { padding: 4 },
  exportHeader: { alignItems: 'center', marginBottom: 4, paddingBottom: 2, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  exportTitle: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  exportSubtitle: { fontSize: 9, textAlign: 'center', marginTop: 0 },
  exportFooter: { alignItems: 'center', marginTop: 4, paddingTop: 2, borderTopWidth: 0.5, borderTopColor: '#f0f0f0' },
  exportFooterText: { fontSize: 7, textAlign: 'center' },
  exportButtons: { marginTop: 6 },
  buttonRow: { flexDirection: 'row', gap: 2, alignItems: 'center' },
  exportButton: { flex: 1, paddingVertical: 4 },
  moreButton: { padding: 6, borderRadius: 3, borderWidth: 0.5, minWidth: 32 },
  exportingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  exportingContent: { padding: 8, borderRadius: 6, alignItems: 'center', gap: 4, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 0.5 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  exportingText: { fontSize: 10, fontWeight: '600' },
});