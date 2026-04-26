import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, Pressable, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../src/theme/theme';
import { Colors, Radius, Spacing, Typography } from '../../src/theme/colors';
import { useFolderStore } from '../../src/store/folderStore';
import { FolderCard } from '../../src/components/FolderCard';
import { pickFromGallery, startSmartScan } from '../../src/services/scanService';

export default function FoldersScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const router = useRouter();
  const { folders, isLoading, loadFolders, createFolder } = useFolderStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => { loadFolders(); }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName('');
    setShowAddModal(false);
  };

  const handleSmartScan = async () => {
    setShowCaptureModal(false);
    const images = await startSmartScan();
    if (images?.length) {
      router.push({ pathname: '/capture-preview', params: { imagePaths: JSON.stringify(images) } });
    }
  };

  const handleGallery = async () => {
    setShowCaptureModal(false);
    const images = await pickFromGallery();
    if (images?.length) {
      router.push({ pathname: '/capture-preview', params: { imagePaths: JSON.stringify(images) } });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[Typography.headlineLarge, { color: theme.colors.onSurface }]}>{t('folders')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('foldersSubtitle')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={[styles.addBtn, { backgroundColor: `${theme.colors.primary}1A` }]}
        >
          <Ionicons name="folder-open-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading && !folders.length ? (
        <View style={styles.center}><ActivityIndicator color={theme.colors.primary} /></View>
      ) : folders.length === 0 ? (
        <View style={styles.emptyCenter}>
          <View style={[styles.emptyIconBg, { backgroundColor: `${theme.colors.primary}0D` }]}>
            <Ionicons name="folder-open-outline" size={80} color={`${theme.colors.primary}33`} />
          </View>
          <Text style={[styles.emptyTitle, { color: `${theme.colors.onSurface}4D` }]}>
            {t('noDocuments').toUpperCase()}
          </Text>
          <Text style={[styles.emptySubtitle, { color: `${theme.colors.onSurface}66` }]}>
            {t('createFirstFolder')}
          </Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <LinearGradient
              colors={theme.isDark ? Colors.gradient.primary : Colors.gradient.primaryLight}
              style={styles.createBtn}
            >
              <Ionicons name="add" size={20} color={theme.isDark ? Colors.background : '#fff'} />
              <Text style={[styles.createBtnText, { color: theme.isDark ? Colors.background : '#fff' }]}>
                {t('newFolder')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={folders}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <FolderCard
                folder={item}
                onPress={() => router.push({ pathname: '/(tabs)/', params: { folderId: item.id } })}
              />
            </View>
          )}
        />
      )}

      {/* FAB */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity onPress={() => setShowCaptureModal(true)} activeOpacity={0.85}>
          <LinearGradient
            colors={theme.isDark ? Colors.gradient.primary : Colors.gradient.primaryLight}
            style={styles.fab}
          >
            <Ionicons name="camera" size={24} color={theme.isDark ? Colors.background : '#fff'} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Add Folder Modal */}
      <Modal transparent visible={showAddModal} animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <Pressable style={styles.overlayCenter} onPress={() => setShowAddModal(false)}>
          <Pressable style={[styles.dialog, { backgroundColor: theme.colors.surface }]}>
            <Text style={[Typography.titleLarge, { color: theme.colors.onSurface, marginBottom: Spacing.md }]}>
              {t('newFolder')}
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: `${theme.colors.onSurface}0D`,
                color: theme.colors.onSurface,
                borderRadius: Radius.lg,
              }]}
              placeholder={t('folderName')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={[styles.cancelText, { color: theme.colors.onSurfaceVariant }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateFolder} style={[styles.createDialogBtn, { backgroundColor: theme.colors.primary }]}>
                <Text style={{ color: theme.isDark ? Colors.background : '#fff', fontWeight: '700' }}>{t('create')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Capture Modal */}
      <Modal transparent visible={showCaptureModal} animationType="slide" onRequestClose={() => setShowCaptureModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowCaptureModal(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.sheetItem} onPress={handleSmartScan}>
              <Ionicons name="sparkles" size={24} color={Colors.amber} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetItemTitle, { color: theme.colors.onSurface }]}>{t('smartScan')}</Text>
                <Text style={[styles.sheetItemSub, { color: theme.colors.onSurfaceVariant }]}>{t('smartScanDesc')}</Text>
              </View>
            </TouchableOpacity>
            <View style={[styles.sep, { backgroundColor: `${theme.colors.onSurface}0D` }]} />
            <TouchableOpacity style={styles.sheetItem} onPress={() => { setShowCaptureModal(false); router.push('/manual-capture'); }}>
              <Ionicons name="camera" size={24} color={Colors.cyan} />
              <Text style={[styles.sheetItemTitle, { color: theme.colors.onSurface }]}>{t('takePhoto')}</Text>
            </TouchableOpacity>
            <View style={[styles.sep, { backgroundColor: `${theme.colors.onSurface}0D` }]} />
            <TouchableOpacity style={styles.sheetItem} onPress={handleGallery}>
              <Ionicons name="images" size={24} color={Colors.orange} />
              <Text style={[styles.sheetItemTitle, { color: theme.colors.onSurface }]}>{t('fromGallery')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 4, maxWidth: 260 },
  addBtn: { padding: 12, borderRadius: Radius.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, padding: Spacing.xl },
  emptyIconBg: { width: 144, height: 144, borderRadius: 72, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 14, letterSpacing: 2 },
  emptySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center' },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.lg },
  createBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 14 },
  grid: { paddingHorizontal: Spacing.lg, paddingBottom: 140 },
  gridRow: { gap: 16 },
  gridItem: { flex: 1 },
  fabWrapper: {
    position: 'absolute',
    right: Spacing.lg + 16,
    bottom: 140,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  fab: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  overlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  dialog: { width: '85%', borderRadius: Radius.xxl, padding: Spacing.lg },
  input: { padding: Spacing.md, fontSize: 15, marginBottom: Spacing.lg, fontFamily: 'Inter_400Regular' },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md, alignItems: 'center' },
  cancelText: { fontFamily: 'Manrope_600SemiBold', fontSize: 14 },
  createDialogBtn: { paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.md },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: Spacing.lg, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: Spacing.md },
  sheetItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  sheetItemTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 16 },
  sheetItemSub: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
  sep: { height: 1 },
});
