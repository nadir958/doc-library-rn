import * as LocalAuthentication from 'expo-local-authentication';

// Miroir de BiometricService.dart
export async function canAuthenticate(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
}

export async function authenticate(): Promise<boolean> {
  try {
    const canAuth = await canAuthenticate();
    if (!canAuth) return true; // Pas de biométrie → on laisse passer

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Veuillez vous authentifier pour accéder à vos documents',
      cancelLabel: 'Annuler',
      disableDeviceFallback: false,
    });

    return result.success;
  } catch (e) {
    console.error("Erreur d'authentification:", e);
    return false;
  }
}
