import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../src/theme/theme';
import { Colors, Radius, Spacing, Typography } from '../src/theme/colors';
import { useAuthStore } from '../src/store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LockScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { authenticate, isAuthenticated } = useAuthStore();

  // Auto-authenticate on mount
  useEffect(() => {
    handleAuthenticate();
  }, []);

  // Navigate when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/');
    }
  }, [isAuthenticated]);

  const handleAuthenticate = async () => {
    await authenticate();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <LinearGradient
        colors={[`${theme.colors.primary}0D`, theme.colors.surface]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.logoBg, { backgroundColor: `${theme.colors.primary}1A` }]}>
            <Ionicons name="shield-checkmark" size={64} color={theme.colors.primary} />
          </View>

          <Text style={[Typography.headlineMedium, { color: theme.colors.onSurface, marginTop: Spacing.xl, textAlign: 'center' }]}>
            {t('appLocked')}
          </Text>

          <Text style={[styles.desc, { color: `${theme.colors.onSurface}99` }]}>
            {t('authRequiredDescription')}
          </Text>
        </View>

        {/* Unlock Button */}
        <TouchableOpacity onPress={handleAuthenticate} activeOpacity={0.85}>
          <LinearGradient
            colors={theme.isDark ? Colors.gradient.primary : Colors.gradient.primaryLight}
            style={styles.unlockBtn}
          >
            <Ionicons name="finger-print-outline" size={22} color={theme.isDark ? Colors.background : '#fff'} />
            <Text style={[styles.unlockText, { color: theme.isDark ? Colors.background : '#fff' }]}>
              {t('unlockApp').toUpperCase()}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl },
  logoSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: 48,
    lineHeight: 22,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: Radius.lg,
  },
  unlockText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    letterSpacing: 1,
  },
});
