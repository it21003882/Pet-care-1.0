/**
 * functions/function3-appointments/screens/AppointmentListScreen.tsx
 * Owner: Function 3 — Appointment Management
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/navigation';
import { IAppointment, AppointmentStatus } from '../../../types/models';
import appointmentService from '../services/appointmentService';
import colors from '../../../constants/colors';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import Badge from '../../../components/common/Badge';
import { formatDate } from '../../../utils/formatDate';

type NavProp = StackNavigationProp<RootStackParamList>;

export const AppointmentListScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const filteredAppointments = appointments.filter((app) => {
    if (activeFilter === 'all') return true;
    return app.status === activeFilter;
  });

  const getBadgeVariant = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const renderAppointmentItem = ({ item }: { item: IAppointment }) => {
    const petName = typeof item.petId === 'object' ? item.petId.name : 'Pet';
    const vetName = typeof item.veterinarianId === 'object' ? item.veterinarianId.name : 'Veterinarian';
    const clinicName = typeof item.veterinarianId === 'object' ? item.veterinarianId.clinicName : '';

    return (
      <Card
        onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item._id })}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.petTitle}>🐾 {petName}</Text>
            <Text style={styles.vetSub}>with {vetName}</Text>
          </View>
          <Badge label={item.status} variant={getBadgeVariant(item.status)} />
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.dateText}>📅 {formatDate(item.date)}</Text>
          <Text style={styles.timeText}>⏰ {item.time}</Text>
        </View>

        {clinicName ? <Text style={styles.clinicText}>🏥 {clinicName}</Text> : null}
        <Text style={styles.reasonText} numberOfLines={2}>
          <Text style={styles.reasonLabel}>Reason: </Text>
          {item.reason}
        </Text>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Appointments</Text>
          <Text style={styles.subtitle}>Scheduled visits & veterinary consultations</Text>
        </View>
        <Button
          title="+ Book"
          size="small"
          onPress={() => navigation.navigate('BookAppointment', {})}
        />
      </View>

      <View style={styles.tabsContainer}>
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeFilter === tab && styles.tabActive]}
            onPress={() => setActiveFilter(tab)}
          >
            <Text style={[styles.tabText, activeFilter === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <Loading fullScreen message="Loading consultations..." />
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item._id}
          renderItem={renderAppointmentItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Appointments</Text>
              <Text style={styles.emptySubtitle}>
                You have no {activeFilter !== 'all' ? activeFilter : ''} appointments scheduled.
              </Text>
              <Button
                title="Book an Appointment"
                onPress={() => navigation.navigate('BookAppointment', {})}
                style={styles.emptyBtn}
              />
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  petTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  vetSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  detailsRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  dateText: { fontSize: 13, fontWeight: '600', color: colors.text },
  timeText: { fontSize: 13, fontWeight: '600', color: colors.text },
  clinicText: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  reasonText: { fontSize: 13, color: colors.text, marginTop: 6, lineHeight: 18 },
  reasonLabel: { fontWeight: '600', color: colors.textSecondary },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  emptyBtn: { minWidth: 180 },
});

export default AppointmentListScreen;
