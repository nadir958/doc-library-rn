import { createContext, useContext } from 'react';
import { Colors } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppTheme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceVariant: string;
    primary: string;
    primaryContainer: string;
    secondary: string;
    onSurface: string;
    onSurfaceVariant: string;
    border: string;
    error: string;
    indigoAccent: string;
  };
}

export const darkTheme: AppTheme = {
  isDark: true,
  colors: {
    background: Colors.background,
    surface: Colors.surface,
    surfaceVariant: Colors.surfaceVariant,
    primary: Colors.primary,
    primaryContainer: Colors.primaryContainer,
    secondary: Colors.secondary,
    onSurface: Colors.onSurface,
    onSurfaceVariant: Colors.onSurfaceVariant,
    border: Colors.border,
    error: Colors.softRed,
    indigoAccent: Colors.primary,
  },
};

export const lightTheme: AppTheme = {
  isDark: false,
  colors: {
    background: Colors.backgroundLight,
    surface: Colors.surfaceLight,
    surfaceVariant: Colors.surfaceVariantLight,
    primary: Colors.primaryLight,
    primaryContainer: Colors.primaryContainerLight,
    secondary: Colors.cyan,
    onSurface: Colors.onSurfaceLight,
    onSurfaceVariant: Colors.onSurfaceVariantLight,
    border: Colors.borderLight,
    error: Colors.red,
    indigoAccent: Colors.indigoAccent,
  },
};

export const ThemeContext = createContext<AppTheme>(darkTheme);
export const useAppTheme = () => useContext(ThemeContext);
