// Miroir de OCRService.dart
// Note: ML Kit text recognition nécessite un development build.
// On expose une interface simple pour que l'intégration soit facile.

// Retourne le texte extrait depuis une image locale
export async function recognizeText(imageUri: string): Promise<string> {
  try {
    // En mode development build avec @react-native-ml-kit/text-recognition:
    // const TextRecognition = require('@react-native-ml-kit/text-recognition').default;
    // const result = await TextRecognition.recognize(imageUri);
    // return result.text;

    // Placeholder pour tests initiaux (peut être remplacé après installation ML Kit)
    return '';
  } catch (e) {
    console.error('Erreur OCR:', e);
    return '';
  }
}
