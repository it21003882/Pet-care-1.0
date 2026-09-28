/**
 * components/common/Button.tsx
 * Premium Styled Button Component — PetCare Medical Theme
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import colors from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'teal' | 'danger' | 'outline' | 'outlineTeal' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  fullWidth = true,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'secondary':
        return colors.secondary;
      case 'teal':
        return colors.secondary;
      case 'danger':
        return colors.danger;
      case 'outline':
      case 'outlineTeal':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getBorderConfig = () => {
    switch (variant) {
      case 'outline':
        return { borderWidth: 1.5, borderColor: colors.primary };
      case 'outlineTeal':
        return { borderWidth: 1.5, borderColor: colors.secondary };
      case 'ghost':
        return { borderWidth: 0, borderColor: 'transparent' };
      default:
        return { borderWidth: 0, borderColor: 'transparent' };
    }
  };

  const getShadowConfig = () => {
    if (disabled || variant === 'outline' || variant === 'outlineTeal' || variant === 'ghost')
      return {};
    const shadowColor = variant === 'teal' ? colors.secondary : variant === 'danger' ? colors.danger : colors.primary;
    return {
      shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.32,
      shadowRadius: 12,
      elevation: 6,
    };
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'outline':
        return colors.primary;
      case 'outlineTeal':
        return colors.secondary;
      case 'ghost':
        return colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getPaddingConfig = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 9, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 28 };
      default:
        return { paddingVertical: 15, paddingHorizontal: 22 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 13;
      case 'large':
        return 16;
      default:
        return 15;
    }
  };

  const { borderWidth, borderColor } = getBorderConfig();
  const shadowConfig = getShadowConfig();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getPaddingConfig(),
        {
          backgroundColor: getBackgroundColor(),
          borderWidth,
          borderColor,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        shadowConfig,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'outlineTeal' || variant === 'ghost' ? colors.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: getFontSize() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.15,
  },
});

export default Button;
