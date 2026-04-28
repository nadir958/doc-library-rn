import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FolderModel } from '../types/models';
import { useAppTheme } from '../theme/theme';
import { Colors, Radius, Spacing, Typography } from '../theme/colors';
import { useTranslation } from 'react-i18next';

interface FolderCardProps {
  folder: FolderModel;
  onPress: () => void;
  onLongPress?: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onPress, onLongPress }) => {
  const theme = useAppTheme();
  const { t } = useTranslation();

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
          shadowColor: theme.isDark ? '#000' : theme.colors.primary,
        },
      ]}
    >
      {/* Folder Icon */}
      <View style={styles.topSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="folder" size={32} color={Colors.amber} />
        </View>
        {folder.tags && folder.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {folder.tags.slice(0, 2).map((tag, idx) => (
              <View key={idx} style={[styles.tagBadge, { backgroundColor: `${theme.colors.primary}1A` }]}>
                <Text style={[styles.tagText, { color: theme.colors.primary }]} numberOfLines={1}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={styles.bottom}>
        <Text
          style={[styles.name, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {folder.name}
        </Text>
        <View style={styles.viewRow}>
          <Text style={[styles.viewText, { color: theme.colors.primary }]}>
            {t('viewDocuments').toUpperCase()}
          </Text>
          <Ionicons name="arrow-forward" size={10} color={theme.colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
    aspectRatio: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: `${Colors.amber}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection: {
    gap: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    maxWidth: 70,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '700',
  },
  bottom: {
    gap: 2,
  },
  name: {
    ...Typography.titleSmall,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
