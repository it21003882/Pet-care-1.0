/**
 * functions/function6-bookings-reviews/screens/MyBookingsScreen.tsx
 * Owner: Function 6 — Service Bookings & Reviews
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
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/navigation';
import { IServiceBooking, BookingStatus } from '../../../types/models';
import bookingService from '../services/bookingService';
import colors from '../../../constants/colors';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import Badge from '../../../components/common/Badge';
import { formatDate } from '../../../utils/formatDate';

type NavProp = StackNavigationProp<RootStackParamList>;

export const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [bookings, setBookings] = useState<IServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | BookingStatus>('all');

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this service reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingService.cancelBooking(bookingId);
              fetchBookings();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel');
            }
          },
        },
      ]
    );
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'all') return true;
    return b.status === activeFilter;
  });

  const getBadgeVariant = (status: BookingStatus) => {
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

  const renderBookingCard = ({ item }: { item: IServiceBooking }) => {
    const pet = typeof item.petId === 'object' ? item.petId : null;
    const service = typeof item.serviceId === 'object' ? item.serviceId : null;

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.serviceName}>{service ? service.name : 'Pet Service'}</Text>
            <Text style={styles.petName}>🐾 For {pet ? pet.name : 'Pet'}</Text>
          </View>
          <Badge label={item.status} variant={getBadgeVariant(item.status)} />
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.dateText}>📅 {formatDate(item.date)}</Text>
          <Text style={styles.timeText}>⏰ {item.time}</Text>
        </View>

        {item.notes ? (
          <Text style={styles.notes} numberOfLines={2}>
            Notes: {item.notes}
          </Text>
        ) : null}

        <View style={styles.actionRow}>
          {item.status === 'completed' && service ? (
            <Button
              title="Leave Review"
              size="small"
              variant="outline"
              onPress={() => navigation.navigate('AddReview', { serviceId: service._id, title: service.name })}
            />
          ) : null}

          {item.status === 'pending' || item.status === 'confirmed' ? (
            <Button
              title="Cancel"
              size="small"
              variant="danger"
              onPress={() => handleCancelBooking(item._id)}
            />
          ) : null}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>Track your upcoming grooming and pet care sessions</Text>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <Loading fullScreen message="Loading bookings..." />
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Bookings Found</Text>
              <Text style={styles.emptySubtitle}>You have no service sessions in this category.</Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
  },
  filterChipActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16 },
  card: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceName: { fontSize: 16, fontWeight: '700', color: colors.text },
  petName: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  timeRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  dateText: { fontSize: 13, fontWeight: '600', color: colors.text },
  timeText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  notes: { fontSize: 12, color: colors.textSecondary, marginTop: 8, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary },
});

export default MyBookingsScreen;
