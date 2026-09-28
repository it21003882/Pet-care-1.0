/**
 * screens/serviceCenter/ServiceCenterProfileScreen.tsx
 * Service Center Business Profile & Settings Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Building2,
  Phone,
  Globe,
  MapPin,
  Clock,
  Mail,
  LogOut,
  Navigation,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import serviceService from '../../functions/function5-services/services/serviceService';
import { IServiceCenter } from '../../types/models';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { openGoogleMapsDirections, makePhoneCall, openWebsite } from '../../utils/linking';

export const ServiceCenterProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<IServiceCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [openingHours, setOpeningHours] = useState('');

  const loadProfile = async () => {
    try {
      const data = await serviceService.getMyCenterProfile();
      setProfile(data);
      if (data) {
        setName(data.name || '');
        setDescription(data.description || '');
        setPhone(data.phone || '');
        setEmail(data.email || user?.email || '');
        setWebsite(data.website || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setLatitude(data.latitude != null ? String(data.latitude) : '');
        setLongitude(data.longitude != null ? String(data.longitude) : '');
        setOpeningHours(data.openingHours || 'Mon - Sat: 8:00 AM - 6:00 PM');
      }
    } catch (e: any) {
      console.error('Failed to load center profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const validate = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Business name is required.');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required.');
      return false;
    }
    if (!address.trim() || !city.trim()) {
      Alert.alert('Validation Error', 'Address and City are required for map directions.');
      return false;
    }
    if (website.trim()) {
      const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      if (!pattern.test(website.trim())) {
        Alert.alert('Validation Error', 'Please provide a valid website URL.');
        return false;
      }
    }
    if (latitude.trim() && isNaN(Number(latitude))) {
      Alert.alert('Validation Error', 'Latitude must be a valid decimal number.');
      return false;
    }
    if (longitude.trim() && isNaN(Number(longitude))) {
      Alert.alert('Validation Error', 'Longitude must be a valid decimal number.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const latNum = latitude.trim() ? parseFloat(latitude) : null;
      const lngNum = longitude.trim() ? parseFloat(longitude) : null;

      const updated = await serviceService.updateMyCenterProfile({
        name: name.trim(),
        description: description.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        address: address.trim(),
        city: city.trim(),
        latitude: latNum,
        longitude: lngNum,
        openingHours: openingHours.trim() || undefined,
      });

      setProfile(updated);
      setEditing(false);
      Alert.alert('Profile Saved', 'Your business details and location have been updated.');
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Could not save profile details.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of the Service Center Portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) {
    return <Loading fullScreen message="Loading business profile..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 8, 16),
            paddingBottom: Math.max(insets.bottom + 24, 32),
          },
        ]}
      >
        {/* Profile Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.avatarIcon}>
            <Building2 size={32} color={colors.primary} />
          </View>
          <Text style={styles.businessTitle}>{profile?.name || user?.name}</Text>
          <Text style={styles.accountEmail}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            <Badge label="🏢 Pet-Care Service Center" variant="primary" />
          </View>
        </Card>

        {/* Business Information Card */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeading}>Business Information</Text>
            <TouchableOpacity
              style={styles.editToggleBtn}
              onPress={() => {
                if (editing) loadProfile();
                setEditing(!editing);
              }}
            >
              <Text style={styles.editToggleBtnText}>{editing ? 'Cancel' : 'Edit Details'}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <View style={styles.formBlock}>
              <Input label="Business Name *" value={name} onChangeText={setName} />
              <Input
                label="Contact Phone *"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Input
                label="Business Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Website URL"
                placeholder="https://yourpetcenter.com"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
              />
              <Input label="Street Address *" value={address} onChangeText={setAddress} />
              <Input label="City *" value={city} onChangeText={setCity} />

              <View style={styles.coordsRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Input
                    label="Latitude (GPS)"
                    placeholder="e.g. 6.9271"
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Input
                    label="Longitude (GPS)"
                    placeholder="e.g. 79.8612"
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Input
                label="Opening Hours"
                placeholder="e.g. Mon - Sat: 8:00 AM - 6:00 PM"
                value={openingHours}
                onChangeText={setOpeningHours}
              />

              <Input
                label="Business Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Button
                title="Save Business Profile"
                onPress={handleSave}
                loading={saving}
                style={{ marginTop: 12 }}
              />
            </View>
          ) : (
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Building2 size={16} color={colors.primary} />
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Business Name</Text>
                  <Text style={styles.detailVal}>{profile?.name || 'Not set'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.detailRow}
                onPress={() => makePhoneCall(profile?.phone)}
              >
                <Phone size={16} color="#059669" />
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Phone (Tap to call)</Text>
                  <Text style={[styles.detailVal, { color: '#059669', fontWeight: '700' }]}>
                    {profile?.phone || 'Not set'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.detailRow}>
                <Mail size={16} color={colors.textSecondary} />
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailVal}>{profile?.email || user?.email}</Text>
                </View>
              </View>

              {profile?.website ? (
                <TouchableOpacity
                  style={styles.detailRow}
                  onPress={() => openWebsite(profile.website)}
                >
                  <Globe size={16} color="#2563EB" />
                  <View style={styles.detailTextCol}>
                    <Text style={styles.detailLabel}>Website (Tap to open)</Text>
                    <Text style={[styles.detailVal, { color: '#2563EB' }]}>
                      {profile.website}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.detailRow}
                onPress={() =>
                  openGoogleMapsDirections({
                    latitude: profile?.latitude,
                    longitude: profile?.longitude,
                    address: profile?.address ? `${profile.address}, ${profile.city}` : undefined,
                    name: profile?.name,
                  })
                }
              >
                <MapPin size={16} color="#DC2626" />
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Location (Tap for Directions)</Text>
                  <Text style={styles.detailVal}>
                    {profile?.address ? `${profile.address}, ${profile.city}` : 'Not configured'}
                  </Text>
                  {profile?.latitude != null && profile?.longitude != null ? (
                    <Text style={styles.coordsSub}>
                      GPS: {profile.latitude}, {profile.longitude}
                    </Text>
                  ) : null}
                </View>
                <Navigation size={18} color={colors.primary} />
              </TouchableOpacity>

              <View style={styles.detailRow}>
                <Clock size={16} color="#D97706" />
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Hours of Operation</Text>
                  <Text style={styles.detailVal}>{profile?.openingHours || 'Standard hours'}</Text>
                </View>
              </View>

              {profile?.description ? (
                <View style={styles.descBlock}>
                  <Text style={styles.detailLabel}>About Us</Text>
                  <Text style={styles.descBody}>{profile.description}</Text>
                </View>
              ) : null}
            </View>
          )}
        </Card>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.signOutText}>Sign Out of Service Center Portal</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16 },
  headerCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 12 },
  avatarIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  businessTitle: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  accountEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  badgeRow: { marginTop: 10 },
  infoCard: { padding: 16, marginBottom: 12 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeading: { fontSize: 16, fontWeight: '700', color: colors.text },
  editToggleBtn: { paddingVertical: 4, paddingHorizontal: 10 },
  editToggleBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  formBlock: { gap: 12 },
  coordsRow: { flexDirection: 'row' },
  detailsList: { gap: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  detailTextCol: { flex: 1 },
  detailLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  detailVal: { fontSize: 14, color: colors.text, fontWeight: '600' },
  coordsSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  descBlock: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 6,
  },
  descBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginTop: 4 },
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
    marginBottom: 20,
  },
  signOutText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
});

export default ServiceCenterProfileScreen;
