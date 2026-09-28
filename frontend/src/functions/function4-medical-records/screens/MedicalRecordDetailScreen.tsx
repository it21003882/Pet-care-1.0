/**
 * functions/function4-medical-records/screens/MedicalRecordDetailScreen.tsx
 * Owner: Function 4 — Medical Record Management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/navigation';
import { IMedicalRecord } from '../../../types/models';
import medicalRecordService from '../services/medicalRecordService';
import colors from '../../../constants/colors';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import Badge from '../../../components/common/Badge';
import { formatDate } from '../../../utils/formatDate';

type RouteProps = RouteProp<RootStackParamList, 'MedicalRecordDetail'>;
type NavProp = StackNavigationProp<RootStackParamList>;

export const MedicalRecordDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { recordId } = route.params;

  const [record, setRecord] = useState<IMedicalRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const data = await medicalRecordService.getMedicalRecordById(recordId);
        setRecord(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load medical record.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [recordId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Medical Record',
      'Are you sure you want to remove this medical entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await medicalRecordService.deleteMedicalRecord(recordId);
              Alert.alert('Record Deleted', 'The medical record was removed.');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete record');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <Loading fullScreen message="Loading clinical record..." />;
  if (!record) return null;

  const pet = typeof record.petId === 'object' ? record.petId : null;
  const vet = typeof record.veterinarianId === 'object' ? record.veterinarianId : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <Text style={styles.dateLabel}>Recorded on {formatDate(record.recordDate)}</Text>
          {record.vaccination ? <Badge label="Vaccination Included" variant="success" /> : null}
        </View>
        <Text style={styles.diagnosisTitle}>{record.diagnosis}</Text>
        <Text style={styles.metaText}>
          🐾 Patient: {pet?.name || 'Pet'} • 👨‍⚕️ Clinician: {vet?.name || 'Veterinarian'}
        </Text>
      </Card>

      {record.treatment ? (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Treatment & Procedures</Text>
          <Text style={styles.bodyText}>{record.treatment}</Text>
        </Card>
      ) : null}

      {record.medications && record.medications.length > 0 ? (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Prescribed Medications</Text>
          {record.medications.map((med, index) => (
            <View key={index} style={styles.medicationItem}>
              <Text style={styles.medName}>💊 {med.name}</Text>
              <Text style={styles.medDetail}>
                Dosage: {med.dosage} • Frequency: {med.frequency} • For {med.duration}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      {record.vaccination ? (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Vaccine Details</Text>
          <Text style={styles.vaccineName}>💉 {record.vaccination.vaccineName}</Text>
          <Text style={styles.vaccineDate}>Administered: {formatDate(record.vaccination.dateGiven)}</Text>
          {record.vaccination.nextDueDate ? (
            <Text style={styles.vaccineDue}>Next Due Date: {formatDate(record.vaccination.nextDueDate)}</Text>
          ) : null}
          {record.vaccination.batchNumber ? (
            <Text style={styles.vaccineBatch}>Batch #{record.vaccination.batchNumber}</Text>
          ) : null}
        </Card>
      ) : null}

      {record.notes ? (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Clinical Observations / Notes</Text>
          <Text style={styles.bodyText}>{record.notes}</Text>
        </Card>
      ) : null}

      <Button
        title="Delete Record"
        variant="danger"
        loading={deleting}
        onPress={handleDelete}
        style={styles.deleteBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  headerCard: { padding: 18 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  diagnosisTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 8 },
  metaText: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  sectionCard: { marginTop: 12, padding: 16 },
  sectionHeading: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 10 },
  bodyText: { fontSize: 14, color: colors.text, lineHeight: 22 },
  medicationItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  medName: { fontSize: 15, fontWeight: '700', color: colors.text },
  medDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  vaccineName: { fontSize: 16, fontWeight: '700', color: colors.text },
  vaccineDate: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  vaccineDue: { fontSize: 13, fontWeight: '600', color: colors.warning, marginTop: 4 },
  vaccineBatch: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  deleteBtn: { marginTop: 24 },
});

export default MedicalRecordDetailScreen;
