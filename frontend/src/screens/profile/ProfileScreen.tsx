/**
 * screens/profile/ProfileScreen.tsx
 * User Profile & Account Settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ShieldCheck, ChevronRight, PawPrint } from 'lucide-react-native';

type NavProp = StackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user, logout, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      await authService.updateProfile({ name: name.trim(), phone: phone.trim() });
      await refreshUser();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err: any) {
      Alert.alert('Update Error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        <Image
          source={
            user?.profileImage
              ? { uri: user.profileImage }
              : { uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' }
          }
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Badge
          label={user?.role || 'owner'}
          variant={user?.role === 'veterinarian' ? 'success' : 'primary'}
          style={styles.roleBadge}
        />
      </Card>

      <Card style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <Button
            title={isEditing ? 'Cancel' : 'Edit'}
            variant="outline"
            size="small"
            onPress={() => {
              if (isEditing) {
                setName(user?.name || '');
                setPhone(user?.phone || '');
              }
              setIsEditing(!isEditing);
            }}
          />
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <Input label="Full Name" value={name} onChangeText={setName} />
            <Input label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Button title="Save Profile" onPress={handleSave} loading={saving} style={styles.saveBtn} />
          </View>
        ) : (
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailVal}>{user?.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailVal}>{user?.phone || 'Not provided'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role</Text>
              <Text style={[styles.detailVal, { textTransform: 'capitalize' }]}>{user?.role}</Text>
            </View>
          </View>
        )}
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.cardTitle}>App Information</Text>
        <View style={styles.detailsList}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>App Version</Text>
            <Text style={styles.detailVal}>1.0.0 (TypeScript)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Architecture</Text>
            <Text style={styles.detailVal}>React Native + Expo + Express</Text>
          </View>
        </View>
      </Card>

      <Button
        title="Sign Out"
        variant="danger"
        onPress={handleLogout}
        style={styles.logoutBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12, backgroundColor: colors.borderLight },
  userName: { fontSize: 20, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  roleBadge: { marginTop: 10 },
  infoCard: { marginTop: 12, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  editForm: { marginTop: 8 },
  saveBtn: { marginTop: 8 },
  detailsList: { gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  detailLabel: { fontSize: 13, color: colors.textSecondary },
  detailVal: { fontSize: 13, fontWeight: '600', color: colors.text },
  adminCard: {
    marginTop: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  adminCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  adminIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminCardTitle: { fontSize: 15, fontWeight: '700', color: '#991B1B' },
  adminCardSub: { fontSize: 12, color: '#B91C1C', marginTop: 2 },
  logoutBtn: { marginTop: 24 },
});

export default ProfileScreen;
