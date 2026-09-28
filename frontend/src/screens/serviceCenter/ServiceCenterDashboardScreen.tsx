/**
 * screens/serviceCenter/ServiceCenterDashboardScreen.tsx
 * Premium Service Center Dashboard — Healing Teal Theme
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Scissors,
  CalendarCheck2,
  Clock,
  Sparkles,
  Building2,
  PlusCircle,
  Phone,
  Globe,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Star,
  TrendingUp,
} from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import serviceService from '../../functions/function5-services/services/serviceService';
import bookingService from '../../functions/function6-bookings-reviews/services/bookingService';
import { IService, IServiceCenter, IServiceBooking } from '../../types/models';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import { isSmallDevice } from '../../utils/responsive';
import { openGoogleMapsDirections, makePhoneCall, openWebsite } from '../../utils/linking';

type NavProp = StackNavigationProp<RootStackParamList>;

const SC_ACCENT = '#00B5A3';
const SC_LIGHT = '#E0F8F5';
const SC_DARK = '#008F80';
const SC_HEADER = '#007A6D';

export const ServiceCenterDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<IServiceCenter | null>(null);
  const [services, setServices] = useState<IService[]>([]);
  const [bookings, setBookings] = useState<IServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [centerData, servicesData, bookingsData] = await Promise.all([
        serviceService.getMyCenterProfile().catch(() => null),
        serviceService.getMyServices().catch(() => []),
        bookingService.getMyBookings().catch(() => []),
      ]);
      setProfile(centerData);
      setServices(servicesData);
      setBookings(bookingsData);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);
  const onRefresh = () => { setRefreshing(true); loadDashboardData(); };

  if (loading && !refreshing) {
    return <Loading fullScreen message="Loading Service Center portal..." />;
  }

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const businessName = profile?.name || user?.name || 'Pet-Care Center';
  const firstWord = businessName.split(' ')[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 36) }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[SC_ACCENT]} tintColor={SC_ACCENT} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Teal Hero Header ── */}
      <View style={[styles.tealHeader, { paddingTop: Math.max(insets.top + 10, 24) }]}>
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />

        <View style={styles.headerTopRow}>
          <View style={styles.centerBadge}>
            <Building2 size={13} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.centerBadgeText}>PET-CARE CENTER</Text>
          </View>
          <TouchableOpacity
            style={styles.addServiceBtn}
            onPress={() => navigation.navigate('ServiceCenterAddEditService', {})}
          >
            <PlusCircle size={15} color={SC_ACCENT} strokeWidth={2.5} />
            <Text style={styles.addServiceBtnText}>Add Service</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.welcomeLabel}>Welcome back,</Text>
        <Text style={styles.businessName} numberOfLines={1}>{businessName}</Text>

        {/* Metric Strip */}
        <View style={styles.metricStrip}>
          <View style={styles.metricStripItem}>
            <Text style={styles.metricStripVal}>{services.length}</Text>
            <Text style={styles.metricStripLabel}>Services</Text>
          </View>
          <View style={styles.metricStripDivider} />
          <View style={styles.metricStripItem}>
            <Text style={styles.metricStripVal}>{pendingBookings.length}</Text>
            <Text style={styles.metricStripLabel}>Pending</Text>
          </View>
          <View style={styles.metricStripDivider} />
          <View style={styles.metricStripItem}>
            <Text style={styles.metricStripVal}>{confirmedBookings.length}</Text>
            <Text style={styles.metricStripLabel}>Confirmed</Text>
          </View>
          <View style={styles.metricStripDivider} />
          <View style={styles.metricStripItem}>
            <Text style={styles.metricStripVal}>{completedBookings.length}</Text>
            <Text style={styles.metricStripLabel}>Done</Text>
          </View>
        </View>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>

        {/* Business Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationCardHeader}>
            <View style={styles.locationCardIcon}>
              <Building2 size={16} color={SC_ACCENT} strokeWidth={2.2} />
            </View>
            <Text style={styles.locationCardTitle}>Business Info & Contact</Text>
          </View>

          {profile?.address && (
            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => openGoogleMapsDirections({ latitude: profile?.latitude, longitude: profile?.longitude, address: profile?.address ? `${profile.address}, ${profile.city}` : undefined, name: profile?.name })}
            >
              <View style={styles.locationRowIcon}>
                <MapPin size={14} color={SC_ACCENT} strokeWidth={2} />
              </View>
              <Text style={styles.locationRowText} numberOfLines={1}>
                {profile.address}, {profile.city}
              </Text>
              <Text style={styles.locationRowAction}>Directions →</Text>
            </TouchableOpacity>
          )}

          {profile?.phone && (
            <TouchableOpacity style={styles.locationRow} onPress={() => makePhoneCall(profile.phone)}>
              <View style={styles.locationRowIcon}>
                <Phone size={14} color="#059669" strokeWidth={2} />
              </View>
              <Text style={styles.locationRowText}>{profile.phone}</Text>
              <Text style={styles.locationRowAction}>Call</Text>
            </TouchableOpacity>
          )}

          {profile?.website && (
            <TouchableOpacity style={styles.locationRow} onPress={() => openWebsite(profile.website)}>
              <View style={styles.locationRowIcon}>
                <Globe size={14} color="#2563EB" strokeWidth={2} />
              </View>
              <Text style={styles.locationRowText} numberOfLines={1}>{profile.website}</Text>
              <Text style={styles.locationRowAction}>Visit</Text>
            </TouchableOpacity>
          )}

          {!profile?.address && !profile?.phone && !profile?.website && (
            <Text style={styles.locationEmptyText}>Complete your profile to add contact details</Text>
          )}
        </View>

        {/* Stat Cards */}
        <Text style={styles.sectionHeading}>Business Overview</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'Listed Services', value: services.length, icon: Scissors, color: SC_ACCENT, bg: SC_LIGHT },
            { label: 'Pending Requests', value: pendingBookings.length, icon: Clock, color: '#D97706', bg: '#FFFBEB' },
            { label: 'Confirmed Visits', value: confirmedBookings.length, icon: CalendarCheck2, color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Completed', value: completedBookings.length, icon: CheckCircle2, color: '#059669', bg: '#ECFDF5' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <View key={label} style={[styles.statCard, { borderTopColor: color }]}>
              <View style={[styles.statIconBox, { backgroundColor: bg }]}>
                <Icon size={18} color={color} strokeWidth={2.2} />
              </View>
              <Text style={[styles.statValue, { color }]}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Bookings */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Recent Bookings</Text>
          {bookings.length > 0 && (
            <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('CenterBookingsTab' as any)}>
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={14} color={SC_ACCENT} />
            </TouchableOpacity>
          )}
        </View>

        {bookings.length === 0 ? (
          <View style={styles.emptyBlock}>
            <View style={styles.emptyIconBox}>
              <CalendarCheck2 size={28} color={colors.textMuted} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptyDesc}>When customers book your services, they will appear here.</Text>
          </View>
        ) : (
          bookings.slice(0, 4).map((booking) => {
            const serviceName = typeof booking.serviceId === 'object' && booking.serviceId !== null
              ? (booking.serviceId as IService).name
              : 'Pet Service';
            const petName = typeof booking.petId === 'object' && booking.petId !== null
              ? (booking.petId as { name?: string }).name
              : 'Pet';
            const statusVariant: any = booking.status === 'confirmed' ? 'primary' : booking.status === 'completed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'warning';
            const statusBorderColor = booking.status === 'confirmed' ? colors.primary : booking.status === 'completed' ? SC_ACCENT : booking.status === 'cancelled' ? colors.danger : colors.warning;

            return (
              <View key={booking._id} style={[styles.bookingCard, { borderLeftColor: statusBorderColor }]}>
                <View style={styles.bookingCardTop}>
                  <View style={styles.bookingCardLeft}>
                    <View style={[styles.bookingServiceIcon, { backgroundColor: SC_LIGHT }]}>
                      <Scissors size={14} color={SC_ACCENT} strokeWidth={2} />
                    </View>
                    <View style={styles.bookingCardText}>
                      <Text style={styles.bookingServiceName}>{serviceName}</Text>
                      <Text style={styles.bookingMeta}>🐾 {petName} · 🕒 {booking.time}</Text>
                    </View>
                  </View>
                  <Badge label={booking.status} variant={statusVariant} dot />
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ── Header ──
  tealHeader: {
    backgroundColor: SC_HEADER,
    paddingHorizontal: 18,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -60,
  },
  headerDecor2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  centerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  centerBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },
  addServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addServiceBtnText: { fontSize: 12, fontWeight: '700', color: SC_ACCENT },
  welcomeLabel: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500', marginBottom: 3 },
  businessName: {
    fontSize: isSmallDevice ? 22 : 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 18,
  },
  metricStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 14,
  },
  metricStripItem: { flex: 1, alignItems: 'center' },
  metricStripDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
  metricStripVal: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  metricStripLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  // ── Content ──
  content: { paddingHorizontal: 16, paddingTop: 18 },

  // ── Location Card ──
  locationCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    gap: 10,
  },
  locationCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: SC_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCardTitle: { fontSize: 14, fontWeight: '800', color: colors.navy },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  locationRowIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRowText: { flex: 1, fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  locationRowAction: { fontSize: 12, fontWeight: '700', color: SC_ACCENT },
  locationEmptyText: { fontSize: 13, color: colors.textMuted, fontWeight: '500', textAlign: 'center', paddingVertical: 8 },

  // ── Stats Grid ──
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: SC_ACCENT },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    gap: 4,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontSize: 26, fontWeight: '900', letterSpacing: -0.8 },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },

  // ── Booking Cards ──
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  bookingCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  bookingServiceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingCardText: { flex: 1 },
  bookingServiceName: { fontSize: 14, fontWeight: '800', color: colors.navy, letterSpacing: -0.1 },
  bookingMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 3, fontWeight: '500' },

  // ── Empty ──
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
    marginBottom: 12,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: colors.navy },
  emptyDesc: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 24, lineHeight: 18 },
});

export default ServiceCenterDashboardScreen;
