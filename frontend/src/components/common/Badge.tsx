/**
 * components/common/Badge.tsx
 * Premium Status Badge Component — PetCare Medical Theme
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import colors from '../../constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'neutral' | 'teal';
  style?: ViewStyle;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', style, dot = false }) => {
  const { bg, text, border, dotColor } = getColors(variant);

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

function getColors(variant: string) {
  switch (variant) {
    case 'success':
    case 'teal':
      return {
        bg: colors.secondaryLight,
        text: colors.secondaryDark,
        border: `${colors.secondary}40`,
        dotColor: colors.secondary,
      };
    case 'warning':
      return {
        bg: colors.warningLight,
        text: '#92400E',
        border: `${colors.warning}40`,
        dotColor: colors.warning,
      };
    case 'danger':
      return {
        bg: colors.dangerLight,
        text: colors.dangerDark,
        border: `${colors.danger}40`,
        dotColor: colors.danger,
      };
    case 'secondary':
      return {
        bg: colors.accentLight,
        text: colors.accentDark,
        border: `${colors.accent}40`,
        dotColor: colors.accent,
      };
    case 'neutral':
      return {
        bg: colors.borderLight,
        text: colors.textSecondary,
        border: colors.border,
        dotColor: colors.textMuted,
      };
    default:
      return {
        bg: colors.primaryLight,
        text: colors.primaryDark,
        border: `${colors.primary}40`,
        dotColor: colors.primary,
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
});

export default Badge;
