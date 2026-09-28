/**
 * screens/veterinarian/VetDashboardScreen.tsx
 * Premium Clinical Dashboard for Veterinarians — Clinical Blue Theme
 */

import React, { useState, useCallback } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { IAppointment } from '../../types/models';
import appointmentService from '../../functions/function3-appointments/services/appointmentService';
import vetService from '../../functions/function2-veterinarians/services/vetService';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import PetAvatar from '../../components/common/PetAvatar';
import { formatDate } from '../../utils/formatDate';
import {
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  FilePlus,
  Phone,
  ChevronRight,
  Star,
  Activity,
} from 'lucide-react-native';

type NavProp = StackNavigationProp<RootStackParamList>;

const VET_ACCENT = '#1558CC';
const VET_LIGHT = '#E0ECFF';

export const VetDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [specialization, setSpecialization] = useState<string>('Veterinary Specialist');
  const [clinicName, setClinicName] = useState<string>('PetCare Clinical Center');
  const [refreshing, setRefreshing] = useState(false);

  const loadVetData = async () => {
    try {
      const [appts, profile] = await Promise.all([
        appointmentService.getAppointments().catch(() => []),
        vetService.getMyProfile().catch(() => null),
      ]);
      setAppointments(appts);
      if (profile) {
        if (profile.specialization) setSpecialization(profile.specialization);
        if (profile.clinicName) setClinicName(profile.clinicName);
      }
    } catch (e) {
      console.error('Failed to load vet dashboard data:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadVetData(); }, []));
  const onRefresh = () => { setRefreshing(true); loadVetData(); };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => {
    const apptDate = new Date(a.date).toISOString().split('T')[0];
    return apptDate === todayStr;
  });
  const pendingAppts = appointments.filter((a) => a.status === 'pending');
  const completedAppts = appointments.filter((a) => a.status === 'completed');
  const uniquePatientIds = new Set(
    appointments.map((a) => (typeof a.petId === 'object' && a.petId ? a.petId._id : a.petId)).filter(Boolean)
  );

  const handleUpdateStatus = async (appointmentId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      Alert.alert('Status Updated', `Appointment marked as ${newStatus}.`);
      loadVetData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status.');
    }
  };

  const doctorName = user?.name?.startsWith('Dr.') ? user.name : `Dr. ${user?.name || 'Veterinarian'}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 36) }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[VET_ACCENT]} tintColor={VET_ACCENT} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Clinical Header ── */}
      <View style={[styles.clinicalHeader, { paddingTop: Math.max(insets.top + 10, 24) }]}>
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />

        {/* Verified Badge */}
        <View style={styles.verifiedBadge}>
          <Star size={12} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
          <Text style={styles.verifiedText}>VERIFIED PRACTITIONER</Text>
        </View>

        <Text style={styles.doctorName}>{doctorName}</Text>
        <Text style={styles.clinicInfo}>{specialization} · {clinicName}</Text>

        {/* Metric Strip */}
        <View style={styles.metricStrip}>
          <View style={styles.metricStripItem}>
            <Text style={styles.metricStripVal}>{todayAppts.length}</Text>
            <Text style={styles.metricStripLabel}>Today</Text>
          </View>
          <View style={styles.metricStripDivider} />
          <View style={styles.metricStripItem}>
            <Text style={styles.metricStripVal}>{pendingAppts.length}</Text>
            <Text style={styles.metricStripLabel}>Pending</Text>
          </View>
          <View style={styles.metricStripDivider} />
          <View style={styles.metricStripItem}>
            <Text style={styles.metricStripVal}>{completedAppts.length}</Text>
            <Text style={styles.metricStripLabel}>Done</Text>
          </View>
          <View style={styles.metricStripDivider} />
          <View style={styles.metricStripItem}>
            <Text style={styles.metricStripVal}>{uniquePatientIds.size}</Text>
            <Text style={styles.metricStripLabel}>Patients</Text>
          </View>
        </View>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>

        {/* Metric Cards */}
        <View style={styles.metricsGrid}>
          {[
            { label: "Today's Visits", value: todayAppts.length, icon: Calendar, color: VET_ACCENT, bg: VET_LIGHT },
            { label: 'Pending Reviews', value: pendingAppts.length, icon: AlertCircle, color: '#D97706', bg: '#FFFBEB' },
            { label: 'Completed', value: completedAppts.length, icon: CheckCircle2, color: '#059669', bg: '#ECFDF5' },
            { label: 'Total Patients', value: uniquePatientIds.size, icon: Users, color: '#7C3AED', bg: '#F5F3FF' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <View key={label} style={[styles.metricCard, { borderTopColor: color }]}>
              <View style={[styles.metricIconBox, { backgroundColor: bg }]}>
                <Icon size={18} color={color} strokeWidth={2.2} />
              </View>
              <Text style={[styles.metricValue, { color }]}>{value}</Text>
              <Text style={styles.metricLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Primary Action */}
        <TouchableOpacity
          style={styles.primaryActionBtn}
          onPress={() => navigation.navigate('AddMedicalRecord', {})}
          activeOpacity={0.85}
        >
          <View style={styles.primaryActionIcon}>
            <FilePlus size={20} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.primaryActionText}>Add Clinical Record / Prescription</Text>
          <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Today's Schedule */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Today's Consultations</Text>
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{todayAppts.length}</Text>
          </View>
        </View>

        {todayAppts.length === 0 ? (
          <View style={styles.emptyBlock}>
            <View style={styles.emptyIconBox}>
              <Calendar size={28} color={colors.textMuted} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No Consultations Today</Text>
            <Text style={styles.emptyDesc}>Upcoming appointments will appear here automatically.</Text>
          </View>
        ) : (
          todayAppts.map((appt) => {
            const pet = typeof appt.petId === 'object' && appt.petId ? appt.petId : null;
            const owner = typeof appt.ownerId === 'object' && appt.ownerId ? appt.ownerId : null;
            const statusColor = appt.status === 'confirmed' ? '#059669' : appt.status === 'pending' ? '#D97706' : appt.status === 'completed' ? VET_ACCENT : '#DC2626';

            return (
              <View key={appt._id} style={[styles.apptCard, { borderLeftColor: statusColor }]}>
                <View style={styles.apptTopRow}>
                  <View style={styles.petInfoGroup}>
                    <PetAvatar imageUrl={pet?.imageUrl} image={pet?.image} name={pet?.name} species={pet?.species} size={48} borderRadius={14} />
                    <View style={styles.petInfoText}>
                      <Text style={styles.petName}>{pet?.name || 'Pet Patient'}</Text>
                      <Text style={styles.petSpecies}>{pet?.species || 'Species unknown'}</Text>
                    </View>
                  </View>
                  <Badge
                    label={appt.status}
                    variant={appt.status === 'confirmed' ? 'success' : appt.status === 'pending' ? 'warning' : appt.status === 'completed' ? 'primary' : 'danger'}
                    dot
                  />
                </View>

                <View style={styles.apptMeta}>
                  <View style={styles.apptMetaItem}>
                    <Clock size={13} color={colors.textSecondary} strokeWidth={2} />
                    <Text style={styles.apptMetaText}>{appt.time}</Text>
                  </View>
                  {owner && (
                    <View style={styles.apptMetaItem}>
                      <Users size={13} color={colors.textSecondary} strokeWidth={2} />
                      <Text style={styles.apptMetaText}>{owner.name}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.apptReason} numberOfLines={2}>
                  <Text style={{ fontWeight: '700' }}>Reason: </Text>{appt.reason}
                </Text>

                {owner?.phone && (
                  <View style={styles.phoneTag}>
                    <Phone size={11} color={colors.secondary} strokeWidth={2} />
                    <Text style={styles.phoneTagText}>{owner.phone}</Text>
                  </View>
                )}

                <View style={styles.apptActionRow}>
                  {appt.status === 'pending' && (
                    <TouchableOpacity style={[styles.apptBtn, styles.apptBtnAccept]} onPress={() => handleUpdateStatus(appt._id, 'confirmed')}>
                      <Text style={styles.apptBtnAcceptText}>Accept Visit</Text>
                    </TouchableOpacity>
                  )}
                  {appt.status === 'confirmed' && (
                    <TouchableOpacity style={[styles.apptBtn, styles.apptBtnComplete]} onPress={() => handleUpdateStatus(appt._id, 'completed')}>
                      <Text style={styles.apptBtnCompleteText}>Mark Completed</Text>
                    </TouchableOpacity>
                  )}
                  {pet && (
                    <TouchableOpacity style={[styles.apptBtn, styles.apptBtnNeutral]} onPress={() => navigation.navigate('AddMedicalRecord', { petId: pet._id })}>
                      <Text style={styles.apptBtnNeutralText}>Add Rx / Notes</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.apptBtn, styles.apptBtnOutline]} onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appt._id })}>
                    <Text style={styles.apptBtnOutlineText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Pending Actions */}
        {pendingAppts.length > 0 && (
          <>
            <View style={[styles.sectionRow, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Requires Confirmation</Text>
              <View style={[styles.countChip, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.countChipText, { color: '#92400E' }]}>{pendingAppts.length}</Text>
              </View>
            </View>
            {pendingAppts.slice(0, 3).map((appt) => {
              const pet = typeof appt.petId === 'object' && appt.petId ? appt.petId : null;
              return (
                <View key={appt._id} style={styles.pendingCard}>
                  <View style={styles.pendingCardHeader}>
                    <View>
                      <Text style={styles.pendingDate}>{formatDate(appt.date)} at {appt.time}</Text>
                      <Text style={styles.pendingPet}>Patient: {pet?.name || 'Unknown Pet'}</Text>
                    </View>
                    <Badge label="Needs Review" variant="warning" dot />
                  </View>
                  <Text style={styles.pendingReason}>"{appt.reason}"</Text>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity style={styles.confirmBtn} onPress={() => handleUpdateStatus(appt._id, 'confirmed')}>
                      <Text style={styles.confirmBtnText}>Confirm Appointment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.declineBtn} onPress={() => handleUpdateStatus(appt._id, 'cancelled')}>
                      <Text style={styles.declineBtnText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const VET_ACCENT_COLOR = '#1558CC';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ── Clinical Header ──
  clinicalHeader: {
    backgroundColor: VET_ACCENT_COLOR,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -20,
    left: 40,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 14,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 3,
  },
  clinicInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
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
  content: { paddingHorizontal: 16, paddingTop: 20 },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 16,
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
  metricIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValue: { fontSize: 26, fontWeight: '900', letterSpacing: -0.8 },
  metricLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },

  // ── Primary Action ──
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: VET_ACCENT_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 16,
    gap: 12,
    marginBottom: 22,
    shadowColor: VET_ACCENT_COLOR,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  // ── Section Headers ──
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.navy, letterSpacing: -0.3 },
  countChip: {
    backgroundColor: VET_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${VET_ACCENT_COLOR}30`,
  },
  countChipText: { fontSize: 12, fontWeight: '800', color: VET_ACCENT_COLOR },

  // ── Appointment Cards ──
  apptCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 10,
  },
  apptTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  petInfoGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  petInfoText: {},
  petName: { fontSize: 15, fontWeight: '800', color: colors.navy, letterSpacing: -0.2 },
  petSpecies: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  apptMeta: { flexDirection: 'row', gap: 14 },
  apptMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  apptMetaText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  apptReason: {
    fontSize: 13,
    color: colors.text,
    backgroundColor: colors.backgroundDeep,
    borderRadius: 10,
    padding: 10,
    lineHeight: 18,
    fontWeight: '500',
  },
  phoneTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phoneTagText: { fontSize: 12, fontWeight: '700', color: colors.secondaryDark },
  apptActionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  apptBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  apptBtnAccept: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  apptBtnAcceptText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  apptBtnComplete: { backgroundColor: VET_LIGHT, borderWidth: 1, borderColor: `${VET_ACCENT_COLOR}50` },
  apptBtnCompleteText: { fontSize: 12, fontWeight: '700', color: VET_ACCENT_COLOR },
  apptBtnNeutral: { backgroundColor: colors.borderLight, borderWidth: 1, borderColor: colors.border },
  apptBtnNeutralText: { fontSize: 12, fontWeight: '700', color: colors.text },
  apptBtnOutline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  apptBtnOutlineText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },

  // ── Empty State ──
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    gap: 8,
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
  emptyDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },

  // ── Pending Cards ──
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    gap: 8,
  },
  pendingCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pendingDate: { fontSize: 13, fontWeight: '800', color: '#92400E' },
  pendingPet: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 2 },
  pendingReason: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 18 },
  pendingActions: { flexDirection: 'row', gap: 10 },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  declineBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  declineBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '700' },
});

export default VetDashboardScreen;
