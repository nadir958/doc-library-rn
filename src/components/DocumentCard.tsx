import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DocumentModel } from '../types/models';
import { useAppTheme } from '../theme/theme';
import { Colors, Radius, Spacing, Typography } from '../theme/colors';

interface DocumentCardProps {
  document: DocumentModel;
  onPress: () => void;
  onLongPress: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onPress, onLongPress }) => {
  const theme = useAppTheme();
  const date = new Date(document.createdAt);
  const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.isDark ? Colors.border : Colors.borderLight,
        },
      ]}
    >
      {/* Thumbnail */}
      <View style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Ionicons name="document-text-outline" size={32} color={Colors.primary} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {document.title}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          />
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {document.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {document.tags.length > 2 && (
            <Text style={[styles.moreTag, { color: theme.isDark ? 'rgba(255,255,255,0.24)' : 'rgba(0,0,0,0.24)' }]}>
              +{document.tags.length - 2}
            </Text>
          )}
        </View>

        {/* Date */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={12} color={Colors.primary} />
          <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>{dateStr}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: Radius.xxl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: Radius.xxl,
    borderBottomLeftRadius: Radius.xxl,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.titleSmall,
    fontWeight: 'bold',
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  moreTag: {
    fontSize: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 11,
  },
});
