/**
 * functions/function2-veterinarians/screens/VetDetailScreen.tsx
 * Owner: Function 2 — Veterinarian Management
 * Displays doctor details, qualifications, clinic location, contact actions,
 * and Google Maps directions.
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Navigation,
  Stethoscope,
  Clock,
  Award,
} from 'lucide-react-native';
import { RootStackParamList } from '../../../types/navigation';
import { IVeterinarian } from '../../../types/models';
import vetService from '../services/vetService';
import colors from '../../../constants/colors';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import Badge from '../../../components/common/Badge';
import { openGoogleMapsDirections, makePhoneCall } from '../../../utils/linking';

type RouteProps = RouteProp<RootStackParamList, 'VetDetail'>;
type NavProp = StackNavigationProp<RootStackParamList>;

export const VetDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { vetId } = route.params;

  const [vet, setVet] = useState<IVeterinarian | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVet = async () => {
      try {
        const data = await vetService.getVeterinarianById(vetId);
        setVet(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load veterinarian profile.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchVet();
  }, [vetId]);

  if (loading) return <Loading fullScreen message="Loading doctor profile..." />;
  if (!vet) return null;

  const fullAddress = vet.address
    ? `${vet.address}${vet.city ? `, ${vet.city}` : ''}`
    : vet.location || null;

  const handleDirections = () => {
    openGoogleMapsDirections({
      latitude: vet.latitude,
      longitude: vet.longitude,
      address: fullAddress,
      name: vet.clinicName || vet.name,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <Image
          source={
            vet.profileImage
              ? { uri: vet.profileImage }
              : { uri: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400' }
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{vet.name}</Text>
        <Text style={styles.spec}>{vet.specialization}</Text>
        {vet.qualification ? <Text style={styles.qual}>{vet.qualification}</Text> : null}

        <View style={styles.badgeRow}>
          <Badge label={`${vet.experience} Years Experience`} variant="primary" />
          <Badge label={`Consultation: $${vet.consultationFee}`} variant="success" />
        </View>
      </Card>

      {/* Clinic & Location Details Card */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Practice & Clinic Location</Text>

        <View style={styles.clinicDetailsList}>
          {vet.clinicName ? (
            <View style={styles.contactRow}>
              <Building2 size={16} color={colors.primary} />
              <Text style={styles.contactVal}>{vet.clinicName}</Text>
            </View>
          ) : null}

          {fullAddress ? (
            <View style={styles.contactRow}>
              <MapPin size={16} color="#DC2626" />
              <Text style={styles.contactVal}>{fullAddress}</Text>
            </View>
          ) : null}

          {vet.phone ? (
            <TouchableOpacity style={styles.contactRow} onPress={() => makePhoneCall(vet.phone)}>
              <Phone size={16} color="#059669" />
              <Text style={[styles.contactVal, { color: '#059669', fontWeight: '700' }]}>
                {vet.phone}
              </Text>
              <Text style={styles.tapAction}>Tap to Call →</Text>
            </TouchableOpacity>
          ) : null}

          {vet.email ? (
            <View style={styles.contactRow}>
              <Mail size={16} color={colors.textSecondary} />
              <Text style={styles.contactVal}>{vet.email}</Text>
            </View>
          ) : null}
        </View>

        {/* Google Maps Directions Action Button */}
        <TouchableOpacity style={styles.directionsBtn} onPress={handleDirections}>
          <Navigation size={18} color="#FFFFFF" />
          <Text style={styles.directionsBtnText}>Get Directions / View on Map</Text>
        </TouchableOpacity>
      </Card>

      {/* Types of Veterinary Care */}
      {vet.typesOfCare ? (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Veterinary Care & Services Provided</Text>
          <Text style={styles.desc}>{vet.typesOfCare}</Text>
        </Card>
      ) : null}

      {/* About */}
      {vet.description ? (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About the Practitioner</Text>
          <Text style={styles.desc}>{vet.description}</Text>
        </Card>
      ) : null}

      {/* Schedule */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Available Consulting Schedule</Text>
        {vet.availability && vet.availability.length > 0 ? (
          vet.availability.map((slot, index) => (
            <View key={index} style={styles.slotRow}>
              <Text style={styles.slotDay}>{slot.day}</Text>
              <Text style={styles.slotTime}>
                {slot.startTime} - {slot.endTime}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSlot}>Please contact clinic directly for scheduling inquiries.</Text>
        )}
      </Card>

      <View style={styles.actionContainer}>
        <Button
          title="Book Consultation"
          onPress={() => navigation.navigate('BookAppointment', { vetId: vet._id })}
          style={styles.bookBtn}
        />
        <Button
          title="Leave Review"
          variant="outline"
          onPress={() => navigation.navigate('AddReview', { vetId: vet._id, title: vet.name })}
          style={styles.reviewBtn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 14, backgroundColor: colors.borderLight },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  spec: { fontSize: 16, fontWeight: '600', color: colors.primary, marginTop: 4 },
  qual: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  sectionCard: { marginTop: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  clinicDetailsList: { gap: 10 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  contactVal: { fontSize: 14, color: colors.text, flex: 1 },
  tapAction: { fontSize: 12, fontWeight: '700', color: colors.primary },
  directionsBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  directionsBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  desc: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  slotDay: { fontSize: 14, fontWeight: '600', color: colors.text },
  slotTime: { fontSize: 14, color: colors.textSecondary },
  noSlot: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' },
  actionContainer: { marginTop: 20, gap: 10 },
  bookBtn: { width: '100%' },
  reviewBtn: { width: '100%' },
});

export default VetDetailScreen;
