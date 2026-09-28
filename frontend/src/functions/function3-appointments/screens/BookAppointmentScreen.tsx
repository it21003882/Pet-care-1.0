/**
 * functions/function3-appointments/screens/BookAppointmentScreen.tsx
 * Owner: Function 3 — Appointment Management
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
import { IPet, IVeterinarian } from '../../../types/models';
import petService from '../../function1-pets/services/petService';
import vetService from '../../function2-veterinarians/services/vetService';
import appointmentService from '../services/appointmentService';
import colors from '../../../constants/colors';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import PetAvatar from '../../../components/common/PetAvatar';
import { isSmallDevice } from '../../../utils/responsive';

type RouteProps = RouteProp<RootStackParamList, 'BookAppointment'>;
type NavProp = StackNavigationProp<RootStackParamList>;

const DEFAULT_TIMES = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'];

export const BookAppointmentScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const initialVetId = route.params?.vetId;
  const initialPetId = route.params?.petId;

  const getTodayLocalDateStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [pets, setPets] = useState<IPet[]>([]);
  const [vets, setVets] = useState<IVeterinarian[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>(initialPetId || '');
  const [selectedVetId, setSelectedVetId] = useState<string>(initialVetId || '');
  const [date, setDate] = useState<string>(getTodayLocalDateStr());
  const [time, setTime] = useState<string>('10:00 AM');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [petsList, vetsList] = await Promise.all([
          petService.getMyPets(),
          vetService.getVeterinarians(),
        ]);
        setPets(petsList);
        setVets(vetsList);

        if (!selectedPetId && petsList.length > 0) {
          setSelectedPetId(petsList[0]._id);
        }
        if (!selectedVetId && vetsList.length > 0) {
          setSelectedVetId(vetsList[0]._id);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };
    loadDependencies();
  }, []);

  useEffect(() => {
    if (initialVetId) setSelectedVetId(initialVetId);
    if (initialPetId) setSelectedPetId(initialPetId);
  }, [initialVetId, initialPetId]);

  const handleBook = async () => {
    if (!selectedPetId) {
      Alert.alert('Selection Required', 'Please choose a pet.');
      return;
    }
    if (!selectedVetId) {
      Alert.alert('Selection Required', 'Please select a veterinarian.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Missing Date', 'Please enter an appointment date.');
      return;
    }
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(date.trim()) || isNaN(Date.parse(date.trim()))) {
      Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format (e.g. 2026-10-15).');
      return;
    }
    const todayStr = getTodayLocalDateStr();
    if (date.trim() < todayStr) {
      Alert.alert('Invalid Date', 'Cannot book an appointment for a previous date. Please select today or a future date.');
      return;
    }
    if (!time.trim()) {
      Alert.alert('Time Slot Required', 'Please choose a preferred time slot.');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Missing Field', 'Please provide a reason for the consultation.');
      return;
    }

    try {
      setSubmitting(true);
      await appointmentService.createAppointment({
        petId: selectedPetId,
        veterinarianId: selectedVetId,
        date: date.trim(),
        time: time.trim(),
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Appointment booked successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading fullScreen message="Setting up booking..." />;

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
        <Text style={styles.sectionHeading}>1. Select Pet</Text>
        {pets.length === 0 ? (
          <View style={styles.noPetBox}>
            <Text style={styles.noPetText}>You have not added any pets yet.</Text>
            <Button
              title="+ Add a Pet"
              size="small"
              onPress={() => navigation.navigate('AddPet')}
            />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemScroll}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet._id}
                style={[
                  styles.selectCard,
                  selectedPetId === pet._id && styles.selectCardActive,
                ]}
                onPress={() => setSelectedPetId(pet._id)}
              >
                <PetAvatar
                  imageUrl={pet.imageUrl}
                  image={pet.image}
                  name={pet.name}
                  species={pet.species}
                  size={40}
                  borderRadius={20}
                />
                <Text
                  style={[styles.cardTitle, selectedPetId === pet._id && styles.cardTitleActive]}
                  numberOfLines={1}
                >
                  {pet.name}
                </Text>
                <Text style={styles.cardSub} numberOfLines={1}>{pet.species}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={styles.sectionHeading}>2. Select Veterinarian</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemScroll}>
          {vets.map((vet) => (
            <TouchableOpacity
              key={vet._id}
              style={[
                styles.selectCard,
                selectedVetId === vet._id && styles.selectCardActive,
              ]}
              onPress={() => setSelectedVetId(vet._id)}
            >
              <Text style={styles.petIcon}>👨‍⚕️</Text>
              <Text
                style={[styles.cardTitle, selectedVetId === vet._id && styles.cardTitleActive]}
                numberOfLines={1}
              >
                {vet.name}
              </Text>
              <Text style={styles.cardSub} numberOfLines={1}>{vet.specialization}</Text>
              <Text style={styles.cardPrice}>${vet.consultationFee}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionHeading}>3. Appointment Date & Time</Text>
        <Input
          label="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          placeholder="2026-10-15"
        />

        <Text style={styles.label}>Select Time Slot</Text>
        <View style={styles.timesGrid}>
          {DEFAULT_TIMES.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.timeChip, time === slot && styles.timeChipActive]}
              onPress={() => setTime(slot)}
            >
              <Text style={[styles.timeChipText, time === slot && styles.timeChipTextActive]}>
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeading}>4. Reason & Details</Text>
        <Input
          label="Reason for Visit *"
          placeholder="e.g. Annual vaccination, lethargy, skin itching"
          value={reason}
          onChangeText={setReason}
        />

        <Input
          label="Additional Notes (Optional)"
          placeholder="Specific symptoms or requests for the veterinarian"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Button
          title="Confirm Appointment"
          onPress={handleBook}
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
  sectionHeading: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 14, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  itemScroll: { flexDirection: 'row', marginBottom: 8 },
  selectCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    width: isSmallDevice ? 105 : 120,
  },
  selectCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  petIcon: { fontSize: 24, marginBottom: 4 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'center' },
  cardTitleActive: { color: colors.primary },
  cardSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  cardPrice: { fontSize: 12, fontWeight: '700', color: colors.secondary, marginTop: 4 },
  noPetBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  noPetText: { fontSize: 13, color: colors.textSecondary, marginBottom: 10 },
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: isSmallDevice ? 10 : 14,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeChipText: { fontSize: isSmallDevice ? 12 : 13, fontWeight: '600', color: colors.textSecondary },
  timeChipTextActive: { color: '#FFFFFF' },
  confirmBtn: { marginTop: 12 },
});

export default BookAppointmentScreen;
