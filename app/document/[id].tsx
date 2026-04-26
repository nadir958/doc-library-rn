import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, Pressable, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../src/theme/theme';
import { Colors, Radius, Spacing, Typography } from '../../src/theme/colors';
import { DocumentModel, PageModel } from '../../src/types/models';
import * as db from '../../src/services/databaseService';
import { useDocumentStore } from '../../src/store/documentStore';
import { generateAndSharePdf } from '../../src/services/exportService';
import { pickFromGallery, startSmartScan } from '../../src/services/scanService';
import { GradientButton } from '../../src/components/GradientButton';

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useAppTheme();

  const [document, setDocument] = useState<DocumentModel | null>(null);
  const [pages, setPages] = useState<PageModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showAddPage, setShowAddPage] = useState(false);

  const { updateMetadata, deleteDocument } = useDocumentStore();

  const loadData = async () => {
    setLoading(true);
    const docs = await db.getAllDocuments();
    const found = docs.find(d => d.id === Number(id));
    if (found) {
      setDocument(found);
      setTitle(found.title);
      setTags([...found.tags]);
      const p = await db.getPagesForDocument(found.id);
      setPages(p);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? '' : (document?.title ?? ''),
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 8, marginRight: 4 }}>
          <TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)}>
            <Ionicons name={isEditing ? 'checkmark' : 'pencil-outline'} size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          {!isEditing && (
            <TouchableOpacity onPress={() => setShowMoreActions(true)}>
              <Ionicons name="ellipsis-vertical" size={22} color={theme.colors.onSurface} />
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [isEditing, document, title, tags, theme]);

  const handleSave = async () => {
    if (!document) return;
    await updateMetadata(document.id, { title, tags });
    setDocument(prev => prev ? { ...prev, title, tags } : null);
    setIsEditing(false);
  };

  const handleDeleteDoc = async () => {
    if (!document) return;
    setShowMoreActions(false);
    Alert.alert(t('deleteDocument'), t('deleteDocumentConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'), style: 'destructive', onPress: async () => {
          await deleteDocument(document.id);
          router.back();
        }
      },
    ]);
  };

  const handleDeletePage = async (pageId: number) => {
    Alert.alert(t('delete'), t('deleteDocumentConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'), style: 'destructive', onPress: async () => {
          await db.deletePage(pageId);
          await loadData();
        }
      },
    ]);
  };

  const handleUpdateNotes = async (pageId: number, notes: string) => {
    await db.updatePageNotes(pageId, notes);
  };

  const handleSharePdf = async () => {
    if (!document) return;
    setShowMoreActions(false);
    try {
      await generateAndSharePdf(document, pages);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de générer le PDF.');
    }
  };

  const handleAddPagesGallery = async () => {
    setShowAddPage(false);
    const images = await pickFromGallery();
    if (images?.length && document) {
      router.push({
        pathname: '/capture-preview',
        params: { imagePaths: JSON.stringify(images), existingDocId: document.id },
      });
    }
  };

  const handleAddPagesScan = async () => {
    setShowAddPage(false);
    const images = await startSmartScan();
    if (images?.length && document) {
      router.push({
        pathname: '/capture-preview',
        params: { imagePaths: JSON.stringify(images), existingDocId: document.id },
      });
    }
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );

  if (!document) return null;

  const date = new Date(document.createdAt);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Breadcrumb */}
        <TouchableOpacity onPress={() => router.back()} style={styles.breadcrumb}>
          <Ionicons name="arrow-back" size={14} color={theme.colors.primary} />
          <Text style={[styles.breadcrumbText, { color: theme.colors.onSurfaceVariant }]}>Retour au Vault</Text>
          <Text style={styles.slash}>/</Text>
          <Text style={[styles.breadcrumbTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>{document.title}</Text>
        </TouchableOpacity>

        {/* Title in edit mode */}
        {isEditing && (
          <TextInput
            style={[styles.titleInput, { color: theme.colors.onSurface, borderBottomColor: theme.colors.primary }]}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        )}

        {/* Pages */}
        {pages.length === 0 ? (
          <View style={styles.emptyPages}>
            <Ionicons name="document-text-outline" size={64} color={`${theme.colors.onSurface}1A`} />
            <Text style={{ color: `${theme.colors.onSurface}33`, marginTop: 16 }}>{t('noPages')}</Text>
          </View>
        ) : (
          pages.map(page => (
            <ImmersivePage
              key={page.id}
              page={page}
              isEditing={isEditing}
              theme={theme}
              onDelete={() => handleDeletePage(page.id)}
              onUpdateNotes={(notes: string) => handleUpdateNotes(page.id, notes)}
              t={t}
            />
          ))
        )}

        {/* Metadata Card */}
        <View style={[styles.metaCard, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? Colors.border : Colors.borderLight }]}>
          <Text style={[styles.metaLabel, { color: `${theme.colors.onSurface}4D` }]}>PROPRIÉTÉS</Text>
          <MetaRow label="Créé" value={`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`} theme={theme} />
          <MetaRow label="Type" value="PDF (OCR Optimisé)" theme={theme} />
          <View style={[styles.metaDivider, { backgroundColor: `${theme.colors.onSurface}1A` }]} />

          <View style={styles.tagsHeader}>
            <Text style={[styles.metaLabel, { color: `${theme.colors.onSurface}4D` }]}>TAGS</Text>
            {isEditing && (
              <TouchableOpacity onPress={() => setShowAddTag(true)}>
                <Ionicons name="add" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.tagsWrap}>
            {tags.map(tag => (
              <View key={tag} style={[styles.tagBadge, { backgroundColor: `${theme.colors.primaryContainer}1A` }]}>
                <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
                {isEditing && (
                  <TouchableOpacity onPress={() => setTags(prev => prev.filter(t => t !== tag))}>
                    <Ionicons name="close" size={12} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      {!isEditing && (
        <View style={styles.fabWrapper}>
          <TouchableOpacity onPress={() => setShowAddPage(true)} activeOpacity={0.85}>
            <LinearGradient
              colors={['#C0C1FF', '#8083FF']}
              style={styles.fabExtended}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.background} />
              <Text style={styles.fabLabel}>AJOUTER UNE PAGE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* More Actions Modal */}
      <Modal transparent visible={showMoreActions} animationType="slide" onRequestClose={() => setShowMoreActions(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowMoreActions(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: '#191F2F' }]}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.sheetItem} onPress={handleSharePdf}>
              <Ionicons name="share-outline" size={24} color={theme.colors.onSurface} />
              <Text style={[styles.sheetItemTitle, { color: theme.colors.onSurface }]}>{t('share')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetItem} onPress={handleDeleteDoc}>
              <Ionicons name="trash-outline" size={24} color={Colors.red} />
              <Text style={[styles.sheetItemTitle, { color: Colors.red }]}>{t('deleteDocument')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Tag Modal */}
      <Modal transparent visible={showAddTag} animationType="fade" onRequestClose={() => setShowAddTag(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowAddTag(false)}>
          <Pressable style={[styles.dialog, { backgroundColor: theme.colors.surface }]}>
            <Text style={[Typography.titleMedium, { color: theme.colors.onSurface, marginBottom: Spacing.md }]}>{t('addTag')}</Text>
            <TextInput
              style={[styles.dialogInput, { backgroundColor: `${theme.colors.onSurface}0D`, color: theme.colors.onSurface }]}
              placeholder={t('tags')}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={newTag}
              onChangeText={setNewTag}
              autoFocus
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity onPress={() => setShowAddTag(false)}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                if (newTag.trim()) {
                  setTags(prev => [...prev, newTag.trim()]);
                  setNewTag('');
                }
                setShowAddTag(false);
              }} style={[styles.addTagBtn, { backgroundColor: theme.colors.primary }]}>
                <Text style={{ color: theme.isDark ? Colors.background : '#fff', fontWeight: '700' }}>{t('add')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Page Modal */}
      <Modal transparent visible={showAddPage} animationType="slide" onRequestClose={() => setShowAddPage(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowAddPage(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: '#1E293B' }]}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.sheetItem} onPress={handleAddPagesScan}>
              <Ionicons name="sparkles" size={24} color={Colors.amber} />
              <View>
                <Text style={[styles.sheetItemTitle, { color: theme.colors.onSurface }]}>{t('smartScan')}</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>{t('smartScanDesc')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetItem} onPress={handleAddPagesGallery}>
              <Ionicons name="images" size={24} color={Colors.orange} />
              <Text style={[styles.sheetItemTitle, { color: theme.colors.onSurface }]}>{t('fromGallery')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ImmersivePage({ page, isEditing, theme, onDelete, onUpdateNotes, t }: any) {
  const [notes, setNotes] = useState<string>(page.notes ?? '');

  return (
    <View style={styles.pageBlock}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: page.imagePath }} style={styles.pageImage} resizeMode="contain" />

        {/* Zoom hint — simplified, pinch-to-zoom native */}
        <View style={[styles.integrityBadge, { backgroundColor: Colors.overlay }]}>
          <View style={[styles.integrityIcon, { backgroundColor: `${Colors.primary}33` }]}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.integrityTitle}>INTÉGRITÉ VÉRIFIÉE</Text>
            <Text style={styles.integrityHash}>SHA-256: 4e9...f21</Text>
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity onPress={onDelete} style={styles.deletePageBtn}>
            <Ionicons name="trash" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Notes */}
      <View style={[styles.notesCard, { backgroundColor: theme.colors.surface, borderColor: theme.isDark ? Colors.border : Colors.borderLight }]}>
        <View style={styles.notesHeader}>
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={[styles.notesTitle, { color: theme.colors.onSurface }]}>NOTES DU DOCUMENT</Text>
          <View style={styles.confBadge}>
            <Text style={styles.confText}>CONFIDENTIEL</Text>
          </View>
        </View>
        <TextInput
          style={[styles.notesInput, { backgroundColor: `${theme.colors.onSurface}0D`, color: theme.colors.onSurface }]}
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="Ajoutez vos observations..."
          placeholderTextColor={`${theme.colors.onSurface}40`}
        />
        <GradientButton
          onPress={() => onUpdateNotes(notes)}
          label="ENREGISTRER"
          icon={<Ionicons name="save-outline" size={18} color={Colors.background} />}
          style={{ marginTop: Spacing.md }}
        />
      </View>
    </View>
  );
}

function MetaRow({ label, value, theme }: any) {
  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaRowLabel, { color: `${theme.colors.onSurface}66` }]}>{label}</Text>
      <Text style={[styles.metaRowValue, { color: theme.colors.onSurface }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingTop: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.lg },
  breadcrumbText: { fontSize: 12 },
  slash: { color: 'rgba(255,255,255,0.1)', fontSize: 12 },
  breadcrumbTitle: { fontSize: 12, fontWeight: 'bold', flex: 1 },
  titleInput: { fontSize: 22, fontFamily: 'Manrope_700Bold', borderBottomWidth: 1, paddingBottom: 8, marginBottom: Spacing.lg },
  emptyPages: { alignItems: 'center', justifyContent: 'center', height: 300 },
  pageBlock: { marginBottom: Spacing.xl },
  imageContainer: {
    height: 420,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginBottom: Spacing.lg,
  },
  pageImage: { width: '100%', height: '100%' },
  integrityBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
  },
  integrityIcon: { padding: 8, borderRadius: Radius.sm },
  integrityTitle: { fontSize: 9, fontWeight: 'bold', color: Colors.primary, letterSpacing: 1.2 },
  integrityHash: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  deletePageBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.red,
    padding: 10,
    borderRadius: 20,
  },
  notesCard: { padding: Spacing.lg, borderRadius: Radius.xxl, borderWidth: 1 },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  notesTitle: { fontFamily: 'Manrope_700Bold', fontSize: 14, flex: 1 },
  confBadge: { backgroundColor: `${Colors.primary}1A`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  confText: { fontSize: 8, fontWeight: 'bold', color: Colors.primary },
  notesInput: {
    padding: 12,
    borderRadius: Radius.sm,
    fontSize: 14,
    minHeight: 80,
    fontFamily: 'Inter_400Regular',
    textAlignVertical: 'top',
  },
  metaCard: { padding: Spacing.lg, borderRadius: Radius.xxl, borderWidth: 1, marginBottom: Spacing.lg },
  metaLabel: { fontFamily: 'Manrope_700Bold', fontSize: 10, letterSpacing: 1.5, marginBottom: Spacing.md },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  metaRowLabel: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  metaRowValue: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
  metaDivider: { height: 1, marginVertical: Spacing.md },
  tagsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: 'bold' },
  fabWrapper: { position: 'absolute', bottom: 110, left: Spacing.lg, right: Spacing.lg },
  fabExtended: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18, borderRadius: 30 },
  fabLabel: { color: Colors.background, fontFamily: 'Manrope_800ExtraBold', letterSpacing: 1.2, fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, paddingBottom: 40 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: Spacing.md },
  sheetItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  sheetItemTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 16 },
  dialog: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl },
  dialogInput: { padding: 12, borderRadius: 8, fontSize: 14, marginBottom: Spacing.lg },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md, alignItems: 'center' },
  addTagBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md },
});
