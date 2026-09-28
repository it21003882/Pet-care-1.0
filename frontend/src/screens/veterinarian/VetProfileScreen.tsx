/**
 * screens/veterinarian/VetProfileScreen.tsx
 * Professional Profile & Clinic Settings for Veterinarians
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import vetService from '../../functions/function2-veterinarians/services/vetService';
import { IVeterinarian } from '../../types/models';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import {
  Stethoscope,
  Building2,
  DollarSign,
  Clock,
  Phone,
  Mail,
  Award,
  LogOut,
  Calendar,
} from 'lucide-react-native';

export const VetProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [vetProfile, setVetProfile] = useState<IVeterinarian | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [clinicName, setClinicName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [typesOfCare, setTypesOfCare] = useState('');
  const [description, setDescription] = useState('');

  const loadProfile = async () => {
    try {
      const data = await vetService.getMyProfile();
      setVetProfile(data);
      if (data) {
        setClinicName(data.clinicName || '');
        setSpecialization(data.specialization || '');
        setQualification(data.qualification || '');
        setConsultationFee(data.consultationFee ? String(data.consultationFee) : '0');
        setPhone(data.phone || user?.phone || '');
        setEmail(data.email || user?.email || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setLatitude(data.latitude != null ? String(data.latitude) : '');
        setLongitude(data.longitude != null ? String(data.longitude) : '');
        setTypesOfCare(data.typesOfCare || '');
        setDescription(data.description || '');
      }
    } catch (e) {
      console.error('Failed to load vet profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!vetProfile) return;
    try {
      setSaving(true);
      const feeNum = parseFloat(consultationFee) || 0;
      const latNum = latitude.trim() ? parseFloat(latitude) : null;
      const lngNum = longitude.trim() ? parseFloat(longitude) : null;

      await vetService.updateVeterinarian(vetProfile._id, {
        clinicName,
        specialization,
        qualification,
        consultationFee: feeNum,
        phone,
        email,
        address,
        city,
        latitude: latNum,
        longitude: lngNum,
        typesOfCare,
        description,
      });
      Alert.alert('Success', 'Practitioner profile updated.');
      setEditing(false);
      loadProfile();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of the Clinical Portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) {
    return <Loading fullScreen message="Loading practitioner profile..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top + 8, 16),
          paddingBottom: Math.max(insets.bottom + 32, 48),
        },
      ]}
    >
      {/* Doctor Card */}
      <Card style={styles.profileCard}>
        <Image
          source={
            vetProfile?.profileImage
              ? { uri: vetProfile.profileImage }
              : user?.profileImage
              ? { uri: user.profileImage }
              : { uri: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400' }
          }
          style={styles.avatar}
        />
        <Text style={styles.doctorName}>
          {user?.name?.startsWith('Dr.') ? user.name : `Dr. ${user?.name || 'Veterinarian'}`}
        </Text>
        <Text style={styles.emailText}>{user?.email}</Text>
        <View style={styles.badgeRow}>
          <Badge label="Licensed Veterinarian" variant="primary" />
        </View>
      </Card>

      {/* Clinical Details Card */}
      <Card style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Clinical Practice Details</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              if (editing) loadProfile();
              setEditing(!editing);
            }}
          >
            <Text style={styles.editBtnText}>{editing ? 'Cancel' : 'Edit Practice'}</Text>
          </TouchableOpacity>
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <Input label="Specialization *" value={specialization} onChangeText={setSpecialization} />
            <Input label="Qualifications / Degree" placeholder="e.g. DVM, BVSc, MS" value={qualification} onChangeText={setQualification} />
            <Input label="Clinic / Workplace Name" value={clinicName} onChangeText={setClinicName} />
            <Input label="Clinic Street Address" value={address} onChangeText={setAddress} />
            <Input label="City" value={city} onChangeText={setCity} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input label="Latitude (GPS)" placeholder="e.g. 6.9271" value={latitude} onChangeText={setLatitude} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Longitude (GPS)" placeholder="e.g. 79.8612" value={longitude} onChangeText={setLongitude} keyboardType="numeric" />
              </View>
            </View>
            <Input
              label="Consultation Fee ($)"
              value={consultationFee}
              onChangeText={setConsultationFee}
              keyboardType="numeric"
            />
            <Input label="Contact Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Input label="Professional Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Input
              label="Types of Care / Clinical Services Provided"
              placeholder="e.g. Vaccinations, Dental Care, Internal Medicine, Surgery"
              value={typesOfCare}
              onChangeText={setTypesOfCare}
              multiline
              numberOfLines={2}
            />
            <Input
              label="Bio / Clinical Philosophy"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              style={{ marginTop: 8 }}
            />
          </View>
        ) : (
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <Stethoscope size={15} color="#2563EB" />
                <Text style={styles.detailLabel}>Specialization</Text>
              </View>
              <Text style={styles.detailVal}>{vetProfile?.specialization || 'General Care'}</Text>
            </View>

            {vetProfile?.qualification ? (
              <View style={styles.detailRow}>
                <View style={styles.detailLabelRow}>
                  <Award size={15} color="#7C3AED" />
                  <Text style={styles.detailLabel}>Qualifications</Text>
                </View>
                <Text style={styles.detailVal}>{vetProfile.qualification}</Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <Building2 size={15} color="#059669" />
                <Text style={styles.detailLabel}>Clinic / Workplace</Text>
              </View>
              <Text style={styles.detailVal}>{vetProfile?.clinicName || 'Not specified'}</Text>
            </View>

            {vetProfile?.address || vetProfile?.city ? (
              <View style={styles.detailRow}>
                <View style={styles.detailLabelRow}>
                  <Building2 size={15} color="#DC2626" />
                  <Text style={styles.detailLabel}>Clinic Address</Text>
                </View>
                <Text style={styles.detailVal}>
                  {[vetProfile?.address, vetProfile?.city].filter(Boolean).join(', ')}
                </Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <DollarSign size={15} color="#D97706" />
                <Text style={styles.detailLabel}>Consultation Fee</Text>
              </View>
              <Text style={[styles.detailVal, { color: '#059669', fontWeight: '800' }]}>
                ${vetProfile?.consultationFee || 0}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <Award size={15} color="#7C3AED" />
                <Text style={styles.detailLabel}>Experience</Text>
              </View>
              <Text style={styles.detailVal}>{vetProfile?.experience || 0} Years</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <Phone size={15} color={colors.textSecondary} />
                <Text style={styles.detailLabel}>Phone</Text>
              </View>
              <Text style={styles.detailVal}>{vetProfile?.phone || user?.phone || 'None'}</Text>
            </View>

            {vetProfile?.typesOfCare ? (
              <View style={styles.detailRow}>
                <View style={styles.detailLabelRow}>
                  <Stethoscope size={15} color="#0D9488" />
                  <Text style={styles.detailLabel}>Care Provided</Text>
                </View>
                <Text style={styles.detailVal}>{vetProfile.typesOfCare}</Text>
              </View>
            ) : null}
          </View>
        )}
      </Card>

      {/* Availability Schedule Card */}
      {vetProfile?.availability && vetProfile.availability.length > 0 && (
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Regular Consulting Hours</Text>
          </View>
          <View style={styles.scheduleList}>
            {vetProfile.availability.map((slot, index) => (
              <View key={index} style={styles.slotRow}>
                <View style={styles.slotDayGroup}>
                  <Calendar size={13} color="#2563EB" />
                  <Text style={styles.slotDay}>{slot.day}</Text>
                </View>
                <View style={styles.slotTimeGroup}>
                  <Clock size={13} color={colors.textSecondary} />
                  <Text style={styles.slotTime}>{slot.startTime} - {slot.endTime}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <LogOut size={18} color="#DC2626" />
        <Text style={styles.signOutText}>Sign Out of Clinical Portal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16 },
  profileCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12, backgroundColor: colors.borderLight },
  doctorName: { fontSize: 20, fontWeight: '800', color: colors.text },
  emailText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  badgeRow: { marginTop: 10 },
  infoCard: { padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  editBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
  editForm: { marginTop: 4 },
  detailsList: { gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 13, color: colors.textSecondary },
  detailVal: { fontSize: 13, fontWeight: '600', color: colors.text },
  scheduleList: { gap: 8 },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
  slotDayGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slotDay: { fontSize: 13, fontWeight: '700', color: colors.text },
  slotTimeGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  slotTime: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  signOutText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
});

export default VetProfileScreen;
