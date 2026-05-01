import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

type DocumentScannerModule = typeof import('react-native-document-scanner-plugin').default;

// Mode 1: Smart scan — utilise le scanner professionnel avec détection de contours
export async function startSmartScan(): Promise<string[] | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const DocumentScanner = require('react-native-document-scanner-plugin').default as DocumentScannerModule;
    const { scannedImages } = await DocumentScanner.scanDocument({
      maxNumDocuments: 10,
    });

    if (scannedImages && scannedImages.length > 0) {
      return scannedImages;
    }
    return null;
  } catch (e) {
    console.error('Erreur Smart Scan:', e);
    return null;
  }
}

// Mode 2: Sélection depuis la galerie
export async function pickFromGallery(): Promise<string[] | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.9,
    });

    if (result.canceled) return null;
    return result.assets.map(a => a.uri);
  } catch (e) {
    console.error('Erreur galerie:', e);
    return null;
  }
}

// Traitement OpenCV-like avec expo-image-manipulator (contraste basique)
export async function applyBasicCleanup(imageUri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Légère normalisation de taille pour cohérence
        { resize: { width: 1200 } },
      ],
      {
        compress: 0.85,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (e) {
    console.error('Erreur traitement image:', e);
    return imageUri; // Retourne l'originale si erreur
  }
}
