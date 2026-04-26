import '../src/i18n';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeContext, darkTheme, lightTheme } from '../src/theme/theme';
import { useSettingsStore } from '../src/store/settingsStore';
import { initDatabase } from '../src/services/databaseService';
import { useAuthStore } from '../src/store/authStore';
import { useTranslation } from 'react-i18next';
import { i18n } from '../src/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { themeMode, locale, isBiometricEnabled } = useSettingsStore();
  const [dbReady, setDbReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  // Sync locale with i18n
  useEffect(() => {
    if (locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  // Init DB
  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) return null;

  const isDark = themeMode === 'system'
    ? colorScheme === 'dark'
    : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lock" options={{ headerShown: false }} />
        <Stack.Screen
          name="document/[id]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: isDark ? '#141B2B' : '#fff' },
            headerTintColor: isDark ? '#DCE2F7' : '#0F172A',
            headerTitleStyle: { fontFamily: 'Manrope_700Bold', fontSize: 18 },
            headerBackTitle: '',
          }}
        />
        <Stack.Screen
          name="capture-preview"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: isDark ? '#141B2B' : '#fff' },
            headerTintColor: isDark ? '#DCE2F7' : '#0F172A',
            headerTitleStyle: { fontFamily: 'Manrope_700Bold', fontSize: 18 },
            headerBackTitle: '',
          }}
        />
        <Stack.Screen
          name="manual-capture"
          options={{ headerShown: false }}
        />
      </Stack>
    </ThemeContext.Provider>
  );
}
