/**
 * screens/auth/LoginScreen.tsx
 * Premium Login Screen — Warm Peach Pet-Care Theme
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import colors from '../../constants/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { isSmallDevice } from '../../utils/responsive';
import {
  PawPrint,
  Mail,
  Lock,
  ChevronLeft,
  Heart,
  ShieldCheck,
} from 'lucide-react-native';

type NavProp = StackNavigationProp<AuthStackParamList, 'Login'>;
const { height: H } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await login({ email: email.trim(), password });
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('verification') || msg.toLowerCase().includes('pending')) {
        Alert.alert(
          'Verification Pending',
          msg || 'Your account is pending verification. Please wait for admin verification before signing in.\n\nContact Admin:\nadmin@gmail.com, no-0770101999'
        );
      } else {
        Alert.alert('Login Failed', msg || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Background blobs ── */}
      <View style={styles.blobTR} />
      <View style={styles.blobBL} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Section ── */}
        <View style={[styles.topSection, { paddingTop: Math.max(insets.top + 12, 28) }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Welcome')}>
            <ChevronLeft size={20} color={colors.navy} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoLockup}>
            <View style={styles.logoBox}>
              <PawPrint size={22} color={colors.primary} strokeWidth={2.5} />
              <View style={styles.heartBadge}>
                <Heart size={9} color={colors.primary} strokeWidth={2.5} fill={colors.primary} />
              </View>
            </View>
            <Text style={styles.logoName}>PetCare</Text>
          </View>

          <Text style={styles.pageTitle}>Welcome{'\n'}back! 👋</Text>
          <Text style={styles.pageSubtitle}>Sign in to your care portal</Text>

          {/* Pet emoji decoration */}
          <View style={styles.petEmojiRow}>
            {['🐶', '🐱', '🐦', '🐢'].map((e, i) => (
              <View key={i} style={[styles.emojiChip, { backgroundColor: [colors.primaryLight, colors.secondaryLight, '#EDF5FF', colors.accentLight][i] }]}>
                <Text style={styles.emojiChipText}>{e}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Form Card ── */}
        <View style={[styles.formCard, { paddingBottom: Math.max(insets.bottom + 20, 36) }]}>

          <View style={styles.secureRow}>
            <ShieldCheck size={14} color={colors.secondary} strokeWidth={2.5} />
            <Text style={styles.secureText}>Secure Login · End-to-End Protected</Text>
          </View>

          <Input
            label="Email Address"
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            leftIcon={<Mail size={17} color={colors.textMuted} strokeWidth={2} />}
          />

          <Input
            label="Password"
            placeholder="Your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            leftIcon={<Lock size={17} color={colors.textMuted} strokeWidth={2} />}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.createAccountBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={styles.createAccountBtnText}>Create New Account</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Register here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Blobs
  blobTR: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFD9C4',
    opacity: 0.5,
    top: -60,
    right: -60,
  },
  blobBL: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#C9F0DF',
    opacity: 0.4,
    bottom: 100,
    left: -60,
  },

  // ── Top Section ──
  topSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 22,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: `${colors.primary}30`,
  },
  heartBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 18,
    height: 18,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.navy,
    letterSpacing: -0.4,
  },
  pageTitle: {
    fontSize: isSmallDevice ? 28 : 34,
    fontWeight: '900',
    color: colors.navy,
    letterSpacing: -0.8,
    lineHeight: isSmallDevice ? 34 : 40,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 20,
  },
  petEmojiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emojiChip: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChipText: { fontSize: 20 },

  // ── Form Card ──
  formCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: isSmallDevice ? 20 : 26,
    paddingTop: 28,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: `${colors.secondary}25`,
  },
  secureText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondaryDark,
  },
  loginBtn: {
    marginTop: 4,
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  createAccountBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.primaryLight,
  },
  createAccountBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
});

export default LoginScreen;
