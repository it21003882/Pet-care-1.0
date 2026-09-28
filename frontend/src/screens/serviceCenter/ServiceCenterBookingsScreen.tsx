/**
 * screens/serviceCenter/ServiceCenterBookingsScreen.tsx
 * Service Center Bookings Management (View, Confirm, Complete, Cancel customer bookings)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarCheck2,
  Clock,
  User,
  PawPrint,
  CheckCircle,
  XCircle,
  Sparkles,
  Phone,
} from 'lucide-react-native';
import bookingService from '../../functions/function6-bookings-reviews/services/bookingService';
import { IServiceBooking, BookingStatus, IService, IUser, IPet } from '../../types/models';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import { isSmallDevice } from '../../utils/responsive';
import { makePhoneCall } from '../../utils/linking';

type FilterTab = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export const ServiceCenterBookingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<IServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleUpdateStatus = async (booking: IServiceBooking, newStatus: BookingStatus) => {
    try {
      setUpdatingId(booking._id);
      const updated = await bookingService.updateBookingStatus(booking._id, newStatus);
      setBookings((prev) => prev.map((b) => (b._id === booking._id ? updated : b)));
      Alert.alert('Status Updated', `Booking has been marked as ${newStatus}.`);
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Could not update booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const renderBookingCard = ({ item }: { item: IServiceBooking }) => {
    const service = typeof item.serviceId === 'object' && item.serviceId !== null
      ? (item.serviceId as IService)
      : null;
    const customer = typeof item.userId === 'object' && item.userId !== null
      ? (item.userId as IUser)
      : null;
    const pet = typeof item.petId === 'object' && item.petId !== null
      ? (item.petId as IPet)
      : null;

    const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const isPending = item.status === 'pending';
    const isConfirmed = item.status === 'confirmed';

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.serviceName}>{service?.name || 'Pet Service'}</Text>
            <Text style={styles.categoryText}>{service?.category || 'Service'}</Text>
          </View>
          <Badge
            label={item.status.toUpperCase()}
            variant={
              item.status === 'confirmed'
                ? 'primary'
                : item.status === 'completed'
                ? 'success'
                : item.status === 'cancelled'
                ? 'danger'
                : 'warning'
            }
          />
        </View>

        <View style={styles.detailBlock}>
          <View style={styles.detailRow}>
            <CalendarCheck2 size={14} color={colors.primary} />
            <Text style={styles.detailText}>
              {formattedDate} at {item.time}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <PawPrint size={14} color="#7C3AED" />
            <Text style={styles.detailText}>
              Pet: <Text style={styles.boldText}>{pet?.name || 'Pet'}</Text> ({pet?.species || 'Companion'})
            </Text>
          </View>

          <View style={styles.detailRow}>
            <User size={14} color="#059669" />
            <Text style={styles.detailText}>
              Customer: <Text style={styles.boldText}>{customer?.name || 'Customer'}</Text>
            </Text>
            {customer?.phone ? (
              <TouchableOpacity onPress={() => makePhoneCall(customer.phone)}>
                <Phone size={14} color="#059669" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ) : null}
          </View>

          {item.notes ? (
            <Text style={styles.notesText}>Note: "{item.notes}"</Text>
          ) : null}
        </View>

        {/* Action Controls for Service Center */}
        {(isPending || isConfirmed) && (
          <View style={styles.actionRow}>
            {isPending && (
              <TouchableOpacity
                style={[styles.statusActionBtn, styles.confirmBtn]}
                onPress={() => handleUpdateStatus(item, 'confirmed')}
                disabled={updatingId === item._id}
              >
                <CheckCircle size={15} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Confirm Visit</Text>
              </TouchableOpacity>
            )}

            {isConfirmed && (
              <TouchableOpacity
                style={[styles.statusActionBtn, styles.completeBtn]}
                onPress={() => handleUpdateStatus(item, 'completed')}
                disabled={updatingId === item._id}
              >
                <Sparkles size={15} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Complete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.statusActionBtn, styles.cancelBtn]}
              onPress={() => handleUpdateStatus(item, 'cancelled')}
              disabled={updatingId === item._id}
            >
              <XCircle size={15} color="#DC2626" />
              <Text style={styles.cancelBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top + 8, 16) },
        ]}
      >
        <Text style={styles.screenTitle}>Service Bookings</Text>
        <Text style={styles.screenSubtitle}>Manage client appointments and schedules</Text>

        <View style={styles.tabRow}>
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as FilterTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && !refreshing ? (
        <Loading fullScreen message="Loading bookings..." />
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingCard}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <CalendarCheck2 size={36} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Bookings Found</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'all'
                  ? 'No service appointments have been scheduled yet.'
                  : `No bookings currently in "${activeTab}" status.`}
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
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  screenTitle: { fontSize: isSmallDevice ? 20 : 24, fontWeight: '800', color: colors.text },
  screenSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2, marginBottom: 12 },
  tabRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
  },
  tabBtnActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16 },
  card: { marginBottom: 12, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  serviceName: { fontSize: 16, fontWeight: '700', color: colors.text },
  categoryText: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  detailBlock: { gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.borderLight },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, color: colors.textSecondary },
  boldText: { fontWeight: '700', color: colors.text },
  notesText: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  statusActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmBtn: { backgroundColor: colors.primary },
  completeBtn: { backgroundColor: '#059669' },
  cancelBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  actionBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  cancelBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '700' },
  emptyCard: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
});

export default ServiceCenterBookingsScreen;
