/**
 * screens/auth/WelcomeScreen.tsx
 * Premium Welcome / Splash Screen — Warm Peach Pet-Care Theme
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import colors from '../../constants/colors';
import { PawPrint, Heart, Sparkles } from 'lucide-react-native';

type NavProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const { width: W, height: H } = Dimensions.get('window');

export const WelcomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();

  // Subtle fade+slide animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(badgeFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Decorative Background Blobs ── */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobTopLeft} />
      <View style={styles.blobBottomLeft} />
      <View style={styles.blobMidRight} />

      {/* ── Logo Row ── */}
      <View style={[styles.logoRow, { paddingTop: Math.max(insets.top + 16, 32) }]}>
        <View style={styles.logoMark}>
          <PawPrint size={20} color={colors.primary} strokeWidth={2.5} />
        </View>
        <Text style={styles.logoText}>PetCare</Text>
        <View style={styles.heartBadge}>
          <Heart size={12} color={colors.primary} strokeWidth={2.5} fill={colors.primary} />
        </View>
      </View>

      {/* ── Hero Illustration ── */}
      <Animated.View
        style={[
          styles.heroImageContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require('../../../assets/hero_pets.jpg')}
          style={styles.heroImage}
          resizeMode="contain"
        />

        {/* Floating Badges on Image */}
        <Animated.View style={[styles.floatingBadge1, { opacity: badgeFade }]}>
          <View style={styles.floatingBadgeIcon}>
            <Heart size={12} color={colors.danger} strokeWidth={2.5} fill={colors.danger} />
          </View>
          <Text style={styles.floatingBadgeText}>10k+ Happy Pets</Text>
        </Animated.View>

        <Animated.View style={[styles.floatingBadge2, { opacity: badgeFade }]}>
          <View style={[styles.floatingBadgeIcon, { backgroundColor: colors.secondaryLight }]}>
            <Sparkles size={12} color={colors.secondary} strokeWidth={2.5} />
          </View>
          <Text style={[styles.floatingBadgeText, { color: colors.secondaryDark }]}>Verified Vets</Text>
        </Animated.View>

        {/* Pet avatar bubbles */}
        <View style={[styles.avatarBubble, { top: 20, right: 10, backgroundColor: colors.accentMint }]}>
          <Text style={styles.avatarEmoji}>🐶</Text>
        </View>
        <View style={[styles.avatarBubble, { top: 60, right: -10, backgroundColor: colors.accentPeach }]}>
          <Text style={styles.avatarEmoji}>🐱</Text>
        </View>
        <View style={[styles.avatarBubble, { top: 20, left: 10, backgroundColor: colors.accentLight }]}>
          <Text style={styles.avatarEmoji}>🐦</Text>
        </View>
        <View style={[styles.avatarBubble, { top: 60, left: -10, backgroundColor: colors.accentYellow + '80' }]}>
          <Text style={styles.avatarEmoji}>🐢</Text>
        </View>
      </Animated.View>

      {/* ── Bottom Content ── */}
      <Animated.View
        style={[
          styles.bottomContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
      >
        {/* Headline */}
        <Text style={styles.headline}>
          Adopt your{'\n'}best friend
        </Text>
        <Text style={styles.subtext}>
          When you adopt, you not only save a loving companion — you also make space for others in need.
        </Text>

        {/* Paw-print icon dots */}
        <View style={styles.dotsRow}>
          {['🐾', '🐾', '🐾'].map((e, i) => (
            <Text key={i} style={[styles.dot, { opacity: i === 1 ? 1 : 0.3 }]}>{e}</Text>
          ))}
        </View>

        {/* CTAs */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.86}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
          <View style={styles.primaryBtnArrow}>
            <Text style={styles.primaryBtnArrowText}>→</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.signInRow}>
          <Text style={styles.signInText}>I already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
  },

  // ── Background Blobs ──
  blobTopRight: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFD9C4',
    opacity: 0.6,
    top: -60,
    right: -60,
  },
  blobTopLeft: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#C9F0DF',
    opacity: 0.5,
    top: 80,
    left: -50,
  },
  blobBottomLeft: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E8D5FF',
    opacity: 0.4,
    bottom: 120,
    left: -60,
  },
  blobMidRight: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFE4B2',
    opacity: 0.5,
    top: H * 0.4,
    right: -30,
  },

  // ── Logo ──
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: `${colors.primary}30`,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.navy,
    letterSpacing: -0.5,
  },
  heartBadge: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Hero Image ──
  heroImageContainer: {
    width: W * 0.85,
    height: H * 0.42,
    marginTop: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  // Floating Badges
  floatingBadge1: {
    position: 'absolute',
    bottom: 20,
    left: -10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingBadge2: {
    position: 'absolute',
    bottom: 60,
    right: -10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingBadgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },

  // Pet Emoji Bubbles
  avatarBubble: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarEmoji: { fontSize: 18 },

  // ── Bottom Content ──
  bottomContent: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 28,
    justifyContent: 'flex-end',
    gap: 0,
  },
  headline: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.navy,
    letterSpacing: -1,
    lineHeight: 44,
    marginBottom: 12,
  },
  subtext: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  dot: { fontSize: 16 },

  // Primary CTA
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 28,
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  primaryBtnArrow: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnArrowText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Sign In row
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  signInText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
});

export default WelcomeScreen;
