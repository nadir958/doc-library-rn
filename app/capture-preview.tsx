import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Pressable, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../src/theme/theme';
import { Colors, Radius, Spacing, Typography } from '../src/theme/colors';
import { useDocumentStore } from '../src/store/documentStore';
import { useFolderStore } from '../src/store/folderStore';
import { GradientButton } from '../src/components/GradientButton';
import { getSuggestedFolderNames } from '../src/services/aiService';
import { recognizeText } from '../src/services/ocrService';

export default function CapturePreviewScreen() {
  const params = useLocalSearchParams<{ imagePaths: string; existingDocId?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useAppTheme();

  const [images, setImages] = useState<string[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [docTitle, setDocTitle] = useState(`Scan du ${new Date().getDate()}/${new Date().getMonth() + 1}`);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { processCapture, addPagesToDocument, isLoading } = useDocumentStore();
  const { folders, loadFolders, createFolder } = useFolderStore();

  const existingDocId = params.existingDocId ? Number(params.existingDocId) : null;

  useEffect(() => {
    if (params.imagePaths) {
      try {
        const paths = JSON.parse(params.imagePaths);
        if (Array.isArray(paths)) {
          setImages(paths);
          // Lancer l'IA avec un léger délai pour ne pas bloquer le rendu initial
          if (paths.length > 0) {
            setTimeout(() => {
              runAiAnalysis(paths[0]);
            }, 500);
          }
        }
      } catch (e) {
        console.error('Failed to parse image paths:', e);
      }
    }
    loadFolders();
  }, [params.imagePaths]);

  const runAiAnalysis = async (imagePath: string) => {
    setIsAiLoading(true);
    try {
      const text = await recognizeText(imagePath);
      const hints = await getSuggestedFolderNames(text);
      setSuggestions(hints);
      if (hints.length > 0 && !docTitle) {
        setDocTitle(hints[0]);
      }
    } catch (e) {
      console.error('AI Error:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: existingDocId ? t('addPages') : t('capturePreview'),
    });
  }, [existingDocId, t]);

  const handleSave = async () => {
    if (images.length === 0) return;
    if (existingDocId) {
      await addPagesToDocument(existingDocId, images);
    } else {
      await processCapture(images, { 
        folderId: selectedFolderId ?? undefined,
        title: docTitle.trim() || undefined
      });
    }
    router.back();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const id = await createFolder(newFolderName.trim());
    setSelectedFolderId(id);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.ocrText, { color: theme.colors.primary }]}>{t('ocrInProgress').toUpperCase()}</Text>
        <Text style={{ color: `${theme.colors.onSurface}3D`, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
          Sécurisation de vos données...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={images}
        keyExtractor={(_, i) => String(i)}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item, index }) => (
          <View style={[styles.imageCard, { borderColor: `${theme.colors.onSurface}1A` }]}>
            <Image source={{ uri: item }} style={styles.thumb} />
            <TouchableOpacity
              onPress={() => setImages(prev => prev.filter((_, i) => i !== index))}
              style={styles.removeBtn}
            >
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, {
        backgroundColor: theme.colors.surface,
        borderColor: `${theme.colors.onSurface}0D`,
      }]}>
        {!existingDocId && (
          <>
            {/* Title Input */}
            <View style={[styles.inputContainer, { backgroundColor: `${theme.colors.onSurface}0D` }]}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              <TextInput
                style={[styles.titleInput, { color: theme.colors.onSurface }]}
                placeholder={t('documentTitle')}
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={docTitle}
                onChangeText={setDocTitle}
              />
            </View>

            {/* AI Suggestions */}
            {(suggestions.length > 0 || isAiLoading) && (
              <View style={styles.suggestionRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {isAiLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 8 }} />
                  ) : (
                    suggestions.map((s, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => setDocTitle(s)}
                        style={[styles.suggestionChip, { backgroundColor: `${theme.colors.primary}1A` }]}
                      >
                        <Ionicons name="sparkles" size={12} color={theme.colors.primary} />
                        <Text style={[styles.suggestionText, { color: theme.colors.primary }]}>{s}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}

            <View style={{ height: Spacing.md }} />

            <View style={styles.folderRow}>
              <TouchableOpacity
                style={[styles.folderPicker, { backgroundColor: `${theme.colors.onSurface}0D` }]}
                onPress={() => setShowFolderModal(true)}
              >
                <Text style={{ color: selectedFolder ? theme.colors.onSurface : theme.colors.onSurfaceVariant, flex: 1, fontFamily: 'Inter_400Regular' }}>
                  {selectedFolder ? selectedFolder.name : t('selectFolder')}
                </Text>
                <Ionicons name="chevron-down" size={18} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowNewFolderModal(true)}
                style={[styles.newFolderBtn, { backgroundColor: `${theme.colors.primaryContainer}1A` }]}
              >
                <Ionicons name="folder-open-outline" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={{ height: Spacing.lg }} />
          </>
        )}

        <GradientButton
          onPress={handleSave}
          disabled={images.length === 0}
          loading={isLoading}
          label={(existingDocId ? t('addPages') : t('addDocument')).toUpperCase()}
          icon={<Ionicons name="sparkles-outline" size={18} color={Colors.background} />}
        />
      </View>

      {/* Folder Picker Modal */}
      <Modal transparent visible={showFolderModal} animationType="slide" onRequestClose={() => setShowFolderModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowFolderModal(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.handle} />
            <Text style={[Typography.titleMedium, { color: theme.colors.onSurface, marginBottom: Spacing.md }]}>{t('selectFolder')}</Text>
            <TouchableOpacity onPress={() => { setSelectedFolderId(null); setShowFolderModal(false); }} style={styles.folderOption}>
              <Ionicons name="home-outline" size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={{ color: theme.colors.onSurface, fontFamily: 'Manrope_600SemiBold' }}>{t('rootFolder')}</Text>
            </TouchableOpacity>
            {folders.map(f => (
              <TouchableOpacity
                key={f.id}
                onPress={() => { setSelectedFolderId(f.id); setShowFolderModal(false); }}
                style={styles.folderOption}
              >
                <Ionicons name="folder" size={20} color={Colors.amber} />
                <Text style={{ color: theme.colors.onSurface, fontFamily: 'Manrope_600SemiBold' }}>{f.name}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* New Folder Modal */}
      <Modal transparent visible={showNewFolderModal} animationType="fade" onRequestClose={() => setShowNewFolderModal(false)}>
        <Pressable style={styles.overlayCenter} onPress={() => setShowNewFolderModal(false)}>
          <Pressable style={[styles.dialog, { backgroundColor: theme.colors.surface }]}>
            <Text style={[Typography.titleMedium, { color: theme.colors.onSurface, marginBottom: Spacing.md }]}>{t('newFolder')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: `${theme.colors.onSurface}0D`, color: theme.colors.onSurface }]}
              placeholder={t('folderName')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity onPress={() => setShowNewFolderModal(false)}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateFolder} style={[styles.createBtn, { backgroundColor: theme.colors.primary }]}>
                <Text style={{ color: theme.isDark ? Colors.background : '#fff', fontWeight: '700' }}>{t('create')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  ocrText: { fontFamily: 'Manrope_800ExtraBold', letterSpacing: 2, fontSize: 12 },
  grid: { padding: Spacing.lg, paddingBottom: 220 },
  gridRow: { gap: 16, marginBottom: 16 },
  imageCard: {
    flex: 1,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    aspectRatio: 0.8,
  },
  thumb: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: 40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
  },
  folderRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  folderPicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderRadius: Radius.lg,
  },
  newFolderBtn: { padding: 14, borderRadius: Radius.lg },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  overlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  sheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: Spacing.lg, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: Spacing.md },
  folderOption: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 12 },
  dialog: { width: '85%', borderRadius: Radius.xxl, padding: Spacing.lg },
  input: { padding: 12, borderRadius: Radius.md, marginBottom: Spacing.lg, fontSize: 15, fontFamily: 'Inter_400Regular' },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md, alignItems: 'center' },
  createBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
  },
  titleInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  suggestionRow: {
    paddingVertical: 4,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginRight: 8,
    gap: 4,
  },
  suggestionText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
  },
});
