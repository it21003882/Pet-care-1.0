/**
 * screens/auth/RegisterScreen.tsx
 * Premium Register Screen — Warm Peach Pet-Care Theme
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
  PawPrint, Heart, Mail, Lock, User, Phone, ChevronLeft,
  Stethoscope, Building2, ShieldCheck,
} from 'lucide-react-native';

type NavProp = StackNavigationProp<AuthStackParamList, 'Register'>;
type UserRole = 'owner' | 'veterinarian' | 'service_center';

const ROLES = [
  {
    key: 'owner' as UserRole,
    label: 'Pet Owner',
    subtitle: 'Manage your companions',
    emoji: '🐾',
    color: colors.primary,
    bg: colors.primaryLight,
    border: `${colors.primary}40`,
  },
  {
    key: 'veterinarian' as UserRole,
    label: 'Veterinarian',
    subtitle: 'Licensed practitioner',
    emoji: '🩺',
    color: '#5B9BD5',
    bg: '#EDF5FF',
    border: '#5B9BD540',
  },
  {
    key: 'service_center' as UserRole,
    label: 'Service Center',
    subtitle: 'Pet grooming & care',
    emoji: '🏢',
    color: colors.secondary,
    bg: colors.secondaryLight,
    border: `${colors.secondary}40`,
  },
];

export const RegisterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [regNo, setRegNo] = useState('');
  const [role, setRole] = useState<UserRole>('owner');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = role === 'service_center' ? 'Business name is required' : 'Full name is required';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      errs.phone = 'Phone number is required';
    } else if (trimmedPhone.length !== 10 || !/^\d{10}$/.test(trimmedPhone)) {
      errs.phone = 'Phone number must be exactly 10 numbers';
    }

    if (role === 'veterinarian' && !regNo.trim()) {
      errs.regNo = 'Registration number is required (e.g. No: XXXX)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role,
        regNo: role === 'veterinarian' ? regNo.trim() : undefined,
      });

      if (role === 'veterinarian') {
        Alert.alert(
          'Registration Submitted',
          'Your doctor registration has been submitted and is pending verification by the admin. You will be able to log in once verified.\n\nContact Admin:\nadmin@gmail.com, no-0770101999',
          [
            {
              text: 'Go to Sign In',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not complete registration.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.key === role)!;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.blobTR} />
      <View style={styles.blobBL} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Top Section ── */}
        <View style={[styles.topSection, { paddingTop: Math.max(insets.top + 12, 28) }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Welcome')}>
            <ChevronLeft size={20} color={colors.navy} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.logoLockup}>
            <View style={styles.logoBox}>
              <PawPrint size={22} color={colors.primary} strokeWidth={2.5} />
              <View style={styles.heartBadge}>
                <Heart size={9} color={colors.primary} strokeWidth={2.5} fill={colors.primary} />
              </View>
            </View>
            <Text style={styles.logoName}>PetCare</Text>
          </View>

          <Text style={styles.pageTitle}>Create your{'\n'}account ✨</Text>
          <Text style={styles.pageSubtitle}>Join thousands of happy pet families</Text>
        </View>

        {/* ── Form Sheet ── */}
        <View style={[styles.formSheet, { paddingBottom: Math.max(insets.bottom + 20, 36) }]}>

          {/* Role Selector */}
          <Text style={styles.sectionLabel}>I AM A</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => {
              const isActive = role === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={[
                    styles.roleChip,
                    { borderColor: isActive ? r.color : colors.border, backgroundColor: isActive ? r.bg : colors.surface },
                    isActive && { shadowColor: r.color, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
                  ]}
                  onPress={() => setRole(r.key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.roleChipEmoji}>{r.emoji}</Text>
                  <Text style={[styles.roleChipLabel, { color: isActive ? r.color : colors.textSecondary }]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.roleSubCard}>
            <Text style={styles.roleSubCardText}>
              {role === 'owner' && '🐾 Track pets, book vets, and manage health records all in one place.'}
              {role === 'veterinarian' && '🩺 Manage consultations, patient records, and e-prescriptions.'}
              {role === 'service_center' && '🏢 List grooming & care services, manage bookings & reviews.'}
            </Text>
          </View>

          <View style={styles.formDivider} />

          {/* Fields */}
          <Text style={styles.sectionLabel}>ACCOUNT DETAILS</Text>

          <Input
            label={role === 'service_center' ? 'Business Name' : 'Full Name'}
            placeholder={role === 'service_center' ? 'Paws Spa & Grooming' : 'Jane Doe'}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
            required
            leftIcon={<User size={17} color={colors.textMuted} strokeWidth={2} />}
          />
          <Input
            label="Email Address"
            placeholder="jane@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            error={errors.email}
            required
            leftIcon={<Mail size={17} color={colors.textMuted} strokeWidth={2} />}
          />
          <Input
            label="Password"
            placeholder="Minimum 6 characters"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              if (confirmPassword && errors.confirmPassword && text === confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }
            }}
            error={errors.password}
            required
            leftIcon={<Lock size={17} color={colors.textMuted} strokeWidth={2} />}
          />
          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            error={errors.confirmPassword}
            required
            leftIcon={<Lock size={17} color={colors.textMuted} strokeWidth={2} />}
          />

          {role === 'veterinarian' && (
            <Input
              label="Reg. No"
              placeholder="No: XXXX"
              value={regNo}
              onChangeText={(text) => {
                setRegNo(text);
                if (errors.regNo) setErrors((prev) => ({ ...prev, regNo: '' }));
              }}
              error={errors.regNo}
              required
              leftIcon={<Stethoscope size={17} color={colors.textMuted} strokeWidth={2} />}
            />
          )}

          <Input
            label="Phone Number"
            placeholder="0770101999"
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(text) => {
              const onlyNums = text.replace(/\D/g, '').slice(0, 10);
              setPhone(onlyNums);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
            }}
            error={errors.phone}
            required
            hint="Only 10 numbers allowed (e.g. 0770101999)"
            leftIcon={<Phone size={17} color={colors.textMuted} strokeWidth={2} />}
          />

          {role === 'veterinarian' && (
            <View style={styles.adminContactNotice}>
              <View style={styles.adminNoticeHeader}>
                <ShieldCheck size={16} color="#B45309" />
                <Text style={styles.adminNoticeTitle}>Admin Verification Notice</Text>
              </View>
              <Text style={styles.adminNoticeText}>
                Doctors cannot access the portal until verified by the admin. Please wait for verification after submitting.
              </Text>
              <Text style={styles.adminNoticeContact}>
                Contact Admin: admin@gmail.com, no-0770101999
              </Text>
            </View>
          )}

          <Button title="SUBMIT" onPress={handleRegister} loading={loading} style={styles.submitBtn} />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  blobTR: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#FFD9C4', opacity: 0.5, top: -60, right: -60 },
  blobBL: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#C9F0DF', opacity: 0.4, bottom: 80, left: -60 },

  topSection: { paddingHorizontal: 24, paddingBottom: 24 },
  backBtn: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: colors.border,
  },
  logoLockup: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 22 },
  logoBox: {
    width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: `${colors.primary}30`,
  },
  heartBadge: {
    position: 'absolute', right: -6, bottom: -6, width: 18, height: 18, borderRadius: 7,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  logoName: { fontSize: 20, fontWeight: '900', color: colors.navy, letterSpacing: -0.4 },
  pageTitle: {
    fontSize: isSmallDevice ? 26 : 32, fontWeight: '900', color: colors.navy,
    letterSpacing: -0.8, lineHeight: isSmallDevice ? 32 : 38, marginBottom: 8,
  },
  pageSubtitle: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },

  formSheet: {
    flex: 1, backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: isSmallDevice ? 20 : 26, paddingTop: 28,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 12,
  },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  roleChip: {
    flex: 1, borderRadius: 16, borderWidth: 1.5, paddingVertical: 12, paddingHorizontal: 6,
    alignItems: 'center', gap: 5,
    shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0,
  },
  roleChipEmoji: { fontSize: 22 },
  roleChipLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  roleSubCard: {
    backgroundColor: colors.primaryLight, borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: `${colors.primary}20`,
  },
  roleSubCardText: { fontSize: 12, color: colors.primaryDark, fontWeight: '600', lineHeight: 18 },
  formDivider: { height: 1, backgroundColor: colors.borderLight, marginBottom: 20 },
  submitBtn: { marginTop: 4, marginBottom: 18 },
  adminContactNotice: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  adminNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  adminNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  adminNoticeText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
    fontWeight: '500',
    marginBottom: 6,
  },
  adminNoticeContact: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  footerRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  footerText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  footerLink: { fontSize: 13, fontWeight: '800', color: colors.primary },
});

export default RegisterScreen;
