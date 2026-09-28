/**
 * functions/function3-appointments/screens/AppointmentDetailScreen.tsx
 * Owner: Function 3 — Appointment Management
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
import { IAppointment } from '../../../types/models';
import appointmentService from '../services/appointmentService';
import colors from '../../../constants/colors';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import Badge from '../../../components/common/Badge';
import { formatDate } from '../../../utils/formatDate';

type RouteProps = RouteProp<RootStackParamList, 'AppointmentDetail'>;
type NavProp = StackNavigationProp<RootStackParamList>;

export const AppointmentDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { appointmentId } = route.params;

  const [appointment, setAppointment] = useState<IAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const data = await appointmentService.getAppointmentById(appointmentId);
        setAppointment(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load appointment details');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this veterinary visit?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await appointmentService.updateAppointmentStatus(appointmentId, 'cancelled');
              Alert.alert('Appointment Cancelled', 'Your appointment has been cancelled.');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel appointment');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <Loading fullScreen message="Loading appointment details..." />;
  if (!appointment) return null;

  const pet = typeof appointment.petId === 'object' ? appointment.petId : null;
  const vet = typeof appointment.veterinarianId === 'object' ? appointment.veterinarianId : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.summaryCard}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Appointment Details</Text>
          <Badge
            label={appointment.status}
            variant={
              appointment.status === 'confirmed'
                ? 'success'
                : appointment.status === 'completed'
                ? 'primary'
                : appointment.status === 'cancelled'
                ? 'danger'
                : 'warning'
            }
          />
        </View>

        <View style={styles.timeBlock}>
          <Text style={styles.dateVal}>📅 {formatDate(appointment.date)}</Text>
          <Text style={styles.timeVal}>⏰ {appointment.time}</Text>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Pet Information</Text>
        <Text style={styles.primaryText}>🐾 {pet ? pet.name : 'Unknown Pet'}</Text>
        {pet?.species ? <Text style={styles.secondaryText}>{pet.species} • {pet.breed || ''}</Text> : null}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Veterinarian Information</Text>
        <Text style={styles.primaryText}>👨‍⚕️ {vet ? vet.name : 'Unknown Specialist'}</Text>
        {vet?.specialization ? <Text style={styles.secondaryText}>{vet.specialization}</Text> : null}
        {vet?.clinicName ? <Text style={styles.secondaryText}>🏥 {vet.clinicName}</Text> : null}
        {vet?.location ? <Text style={styles.secondaryText}>📍 {vet.location}</Text> : null}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Reason for Consultation</Text>
        <Text style={styles.bodyText}>{appointment.reason}</Text>
        {appointment.notes ? (
          <>
            <Text style={[styles.sectionHeading, { marginTop: 12 }]}>Owner Notes</Text>
            <Text style={styles.bodyText}>{appointment.notes}</Text>
          </>
        ) : null}
      </Card>

      {appointment.status !== 'cancelled' && appointment.status !== 'completed' ? (
        <Button
          title="Cancel Appointment"
          variant="danger"
          loading={cancelling}
          onPress={handleCancel}
          style={styles.cancelBtn}
        />
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  summaryCard: { padding: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  timeBlock: { flexDirection: 'row', gap: 20, marginTop: 16 },
  dateVal: { fontSize: 15, fontWeight: '600', color: colors.text },
  timeVal: { fontSize: 15, fontWeight: '600', color: colors.primary },
  sectionCard: { marginTop: 12, padding: 16 },
  sectionHeading: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 },
  primaryText: { fontSize: 16, fontWeight: '700', color: colors.text },
  secondaryText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  bodyText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  cancelBtn: { marginTop: 20 },
});

export default AppointmentDetailScreen;
