/**
 * components/common/Loading.tsx
 * Premium Loading Spinner — PetCare Medical Theme
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';
import { PawPrint } from 'lucide-react-native';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  tint?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullScreen = false,
  tint,
}) => {
  const color = tint || colors.primary;

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={[styles.spinnerCard, { borderColor: `${color}25` }]}>
        <ActivityIndicator size="large" color={color} />
        <View style={styles.iconRow}>
          <PawPrint size={14} color={`${color}70`} strokeWidth={2} />
        </View>
      </View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  spinnerCard: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    gap: 4,
  },
  iconRow: {
    marginTop: -4,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

export default Loading;
