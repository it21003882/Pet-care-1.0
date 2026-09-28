/**
 * screens/veterinarian/VetAppointmentsScreen.tsx
 * Comprehensive Appointment Management for Veterinarians
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { IAppointment, AppointmentStatus } from '../../types/models';
import appointmentService from '../../functions/function3-appointments/services/appointmentService';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import PetAvatar from '../../components/common/PetAvatar';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatDate';
import {
  Calendar,
  Clock,
  Search,
  Check,
  X,
  FilePlus,
  Phone,
  Filter,
} from 'lucide-react-native';

type NavProp = StackNavigationProp<RootStackParamList>;

export const VetAppointmentsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();

  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load vet appointments:', err);
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

  const handleUpdateStatus = async (appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, status);
      Alert.alert('Success', `Appointment updated to ${status}.`);
      fetchAppointments();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update appointment.');
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (statusFilter !== 'all' && appt.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const pet = typeof appt.petId === 'object' && appt.petId ? appt.petId.name?.toLowerCase() : '';
      const owner = typeof appt.ownerId === 'object' && appt.ownerId ? appt.ownerId.name?.toLowerCase() : '';
      const reason = appt.reason?.toLowerCase() || '';
      return pet.includes(q) || owner.includes(q) || reason.includes(q);
    }

    return true;
  });

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const renderItem = ({ item }: { item: IAppointment }) => {
    const pet = typeof item.petId === 'object' && item.petId ? item.petId : null;
    const owner = typeof item.ownerId === 'object' && item.ownerId ? item.ownerId : null;

    return (
      <Card style={styles.apptCard}>
        <View style={styles.cardHeader}>
          <View style={styles.petMetaGroup}>
            <PetAvatar
              imageUrl={pet?.imageUrl}
              image={pet?.image}
              name={pet?.name}
              species={pet?.species}
              size={48}
              borderRadius={12}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.petName}>{pet?.name || 'Patient'}</Text>
              <Text style={styles.petSpecies}>{pet?.species || 'Species'}</Text>
            </View>
          </View>
          <Badge
            label={item.status.toUpperCase()}
            variant={
              item.status === 'confirmed'
                ? 'success'
                : item.status === 'pending'
                ? 'warning'
                : item.status === 'completed'
                ? 'primary'
                : 'danger'
            }
          />
        </View>

        <View style={styles.scheduleInfo}>
          <View style={styles.schedulePill}>
            <Calendar size={13} color={colors.textSecondary} />
            <Text style={styles.scheduleText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.schedulePill}>
            <Clock size={13} color={colors.textSecondary} />
            <Text style={styles.scheduleText}>{item.time}</Text>
          </View>
        </View>

        <View style={styles.detailsBox}>
          <Text style={styles.reasonText}>
            <Text style={{ fontWeight: '700', color: colors.text }}>Reason: </Text>
            {item.reason}
          </Text>
          {owner && (
            <View style={styles.ownerRow}>
              <Text style={styles.ownerText}>Owner: {owner.name}</Text>
              {owner.phone && (
                <View style={styles.phoneBadge}>
                  <Phone size={11} color="#059669" />
                  <Text style={styles.phoneText}>{owner.phone}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Doctor Action Buttons */}
        <View style={styles.actionButtonGroup}>
          {item.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
                onPress={() => handleUpdateStatus(item._id, 'confirmed')}
              >
                <Check size={14} color="#059669" />
                <Text style={[styles.btnActionText, { color: '#059669' }]}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
                onPress={() => handleUpdateStatus(item._id, 'cancelled')}
              >
                <X size={14} color="#DC2626" />
                <Text style={[styles.btnActionText, { color: '#DC2626' }]}>Decline</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'confirmed' && (
            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
              onPress={() => handleUpdateStatus(item._id, 'completed')}
            >
              <Check size={14} color="#2563EB" />
              <Text style={[styles.btnActionText, { color: '#2563EB' }]}>Complete</Text>
            </TouchableOpacity>
          )}

          {pet && (
            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}
              onPress={() => navigation.navigate('AddMedicalRecord', { petId: pet._id })}
            >
              <FilePlus size={14} color={colors.text} />
              <Text style={[styles.btnActionText, { color: colors.text }]}>Add Rx</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btnAction, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item._id })}
          >
            <Text style={[styles.btnActionText, { color: colors.textSecondary }]}>View</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 8, 16) }]}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={colors.textSecondary} />
          <TextInput
            placeholder="Search patient, owner, or reason..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterTabs}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsScroll}
          renderItem={({ item }) => {
            const active = statusFilter === item.key;
            return (
              <TouchableOpacity
                style={[styles.tabChip, active && styles.tabChipActive]}
                onPress={() => setStatusFilter(item.key)}
              >
                <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Appointment List */}
      {loading ? (
        <Loading message="Loading clinical schedule..." />
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 24, 36) }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <Card style={styles.emptyContainer}>
              <Calendar size={36} color={colors.borderLight} />
              <Text style={styles.emptyTitle}>No Appointments Found</Text>
              <Text style={styles.emptySub}>
                {statusFilter === 'all'
                  ? 'No scheduled consultations at this time.'
                  : `No appointments with status "${statusFilter}".`}
              </Text>
            </Card>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchSection: { paddingHorizontal: 16, marginBottom: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },
  tabsContainer: { marginBottom: 12 },
  tabsScroll: { paddingHorizontal: 16, gap: 8 },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  tabChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabChipTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16 },
  apptCard: { padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  petMetaGroup: { flexDirection: 'row', alignItems: 'center' },
  petName: { fontSize: 15, fontWeight: '700', color: colors.text },
  petSpecies: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  scheduleInfo: { flexDirection: 'row', gap: 10, marginTop: 10 },
  schedulePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scheduleText: { fontSize: 12, fontWeight: '600', color: colors.text },
  detailsBox: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    gap: 4,
  },
  reasonText: { fontSize: 12, color: colors.textSecondary },
  ownerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  ownerText: { fontSize: 12, fontWeight: '600', color: colors.text },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  phoneText: { fontSize: 11, fontWeight: '600', color: '#059669' },
  actionButtonGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnActionText: { fontSize: 12, fontWeight: '700' },
  emptyContainer: { padding: 32, alignItems: 'center', gap: 6, marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
});

export default VetAppointmentsScreen;
