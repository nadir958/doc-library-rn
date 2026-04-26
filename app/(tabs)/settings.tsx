import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch,
  StyleSheet, Modal, Pressable, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../src/theme/theme';
import { Colors, Radius, Spacing, Typography } from '../../src/theme/colors';
import { useSettingsStore, ThemeMode, AppLocale } from '../../src/store/settingsStore';
import { useDocumentStore } from '../../src/store/documentStore';
import { useFolderStore } from '../../src/store/folderStore';
import { useAuthStore } from '../../src/store/authStore';
import * as db from '../../src/services/databaseService';
import { i18n } from '../../src/i18n';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const { themeMode, locale, isBiometricEnabled, setThemeMode, setLocale, setBiometricEnabled } = useSettingsStore();
  const { loadDocuments } = useDocumentStore();
  const { loadFolders } = useFolderStore();
  const { authenticate, reset: resetAuth } = useAuthStore();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const localeLabel = locale === 'fr' ? 'Français' : locale === 'en' ? 'English' : locale === 'ar' ? 'العربية' : t('system');
  const themeLabel = themeMode === 'system' ? t('system') : themeMode === 'dark' ? t('dark') : t('light');

  const handleSetLocale = (l: AppLocale) => {
    setLocale(l);
    i18n.changeLanguage(l ?? undefined);
    setShowLanguageModal(false);
  };

  const handleSetTheme = (m: ThemeMode) => {
    setThemeMode(m);
    setShowThemeModal(false);
  };

  const handleDeleteAll = async () => {
    await db.deleteAllData();
    await loadDocuments();
    await loadFolders();
    setShowDeleteModal(false);
  };

  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      // Si on active, on demande une authentification immédiate pour confirmer
      const success = await authenticate();
      if (success) {
        setBiometricEnabled(true);
      }
    } else {
      // Si on désactive, on remet aussi l'état auth à false pour la sécurité
      setBiometricEnabled(false);
      resetAuth();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* GÉNÉRAL */}
        <SectionHeader title={t('general')} theme={theme} />
        <SettingsCard theme={theme}>
          <SettingsTile
            icon="language-outline"
            title={t('language')}
            subtitle={localeLabel}
            onTap={() => setShowLanguageModal(true)}
            theme={theme}
          />
          <Separator theme={theme} />
          <SettingsTile
            icon="moon-outline"
            title={t('theme')}
            subtitle={themeLabel}
            onTap={() => setShowThemeModal(true)}
            theme={theme}
          />
        </SettingsCard>

        {/* SÉCURITÉ */}
        <View style={{ height: Spacing.lg }} />
        <SectionHeader title={t('security')} theme={theme} />
        <SettingsCard theme={theme}>
          <View style={styles.switchTile}>
            <Ionicons name="finger-print-outline" size={24} color={theme.colors.primary} />
            <View style={styles.switchTileText}>
              <Text style={[styles.tileTitle, { color: theme.colors.onSurface }]}>{t('biometricLock')}</Text>
              {isBiometricEnabled && (
                <Text style={[styles.tileSubtitle, { color: theme.colors.onSurfaceVariant }]}>{t('biometricEnabled')}</Text>
              )}
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ true: theme.colors.secondary, false: theme.colors.surfaceVariant }}
              thumbColor="#fff"
            />
          </View>
        </SettingsCard>

        {/* DONNÉES */}
        <View style={{ height: Spacing.lg }} />
        <SectionHeader title={t('data')} theme={theme} />
        <SettingsCard theme={theme}>
          <SettingsTile
            icon="cloud-offline-outline"
            title={t('cloudSync')}
            subtitle={t('notConfigured')}
            color={Colors.orange}
            theme={theme}
          />
          <Separator theme={theme} />
          <SettingsTile
            icon="trash-outline"
            title={t('deleteAllData')}
            subtitle={t('irreversibleAction')}
            color={Colors.red}
            onTap={() => setShowDeleteModal(true)}
            theme={theme}
          />
        </SettingsCard>

        {/* À PROPOS */}
        <View style={{ height: Spacing.lg }} />
        <SectionHeader title={t('about')} theme={theme} />
        <SettingsCard theme={theme}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoPlaceholder, { backgroundColor: `${theme.colors.primary}1A` }]}>
              <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
            </View>
          </View>
          <Separator theme={theme} />
          <SettingsTile icon="information-circle-outline" title={t('version')} subtitle={t('stableVersion')} theme={theme} />
          <Separator theme={theme} />
          <SettingsTile icon="checkmark-circle-outline" title={t('developedBy')} subtitle={t('appDescription')} theme={theme} />
        </SettingsCard>

        <View style={{ height: 40 }} />
        <Text style={[styles.footer, { color: `${theme.colors.onSurface}0D` }]}>
          {t('protectedByEncryption')}
        </Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Language Modal */}
      <PickerModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title={t('selectLanguage')}
        theme={theme}
        options={[
          { label: t('system'), onSelect: () => handleSetLocale(null) },
          { label: 'Français', onSelect: () => handleSetLocale('fr') },
          { label: 'English', onSelect: () => handleSetLocale('en') },
          { label: 'العربية', onSelect: () => handleSetLocale('ar') },
        ]}
      />

      {/* Theme Modal */}
      <PickerModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        title={t('selectTheme')}
        theme={theme}
        options={[
          { label: t('system'), onSelect: () => handleSetTheme('system') },
          { label: t('light'), onSelect: () => handleSetTheme('light') },
          { label: t('dark'), onSelect: () => handleSetTheme('dark') },
        ]}
      />

      {/* Delete All Modal */}
      <Modal transparent visible={showDeleteModal} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowDeleteModal(false)}>
          <Pressable style={[styles.dialog, { backgroundColor: theme.colors.surface }]}>
            <Text style={[Typography.titleLarge, { color: theme.colors.onSurface, marginBottom: 8 }]}>{t('deleteAllData')}</Text>
            <Text style={[styles.dialogContent, { color: theme.colors.onSurfaceVariant }]}>{t('deleteAllDataConfirm')}</Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontFamily: 'Manrope_600SemiBold' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteAll} style={[styles.deleteBtn]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function SectionHeader({ title, theme }: any) {
  return (
    <Text style={[styles.sectionHeader, { color: `${theme.colors.onSurface}4D` }]}>
      {title.toUpperCase()}
    </Text>
  );
}

function SettingsCard({ children, theme }: any) {
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? Colors.border : Colors.borderLight }]}>
      {children}
    </View>
  );
}

function SettingsTile({ icon, title, subtitle, onTap, color, theme }: any) {
  return (
    <TouchableOpacity onPress={onTap} disabled={!onTap} style={styles.tile}>
      <Ionicons name={icon} size={24} color={color ?? theme.colors.primary} style={styles.tileIcon} />
      <View style={styles.tileMid}>
        <Text style={[styles.tileTitle, { color: theme.colors.onSurface }]}>{title}</Text>
        <Text style={[styles.tileSubtitle, { color: theme.colors.onSurfaceVariant }]}>{subtitle}</Text>
      </View>
      {onTap && <Ionicons name="chevron-forward" size={18} color={`${theme.colors.onSurfaceVariant}4D`} />}
    </TouchableOpacity>
  );
}

function Separator({ theme }: any) {
  return <View style={[styles.separator, { backgroundColor: `${theme.colors.onSurface}08` }]} />;
}

function PickerModal({ visible, onClose, title, options, theme }: any) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.dialog, { backgroundColor: theme.colors.surface }]}>
          <Text style={[Typography.titleLarge, { color: theme.colors.onSurface, marginBottom: Spacing.md }]}>{title}</Text>
          {options.map((opt: any) => (
            <TouchableOpacity key={opt.label} onPress={opt.onSelect} style={styles.pickerOption}>
              <Text style={[styles.pickerOptionText, { color: theme.colors.onSurface }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  sectionHeader: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 8,
  },
  card: {
    borderRadius: Radius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  tileIcon: { marginRight: Spacing.md },
  tileMid: { flex: 1 },
  tileTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  tileSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  switchTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: Spacing.md,
  },
  switchTileText: { flex: 1 },
  separator: { height: 1, marginHorizontal: Spacing.md },
  logoContainer: { alignItems: 'center', paddingVertical: Spacing.lg },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: Radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    textAlign: 'center',
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    letterSpacing: 2,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  dialog: { width: '85%', borderRadius: Radius.xxl, padding: Spacing.lg },
  dialogContent: { fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: Spacing.lg },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md, alignItems: 'center' },
  deleteBtn: { backgroundColor: Colors.red, paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.md },
  pickerOption: { paddingVertical: 14, borderRadius: Radius.md },
  pickerOptionText: { fontFamily: 'Manrope_600SemiBold', fontSize: 16 },
});
