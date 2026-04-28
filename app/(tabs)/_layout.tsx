import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../src/theme/theme';
import { Colors, Radius } from '../../src/theme/colors';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter, Redirect } from 'expo-router';
import { useEffect } from 'react';

export default function TabsLayout() {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isBiometricEnabled } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  if (isBiometricEnabled && !isAuthenticated) {
    return <Redirect href="/lock" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, descriptors, navigation }) => (
        <CustomTabBar
          state={state}
          descriptors={descriptors}
          navigation={navigation}
          theme={theme}
          t={t}
          insets={insets}
        />
      )}
    >
      <Tabs.Screen name="index" options={{ title: t('dashboard') }} />
      <Tabs.Screen name="folders" options={{ title: t('folders') }} />
      <Tabs.Screen name="settings" options={{ title: t('settings') }} />
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation, theme, t, insets }: any) {
  const tabs = [
    { name: 'index', icon: 'document-text-outline', activeIcon: 'document-text', label: t('dashboard') },
    { name: 'folders', icon: 'folder-outline', activeIcon: 'folder', label: t('folders') },
    { name: 'settings', icon: 'settings-outline', activeIcon: 'settings', label: t('settings') },
  ];

  return (
    <View style={[styles.barWrapper, { marginBottom: insets.bottom + 16 }]}>
      <View style={[styles.bar, {
        backgroundColor: theme.isDark ? 'rgba(25,31,47,0.85)' : 'rgba(255,255,255,0.85)',
        borderColor: theme.isDark ? Colors.border : Colors.borderLight,
        shadowColor: theme.isDark ? '#000' : Colors.primaryContainer,
      }]}>
        {state.routes.map((route: any, index: number) => {
          const isActive = state.index === index;
          const tab = tabs[index];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              {isActive ? (
                <LinearGradient
                  colors={theme.isDark ? Colors.gradient.primary : Colors.gradient.primaryLight}
                  style={styles.activeIndicator}
                >
                  <Ionicons
                    name={tab.activeIcon as any}
                    size={22}
                    color={theme.isDark ? Colors.background : '#fff'}
                  />
                </LinearGradient>
              ) : (
                <View style={styles.inactiveIndicator}>
                  <Ionicons
                    name={tab.icon as any}
                    size={22}
                    color={theme.isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'}
                  />
                </View>
              )}
              <Text style={[
                styles.tabLabel,
                {
                  color: isActive
                    ? theme.colors.primary
                    : theme.isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                  fontWeight: isActive ? '700' : '400',
                },
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
  },
  bar: {
    height: 76,
    borderRadius: Radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 4,
  },
  activeIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
