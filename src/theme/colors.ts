// ============================================
// COULEURS — Exactement celles du Flutter
// ============================================

export const Colors = {
  // Backgrounds
  background: '#0C1322',       // Deep Navy (scaffold bg dark)
  surface: '#191F2F',          // Slate (card bg dark)
  surfaceVariant: '#2E3545',   // Surface Variant

  // Primary
  primary: '#C0C1FF',          // Light Lavender
  primaryContainer: '#8083FF', // Indigo

  // Secondary
  secondary: '#4CD7F6',        // Cyan
  tertiary: '#2FD9F4',         // Bright Blue

  // Text
  onSurface: '#DCE2F7',        // Main text dark
  onSurfaceVariant: '#C7C4D7', // Secondary text dark
  onSurfaceLight: '#0F172A',   // Main text light
  onSurfaceVariantLight: '#64748B',

  // Accent
  indigoAccent: '#6366F1',
  amber: '#F59E0B',
  cyan: '#0EA5E9',
  red: '#EF4444',
  softRed: '#FFB4AB',
  green: '#22C55E',
  orange: '#F97316',

  // Light theme
  backgroundLight: '#F8FAFC',
  surfaceLight: '#FFFFFF',
  surfaceVariantLight: '#F1F5F9',
  primaryLight: '#6366F1',
  primaryContainerLight: '#EEF2FF',

  // Gradients helpers
  gradient: {
    primary: ['#C0C1FF', '#8083FF'] as const,
    primaryLight: ['#6366F1', '#818CF8'] as const,
    cyan: ['#4CD7F6', '#2FD9F4'] as const,
  },

  // Transparencies
  overlay: 'rgba(0,0,0,0.6)',
  border: 'rgba(255,255,255,0.05)',
  borderLight: 'rgba(15,23,42,0.05)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  headlineLarge: { fontFamily: 'Manrope_800ExtraBold', fontSize: 32 },
  headlineMedium: { fontFamily: 'Manrope_700Bold', fontSize: 24 },
  titleLarge: { fontFamily: 'Manrope_700Bold', fontSize: 20 },
  titleMedium: { fontFamily: 'Manrope_700Bold', fontSize: 16 },
  titleSmall: { fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  bodyLarge: { fontFamily: 'Inter_400Regular', fontSize: 16 },
  bodyMedium: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  bodySmall: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  labelSmall: { fontFamily: 'Inter_700Bold', fontSize: 10 },
};
