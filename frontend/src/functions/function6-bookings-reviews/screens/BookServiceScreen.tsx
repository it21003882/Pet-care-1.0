/**
 * functions/function6-bookings-reviews/screens/BookServiceScreen.tsx
 * Owner: Function 6 — Service Bookings & Reviews
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/navigation';
import { IPet, IService } from '../../../types/models';
import petService from '../../function1-pets/services/petService';
import serviceService from '../../function5-services/services/serviceService';
import bookingService from '../services/bookingService';
import colors from '../../../constants/colors';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import Card from '../../../components/common/Card';
import PetAvatar from '../../../components/common/PetAvatar';
import { isSmallDevice } from '../../../utils/responsive';

type RouteProps = RouteProp<RootStackParamList, 'BookService'>;
type NavProp = StackNavigationProp<RootStackParamList>;

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'];

export const BookServiceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { serviceId } = route.params;

  const getTodayLocalDateStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [service, setService] = useState<IService | null>(null);
  const [pets, setPets] = useState<IPet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayLocalDateStr());
  const [time, setTime] = useState<string>('11:00 AM');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [serv, petList] = await Promise.all([
          serviceService.getServiceById(serviceId),
          petService.getMyPets(),
        ]);
        setService(serv);
        setPets(petList);
        if (petList.length > 0) setSelectedPetId(petList[0]._id);
      } catch (error) {
        Alert.alert('Error', 'Failed to load booking requirements');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [serviceId]);

  const handleBooking = async () => {
    if (!selectedPetId) {
      Alert.alert('Missing Pet', 'Please choose a pet for this service.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Missing Date', 'Please enter a booking date.');
      return;
    }
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(date.trim()) || isNaN(Date.parse(date.trim()))) {
      Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format (e.g. 2026-10-15).');
      return;
    }
    const todayStr = getTodayLocalDateStr();
    if (date.trim() < todayStr) {
      Alert.alert('Invalid Date', 'Cannot book a service for a previous date. Please select today or a future date.');
      return;
    }
    if (!time.trim()) {
      Alert.alert('Time Slot Required', 'Please select a preferred time slot.');
      return;
    }

    try {
      setSubmitting(true);
      await bookingService.createBooking({
        petId: selectedPetId,
        serviceId,
        date: date.trim(),
        time: time.trim(),
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Service booking confirmed!', [
        { text: 'View Bookings', onPress: () => navigation.navigate('MyBookings') },
      ]);
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message || 'Could not complete booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading fullScreen message="Setting up your service..." />;
  if (!service) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: isSmallDevice ? 14 : 16,
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.serviceSummary}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.servicePrice}>${service.price.toFixed(2)} • {service.duration} mins</Text>
        </Card>

        <Text style={styles.heading}>Select Pet</Text>
        {pets.length === 0 ? (
          <View style={styles.noPetBox}>
            <Text style={styles.noPetText}>You need to register a pet first.</Text>
            <Button title="+ Add Pet" size="small" onPress={() => navigation.navigate('AddPet')} />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
            {pets.map((p) => (
              <TouchableOpacity
                key={p._id}
                style={[styles.petChip, selectedPetId === p._id && styles.petChipActive]}
                onPress={() => setSelectedPetId(p._id)}
              >
                <PetAvatar
                  imageUrl={p.imageUrl}
                  image={p.image}
                  name={p.name}
                  species={p.species}
                  size={38}
                  borderRadius={19}
                  style={{ marginBottom: 6 }}
                />
                <Text
                  style={[styles.petName, selectedPetId === p._id && styles.petNameActive]}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={styles.heading}>Date & Time</Text>
        <Input label="Booking Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />

        <Text style={styles.sublabel}>Select Preferred Time</Text>
        <View style={styles.timesContainer}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.timeChip, time === slot && styles.timeChipActive]}
              onPress={() => setTime(slot)}
            >
              <Text style={[styles.timeText, time === slot && styles.timeTextActive]}>{slot}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.heading}>Special Requests / Notes</Text>
        <Input
          placeholder="Grooming style, sensitive skin, or handling notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Button
          title="Confirm Service Booking"
          onPress={handleBooking}
          loading={submitting}
          style={styles.confirmBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingVertical: 16 },
  serviceSummary: { padding: 16, marginBottom: 16 },
  serviceName: { fontSize: isSmallDevice ? 16 : 18, fontWeight: '700', color: colors.text },
  servicePrice: { fontSize: isSmallDevice ? 14 : 15, fontWeight: '700', color: colors.secondary, marginTop: 4 },
  heading: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 8 },
  sublabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  scrollRow: { flexDirection: 'row', marginBottom: 16 },
  petChip: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 10,
    minWidth: isSmallDevice ? 80 : 90,
  },
  petChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  petName: { fontSize: 13, fontWeight: '700', color: colors.text },
  petNameActive: { color: colors.primary },
  noPetBox: { padding: 16, backgroundColor: colors.surface, borderRadius: 12, alignItems: 'center' },
  noPetText: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  timesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: isSmallDevice ? 10 : 14,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeText: { fontSize: isSmallDevice ? 12 : 13, fontWeight: '600', color: colors.textSecondary },
  timeTextActive: { color: '#FFFFFF' },
  confirmBtn: { marginTop: 16 },
});

export default BookServiceScreen;
