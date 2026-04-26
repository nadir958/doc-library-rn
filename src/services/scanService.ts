import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { CameraView } from 'expo-camera';

// Miroir de ScanService.dart

// Mode 1: Smart scan — utilise expo-image-picker avec mode de découpage
export async function startSmartScan(): Promise<string[] | null> {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
      base64: false,
    });

    if (result.canceled) return null;
    return result.assets.map(a => a.uri);
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
