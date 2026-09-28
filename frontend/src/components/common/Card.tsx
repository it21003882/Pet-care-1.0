/**
 * components/common/Card.tsx
 * Premium Elevated Surface Card Component — PetCare Medical Theme
 */

import React, { ReactNode } from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import colors from '../../constants/colors';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'tinted' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, onPress, style, variant = 'default' }) => {
  const variantStyle = getVariantStyle(variant);

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.84}
        onPress={onPress}
        style={[styles.card, variantStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, variantStyle, style]}>{children}</View>;
};

function getVariantStyle(variant: string): ViewStyle {
  switch (variant) {
    case 'elevated':
      return {
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 8,
      };
    case 'outlined':
      return {
        shadowOpacity: 0,
        elevation: 0,
        borderWidth: 1.5,
        borderColor: colors.borderStrong,
      };
    case 'glass':
      return {
        backgroundColor: colors.glass,
        borderColor: colors.glassStroke,
        shadowOpacity: 0.08,
        shadowRadius: 16,
      };
    case 'tinted':
      return {
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
        borderWidth: 1,
        shadowOpacity: 0,
        elevation: 0,
      };
    case 'flat':
      return {
        shadowOpacity: 0,
        elevation: 0,
        borderColor: colors.borderLight,
      };
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },
});

export default Card;
