/**
 * utils/responsive.ts
 * Device-agnostic responsive layout helpers for mobile screens
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base guideline metrics (standard iPhone 11 / X / 12 / 13 / 14 / 15: 375 x 812)
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

/**
 * Scales a dimension linearly based on screen width.
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;
};

/**
 * Scales a dimension linearly based on screen height.
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / GUIDELINE_BASE_HEIGHT) * size;
};

/**
 * Moderately scales a dimension. Factor determines the influence of device scaling.
 * factor = 0.5 (default) means 50% between original size and scaled size.
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Clamps font scaling so text doesn't blow out or shrink excessively.
 */
export const moderateFontSize = (size: number, factor: number = 0.4): number => {
  const scaled = moderateScale(size, factor);
  // Cap at 1.3x max to maintain layout integrity
  return Math.min(scaled, size * 1.3);
};

export const isSmallDevice = SCREEN_WIDTH < 380;
export const isTablet = SCREEN_WIDTH >= 768;

export const dimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice,
  isTablet,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
};

export default {
  scale,
  verticalScale,
  moderateScale,
  moderateFontSize,
  dimensions,
  isSmallDevice,
  isTablet,
};
