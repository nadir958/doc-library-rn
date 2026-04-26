import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../theme/theme';
import { Colors, Radius, Typography } from '../theme/colors';

interface GradientButtonProps {
  onPress: () => void;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  colors?: readonly [string, string, ...string[]];
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  onPress, label, icon, disabled, loading, style, textStyle, colors: gradColors,
}) => {
  const theme = useAppTheme();
  const gradientColors = gradColors ?? (theme.isDark
    ? Colors.gradient.primary
    : Colors.gradient.primaryLight);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={theme.isDark ? Colors.background : '#fff'} />
        ) : (
          <>
            {icon}
            <Text style={[styles.label, { color: theme.isDark ? Colors.background : '#fff' }, textStyle]}>
              {label}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  label: {
    ...Typography.titleSmall,
    letterSpacing: 1.2,
    fontSize: 13,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.5,
  },
});
