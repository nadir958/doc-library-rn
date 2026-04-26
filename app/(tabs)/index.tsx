import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Modal, Pressable,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../src/theme/theme';
import { Colors, Radius, Spacing, Typography } from '../../src/theme/colors';
import { useDocumentStore } from '../../src/store/documentStore';
import { useFolderStore } from '../../src/store/folderStore';
import { DocumentCard } from '../../src/components/DocumentCard';
import { DocumentModel } from '../../src/types/models';
import { pickFromGallery, startSmartScan } from '../../src/services/scanService';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCaptureModal, setShowCaptureModal] = useState(false);

  const { documents, allTags, isLoading, loadDocuments, search, filterByTag, deleteDocument } = useDocumentStore();

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      search(q);
    } else {
      loadDocuments();
    }
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    if (tag) filterByTag(tag);
    else loadDocuments();
  };

  const handleDeleteDoc = (doc: DocumentModel) => {
    Alert.alert(
      t('deleteDocument'),
      t('deleteDocumentConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => deleteDocument(doc.id),
        },
      ]
    );
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

  const handleManualCamera = () => {
    setShowCaptureModal(false);
    router.push('/manual-capture');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={documents}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Editorial Header */}
            <View style={styles.header}>
              <Text style={[Typography.headlineLarge, { color: theme.colors.onSurface, lineHeight: 40 }]}>
                {t('editorialHeaderPart1')}
                <Text style={{ color: theme.isDark ? Colors.primary : Colors.indigoAccent }}>
                  {t('editorialHeaderPart2')}
                </Text>
              </Text>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, {
              backgroundColor: theme.isDark ? Colors.surfaceVariant : Colors.surfaceVariantLight,
              shadowColor: theme.isDark ? '#000' : Colors.indigoAccent,
            }]}>
              <Ionicons name="search" size={20} color={Colors.primary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.onSurface, fontFamily: 'Inter_400Regular' }]}
                placeholder={t('searchHint')}
                placeholderTextColor={theme.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tagScroll}
                contentContainerStyle={styles.tagContainer}
              >
                {['', ...allTags].map((tag, i) => {
                  const isSelected = i === 0 ? selectedTag === null : selectedTag === tag;
                  return (
                    <TouchableOpacity
                      key={tag || 'all'}
                      onPress={() => handleTagSelect(i === 0 ? null : tag)}
                      style={[
                        styles.tagChip,
                        {
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant,
                        },
                      ]}
                    >
                      <Text style={[styles.tagChipText, {
                        color: isSelected
                          ? (theme.isDark ? Colors.background : '#fff')
                          : theme.colors.onSurfaceVariant,
                      }]}>
                        {i === 0 ? t('all') : tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyCenter}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
            </View>
          ) : (
            <View style={styles.emptyCenter}>
              <View style={[styles.emptyIconBg, { backgroundColor: `${theme.colors.primary}0D` }]}>
                <Ionicons name="document-text-outline" size={80} color={`${theme.colors.primary}33`} />
              </View>
              <Text style={[styles.emptyTitle, { color: `${theme.colors.onSurface}4D` }]}>
                {t('noDocuments').toUpperCase()}
              </Text>
              <Text style={[styles.emptySubtitle, { color: `${theme.colors.onSurface}66` }]}>
                {t('startSecuringDocs')}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <DocumentCard
            document={item}
            onPress={() => router.push({ pathname: '/document/[id]', params: { id: item.id } })}
            onLongPress={() => handleDeleteDoc(item)}
          />
        )}
      />

      {/* FAB */}
      <View style={[styles.fabWrapper, { bottom: 110 }]}>
        <TouchableOpacity onPress={() => setShowCaptureModal(true)} activeOpacity={0.85}>
          <LinearGradient
            colors={theme.isDark ? Colors.gradient.primary : Colors.gradient.primaryLight}
            style={styles.fab}
          >
            <Ionicons
              name="camera"
              size={24}
              color={theme.isDark ? Colors.background : '#fff'}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Capture Options Modal */}
      <Modal transparent visible={showCaptureModal} animationType="slide" onRequestClose={() => setShowCaptureModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCaptureModal(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHandle} />

            <TouchableOpacity style={styles.modalItem} onPress={handleSmartScan}>
              <Ionicons name="sparkles" size={24} color={Colors.amber} />
              <View style={styles.modalItemText}>
                <Text style={[styles.modalItemTitle, { color: theme.colors.onSurface }]}>{t('smartScan')}</Text>
                <Text style={[styles.modalItemSubtitle, { color: theme.colors.onSurfaceVariant }]}>{t('smartScanDesc')}</Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.separator, { backgroundColor: `${theme.colors.onSurface}0D` }]} />

            <TouchableOpacity style={styles.modalItem} onPress={handleManualCamera}>
              <Ionicons name="camera" size={24} color={Colors.cyan} />
              <Text style={[styles.modalItemTitle, { color: theme.colors.onSurface }]}>{t('takePhoto')}</Text>
            </TouchableOpacity>

            <View style={[styles.separator, { backgroundColor: `${theme.colors.onSurface}0D` }]} />

            <TouchableOpacity style={styles.modalItem} onPress={handleGallery}>
              <Ionicons name="images" size={24} color={Colors.orange} />
              <Text style={[styles.modalItemTitle, { color: theme.colors.onSurface }]}>{t('fromGallery')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 140,
    paddingTop: Spacing.sm,
  },
  header: { paddingHorizontal: Spacing.sm, marginBottom: Spacing.lg, paddingTop: Spacing.sm },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.sm,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    height: 56,
    fontSize: 15,
  },
  tagScroll: { marginBottom: Spacing.lg },
  tagContainer: { paddingHorizontal: Spacing.sm, gap: 8 },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  tagChipText: { fontSize: 13, fontWeight: '600' },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: Spacing.lg,
  },
  emptyIconBg: {
    width: 144,
    height: 144,
    borderRadius: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 14,
    letterSpacing: 2,
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  fabWrapper: {
    position: 'absolute',
    right: Spacing.lg + 16,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  modalItemText: { flex: 1 },
  modalItemTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 16 },
  modalItemSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },
  separator: { height: 1 },
});
