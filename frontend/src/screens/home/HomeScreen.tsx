/**
 * screens/home/HomeScreen.tsx
 * Premium Owner Dashboard — Warm Peach Pet-Care Theme
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { IPet, IAppointment, IService } from '../../types/models';
import petService from '../../functions/function1-pets/services/petService';
import appointmentService from '../../functions/function3-appointments/services/appointmentService';
import serviceService from '../../functions/function5-services/services/serviceService';
import colors from '../../constants/colors';
import Badge from '../../components/common/Badge';
import PetAvatar from '../../components/common/PetAvatar';
import { formatDate } from '../../utils/formatDate';
import { isSmallDevice } from '../../utils/responsive';
import {
  PawPrint, Stethoscope, CalendarPlus, FileText, Sparkles,
  BookmarkCheck, Calendar, Clock, ChevronRight, Plus, Heart, Bell,
} from 'lucide-react-native';

type NavProp = StackNavigationProp<RootStackParamList>;

const CATEGORIES = [
  { key: 'all', label: 'All', emoji: '🐾', color: colors.primary, bg: colors.primaryLight },
  { key: 'cat', label: 'Cat', emoji: '🐱', color: colors.catColor, bg: colors.catBg },
  { key: 'dog', label: 'Dog', emoji: '🐶', color: colors.dogColor, bg: colors.dogBg },
  { key: 'bird', label: 'Bird', emoji: '🐦', color: colors.birdColor, bg: colors.birdBg },
  { key: 'other', label: 'Other', emoji: '🐢', color: colors.otherColor, bg: colors.otherBg },
];

const ACTION_TILES = [
  { key: 'pets', label: 'My Pets', emoji: '🐾', color: colors.primary, bg: colors.primaryLight, nav: 'Main' as const },
  { key: 'vets', label: 'Find Vets', emoji: '🩺', color: '#5B9BD5', bg: '#EDF5FF', nav: 'Main' as const },
  { key: 'book', label: 'Book Vet', emoji: '📅', color: colors.secondary, bg: colors.secondaryLight, nav: 'BookAppointment' as const },
  { key: 'medical', label: 'Medical', emoji: '💊', color: '#E07A5F', bg: '#FDF0EC', nav: 'MedicalRecordList' as const },
  { key: 'services', label: 'Services', emoji: '✨', color: colors.accentDark, bg: colors.accentLight, nav: 'Main' as const },
  { key: 'bookings', label: 'Bookings', emoji: '📋', color: '#F4A261', bg: '#FFF6EC', nav: 'MyBookings' as const },
];

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [pets, setPets] = useState<IPet[]>([]);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const gap = 10;
  const contentPadding = 16;
  const tileWidth = Math.floor((screenWidth - contentPadding * 2 - gap * 2) / 3);

  const loadDashboard = async () => {
    try {
      const [petsData, apptsData, servicesData] = await Promise.all([
        petService.getMyPets().catch(() => []),
        appointmentService.getAppointments('confirmed').catch(() => []),
        serviceService.getServices().catch(() => []),
      ]);
      setPets(petsData);
      setAppointments(apptsData);
      setServices(servicesData.slice(0, 3));
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);
  const onRefresh = () => { setRefreshing(true); loadDashboard(); };

  const firstName = user?.name?.split(' ')[0] || 'Friend';
  const nextAppt = appointments[0] || null;

  const filteredPets = activeCategory === 'all'
    ? pets
    : pets.filter((p) => p.species?.toLowerCase() === activeCategory);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 40) }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ── Header / Hero ── */}
      <View style={[styles.headerArea, { paddingTop: Math.max(insets.top + 8, 18) }]}>
        <View style={styles.blobTR} />
        <View style={styles.blobTL} />

        {/* Top row */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Good day, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>Your pets miss you!</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Bell size={20} color={colors.navy} strokeWidth={2} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Banner Card — Promo */}
        <TouchableOpacity style={styles.promoBanner} activeOpacity={0.9}>
          <View style={styles.promoBannerLeft}>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>🎉 Offer</Text>
            </View>
            <Text style={styles.promoBannerTitle}>40% Off on Pet{'\n'}Health Checkups</Text>
            <Text style={styles.promoBannerSub}>Book before this week ends!</Text>
          </View>
          <Image
            source={require('../../../assets/hero_cat.jpg')}
            style={styles.promoCatImg}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <View style={[styles.content, { paddingHorizontal: contentPadding }]}>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryChip,
                  { backgroundColor: isActive ? cat.color : cat.bg, borderColor: cat.color },
                  isActive && { shadowColor: cat.color, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
                ]}
                onPress={() => setActiveCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={[styles.categoryLabel, { color: isActive ? '#FFFFFF' : cat.color }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Next Appointment Banner */}
        {nextAppt && (
          <TouchableOpacity
            style={styles.apptBanner}
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: nextAppt._id })}
            activeOpacity={0.86}
          >
            <View style={styles.apptBannerIconBox}>
              <Stethoscope size={18} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View style={styles.apptBannerText}>
              <Text style={styles.apptBannerLabel}>Upcoming Vet Visit</Text>
              <Text style={styles.apptBannerPet}>
                {typeof nextAppt.petId === 'object' ? nextAppt.petId.name : 'Your Pet'} · {nextAppt.time}
              </Text>
              <Text style={styles.apptBannerDate}>{formatDate(nextAppt.date)}</Text>
            </View>
            <Badge label="Confirmed" variant="success" dot />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
        </View>
        <View style={styles.tilesGrid}>
          {ACTION_TILES.map(({ key, label, emoji, color, bg, nav }) => (
            <TouchableOpacity
              key={key}
              style={[styles.tile, { width: tileWidth }]}
              onPress={() => navigation.navigate(nav as any, {} as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.tileIconBox, { backgroundColor: bg }]}>
                <Text style={styles.tileEmoji}>{emoji}</Text>
              </View>
              <Text style={styles.tileLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* My Pets */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>
            My Companions {filteredPets.length > 0 ? `(${filteredPets.length})` : ''}
          </Text>
          <TouchableOpacity style={styles.addPetBtn} onPress={() => navigation.navigate('AddPet' as any)}>
            <Plus size={14} color={colors.primary} strokeWidth={2.5} />
            <Text style={styles.addPetText}>Add</Text>
          </TouchableOpacity>
        </View>

        {filteredPets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyTitle}>
              {activeCategory === 'all' ? 'No pets registered yet' : `No ${activeCategory}s found`}
            </Text>
            <Text style={styles.emptyDesc}>Tap "Add" above to create your first companion profile.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsRow}>
            {filteredPets.map((pet) => (
              <TouchableOpacity
                key={pet._id}
                style={styles.petCard}
                onPress={() => navigation.navigate('PetDetail', { petId: pet._id })}
                activeOpacity={0.85}
              >
                <PetAvatar imageUrl={pet.imageUrl} image={pet.image} name={pet.name} species={pet.species} size={60} borderRadius={18} />
                <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
                <View style={[styles.petSpeciesChip, {
                  backgroundColor: pet.species?.toLowerCase() === 'cat' ? colors.catBg
                    : pet.species?.toLowerCase() === 'dog' ? colors.dogBg
                    : colors.primaryLight
                }]}>
                  <Text style={[styles.petSpeciesText, {
                    color: pet.species?.toLowerCase() === 'cat' ? colors.catColor
                      : pet.species?.toLowerCase() === 'dog' ? colors.dogColor
                      : colors.primary
                  }]}>{pet.species}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Popular Services */}
        {services.length > 0 && (
          <>
            <View style={[styles.sectionRow, { marginTop: 8 }]}>
              <Text style={styles.sectionTitle}>Popular Services</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Main' as any)}>
                <Text style={styles.seeAllLink}>See All →</Text>
              </TouchableOpacity>
            </View>
            {services.map((service) => (
              <TouchableOpacity
                key={service._id}
                style={styles.serviceRow}
                onPress={() => navigation.navigate('ServiceDetail', { serviceId: service._id })}
                activeOpacity={0.85}
              >
                <View style={styles.serviceRowLeft}>
                  <View style={styles.serviceIconBox}>
                    <Text style={{ fontSize: 20 }}>✨</Text>
                  </View>
                  <View>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceMeta}>{service.category} · {service.duration} min</Text>
                  </View>
                </View>
                <View style={styles.serviceRowRight}>
                  <Text style={styles.servicePrice}>${service.price}</Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ── Header / Hero ──
  headerArea: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  blobTR: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#FFD9C4', opacity: 0.55, top: -50, right: -50,
  },
  blobTL: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: '#C9F0DF', opacity: 0.4, top: 60, left: -40,
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, zIndex: 5 },
  greeting: { fontSize: isSmallDevice ? 20 : 22, fontWeight: '800', color: colors.navy, letterSpacing: -0.4 },
  subGreeting: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  notifBtn: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.09, shadowRadius: 8, elevation: 3,
  },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, borderWidth: 1.5, borderColor: colors.surface },

  // Promo Banner
  promoBanner: {
    backgroundColor: '#FFF3E6',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFD9B0',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
    zIndex: 5,
  },
  promoBannerLeft: { flex: 1 },
  promoBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.primary,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8,
  },
  promoBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  promoBannerTitle: { fontSize: 18, fontWeight: '900', color: colors.navy, lineHeight: 24, letterSpacing: -0.3, marginBottom: 6 },
  promoBannerSub: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  promoCatImg: {
    width: 100, height: 100, borderRadius: 18,
    marginLeft: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)',
  },

  // ── Content ──
  content: { paddingTop: 4 },

  // Categories
  categoriesRow: { marginBottom: 16 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
    marginRight: 8, borderWidth: 1.5,
    shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0,
  },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontSize: 13, fontWeight: '700' },

  // Appointment Banner
  apptBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: 18, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.secondary,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  apptBannerIconBox: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  apptBannerText: { flex: 1 },
  apptBannerLabel: { fontSize: 10, fontWeight: '800', color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  apptBannerPet: { fontSize: 14, fontWeight: '800', color: colors.navy, letterSpacing: -0.2 },
  apptBannerDate: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

  // Section Headers
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.navy, letterSpacing: -0.3, marginBottom: 12 },
  addPetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: `${colors.primary}30`,
  },
  addPetText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  seeAllLink: { fontSize: 13, fontWeight: '700', color: colors.primary },

  // Quick-access tiles
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  tile: {
    backgroundColor: colors.surface, borderRadius: 18, paddingVertical: 14,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  tileIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tileEmoji: { fontSize: 22 },
  tileLabel: { fontSize: 12, fontWeight: '700', color: colors.navy, textAlign: 'center' },

  // Pets horizontal scroll
  petsRow: { marginBottom: 18 },
  petCard: {
    width: 110, backgroundColor: colors.surface, borderRadius: 20, padding: 12,
    alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3, gap: 6,
  },
  petName: { fontSize: 13, fontWeight: '800', color: colors.navy, textAlign: 'center', letterSpacing: -0.1 },
  petSpeciesChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  petSpeciesText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  // Empty state
  emptyCard: {
    alignItems: 'center', paddingVertical: 28, backgroundColor: colors.surface,
    borderRadius: 20, borderWidth: 1, borderColor: colors.borderLight, marginBottom: 18, gap: 8,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: colors.navy },
  emptyDesc: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 24, lineHeight: 18 },

  // Services
  serviceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  serviceRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  serviceIconBox: {
    width: 40, height: 40, borderRadius: 13, backgroundColor: colors.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  serviceName: { fontSize: 14, fontWeight: '700', color: colors.navy, letterSpacing: -0.1 },
  serviceMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontWeight: '500' },
  serviceRowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  servicePrice: { fontSize: 16, fontWeight: '900', color: colors.primary, letterSpacing: -0.3 },
});

export default HomeScreen;
