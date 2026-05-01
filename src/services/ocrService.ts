import { Platform } from 'react-native';

type TextRecognitionModule = typeof import('@react-native-ml-kit/text-recognition').default;

/**
 * Reconnaissance de texte via Google ML Kit (On-Device)
 * @param imageUri Chemin local de l'image (file://)
 * @returns Texte extrait
 * 
 * IMPORTANT: Nécessite un "Development Build" (npx expo run:android)
 * Ne fonctionne pas dans Expo Go car ML Kit contient du code natif.
 */
export async function recognizeText(imageUri: string): Promise<string> {
  if (!imageUri) return '';
  if (Platform.OS === 'web') return '';
  
  try {
    const TextRecognition = require('@react-native-ml-kit/text-recognition').default as TextRecognitionModule;
    const result = await TextRecognition.recognize(imageUri);
    return result.text || '';
  } catch (e) {
    console.error('Erreur OCR ML Kit:', e);
    // Fallback silencieux pour ne pas bloquer l'importation
    return '';
  }
}
