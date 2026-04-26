import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';
export type AppLocale = 'fr' | 'en' | 'ar' | null;

interface SettingsState {
  themeMode: ThemeMode;
  locale: AppLocale;
  isBiometricEnabled: boolean;
}

interface SettingsActions {
  setThemeMode: (mode: ThemeMode) => void;
  setLocale: (locale: AppLocale) => void;
  setBiometricEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      themeMode: 'system',
      locale: null,
      isBiometricEnabled: false,

      setThemeMode: (mode) => set({ themeMode: mode }),
      setLocale: (locale) => set({ locale }),
      setBiometricEnabled: (enabled) => set({ isBiometricEnabled: enabled }),
    }),
    {
      name: 'doc-library-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
