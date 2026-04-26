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
      <View style={styles.iconContainer}>
        <Ionicons name="folder" size={32} color={Colors.amber} />
      </View>

      {/* Spacer */}
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
    borderRadius: Radius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    aspectRatio: 0.9,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: `${Colors.amber}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    gap: 4,
  },
  name: {
    ...Typography.titleMedium,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
