/**
 * functions/function4-medical-records/screens/AddMedicalRecordScreen.tsx
 * Owner: Function 4 — Medical Record Management
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
import medicalRecordService from '../services/medicalRecordService';
import colors from '../../../constants/colors';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import { isSmallDevice } from '../../../utils/responsive';

type RouteProps = RouteProp<RootStackParamList, 'AddMedicalRecord'>;
type NavProp = StackNavigationProp<RootStackParamList>;

export const AddMedicalRecordScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const preselectedPetId = route.params?.petId;

  const [pets, setPets] = useState<IPet[]>([]);
  const [vets, setVets] = useState<IVeterinarian[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>(preselectedPetId || '');
  const [selectedVetId, setSelectedVetId] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().substring(0, 10));

  // Single medication form state
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');
  const [medDuration, setMedDuration] = useState('');

  // Vaccination form state
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineDue, setVaccineDue] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [petsList, vetsList] = await Promise.all([
          petService.getMyPets(),
          vetService.getVeterinarians(),
        ]);
        setPets(petsList);
        setVets(vetsList);
        if (!selectedPetId && petsList.length > 0) setSelectedPetId(petsList[0]._id);
        if (!selectedVetId && vetsList.length > 0) setSelectedVetId(vetsList[0]._id);
      } catch (e) {
        Alert.alert('Error', 'Failed to load pets or clinicians');
      } finally {
        setLoading(false);
      }
    };
    loadDependencies();
  }, []);

  const handleSubmit = async () => {
    if (!selectedPetId) {
      Alert.alert('Selection Required', 'Please select a pet.');
      return;
    }
    if (!selectedVetId) {
      Alert.alert('Selection Required', 'Please select a veterinarian.');
      return;
    }
    if (!diagnosis.trim()) {
      Alert.alert('Missing Field', 'Please enter a diagnosis.');
      return;
    }

    try {
      setSubmitting(true);
      const medications = medName.trim()
        ? [
            {
              name: medName.trim(),
              dosage: medDosage.trim() || 'Standard',
              frequency: medFrequency.trim() || 'Once daily',
              duration: medDuration.trim() || '7 days',
            },
          ]
        : [];

      const vaccination = vaccineName.trim()
        ? {
            vaccineName: vaccineName.trim(),
            dateGiven: recordDate,
            nextDueDate: vaccineDue.trim() || undefined,
          }
        : undefined;

      await medicalRecordService.createMedicalRecord({
        petId: selectedPetId,
        veterinarianId: selectedVetId,
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim() || undefined,
        notes: notes.trim() || undefined,
        recordDate,
        medications,
        vaccination,
      });

      Alert.alert('Success', 'Medical entry added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to save record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading fullScreen message="Setting up medical form..." />;

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
        <Text style={styles.sectionHeading}>1. Patient Pet</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {pets.map((p) => (
            <TouchableOpacity
              key={p._id}
              style={[styles.chip, selectedPetId === p._id && styles.chipActive]}
              onPress={() => setSelectedPetId(p._id)}
            >
              <Text style={[styles.chipText, selectedPetId === p._id && styles.chipTextActive]}>
                🐾 {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionHeading}>2. Examining Veterinarian</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {vets.map((v) => (
            <TouchableOpacity
              key={v._id}
              style={[styles.chip, selectedVetId === v._id && styles.chipActive]}
              onPress={() => setSelectedVetId(v._id)}
            >
              <Text style={[styles.chipText, selectedVetId === v._id && styles.chipTextActive]}>
                👨‍⚕️ {v.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionHeading}>3. Clinical Findings</Text>
        <Input
          label="Examination Date (YYYY-MM-DD)"
          value={recordDate}
          onChangeText={setRecordDate}
        />
        <Input
          label="Diagnosis *"
          placeholder="e.g. Mild ear infection, seasonal allergy, annual checkup"
          value={diagnosis}
          onChangeText={setDiagnosis}
        />
        <Input
          label="Treatment / Procedures"
          placeholder="e.g. Cleansed ear canal, administered antibiotic drops"
          value={treatment}
          onChangeText={setTreatment}
          multiline
          numberOfLines={2}
        />

        <Text style={styles.sectionHeading}>4. Prescribed Medication (Optional)</Text>
        <Input label="Medicine Name" placeholder="e.g. Amoxicillin" value={medName} onChangeText={setMedName} />
        <View style={styles.row}>
          <Input
            label="Dosage"
            placeholder="e.g. 50mg"
            value={medDosage}
            onChangeText={setMedDosage}
            containerStyle={styles.halfCol}
          />
          <Input
            label="Duration"
            placeholder="e.g. 7 days"
            value={medDuration}
            onChangeText={setMedDuration}
            containerStyle={styles.halfCol}
          />
        </View>

        <Text style={styles.sectionHeading}>5. Vaccination (Optional)</Text>
        <Input
          label="Vaccine Name"
          placeholder="e.g. Rabies, DHPP Core Vaccine"
          value={vaccineName}
          onChangeText={setVaccineName}
        />
        <Input
          label="Next Due Date (YYYY-MM-DD)"
          placeholder="e.g. 2027-10-15"
          value={vaccineDue}
          onChangeText={setVaccineDue}
        />

        <Input
          label="Additional Clinical Notes"
          placeholder="Follow-up instructions or observations"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Button
          title="Save Clinical Record"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingVertical: 16 },
  sectionHeading: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 14, marginBottom: 8 },
  horizontalScroll: { flexDirection: 'row', marginBottom: 12 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: isSmallDevice ? 12 : 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: colors.primary },
  row: { flexDirection: 'row', gap: 10 },
  halfCol: { flex: 1 },
  saveBtn: { marginTop: 16 },
});

export default AddMedicalRecordScreen;
