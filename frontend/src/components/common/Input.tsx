/**
 * components/common/Input.tsx
 * Premium Form Input Component — PetCare Medical Theme
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import colors from '../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  hint,
  leftIcon,
  rightIcon,
  required,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, isFocused && styles.labelFocused, error && styles.labelError]}>
            {label}
          </Text>
          {required && <Text style={styles.requiredDot}> *</Text>}
        </View>
      )}
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        error ? styles.inputWrapperError : null,
      ]}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            inputStyle,
          ]}
          placeholderTextColor={colors.textPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
      {error ? (
        <View style={styles.feedbackRow}>
          <Text style={styles.errorDot}>●</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  labelFocused: {
    color: colors.primary,
  },
  labelError: {
    color: colors.danger,
  },
  requiredDot: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.danger,
    marginTop: -2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  inputWrapperError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    paddingLeft: 14,
    paddingRight: 4,
  },
  rightIconContainer: {
    paddingRight: 14,
    paddingLeft: 4,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5,
  },
  errorDot: {
    fontSize: 8,
    color: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
});

export default Input;
