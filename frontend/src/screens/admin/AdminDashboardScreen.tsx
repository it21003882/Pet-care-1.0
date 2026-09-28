/**
 * screens/admin/AdminDashboardScreen.tsx
 * Premium Executive Dashboard for Administrators — Navy/Red Theme
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import serviceService from '../../functions/function5-services/services/serviceService';
import appointmentService from '../../functions/function3-appointments/services/appointmentService';
import { IUser, IService, IAppointment } from '../../types/models';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import {
  ShieldAlert,
  Users,
  Scissors,
  Calendar,
  CheckCircle,
  XCircle,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Stethoscope,
  Lock,
  TrendingUp,
} from 'lucide-react-native';

export const AdminDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [users, setUsers] = useState<IUser[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAdminMetrics = async () => {
    try {
      const [usersData, servicesData, apptsData] = await Promise.all([
        authService.getAllUsers().catch(() => []),
        serviceService.getServices().catch(() => []),
        appointmentService.getAppointments().catch(() => []),
      ]);
      setUsers(usersData);
      setServices(servicesData);
      setAppointments(apptsData);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadAdminMetrics(); }, []));
  const onRefresh = () => { setRefreshing(true); loadAdminMetrics(); };

  const activeUsersCount = users.filter((u) => u.isActive !== false).length;
  const deactivatedUsersCount = users.filter((u) => u.isActive === false).length;
  const vetCount = users.filter((u) => u.role === 'veterinarian').length;
  const ownerCount = users.filter((u) => u.role === 'owner').length;

  const KPI_CARDS = [
    { label: 'Total Accounts', value: users.length, icon: Users, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Active Users', value: activeUsersCount, icon: CheckCircle, color: '#059669', bg: '#ECFDF5' },
    { label: 'Deactivated', value: deactivatedUsersCount, icon: XCircle, color: '#DC2626', bg: '#FEF2F2' },
    { label: 'Veterinarians', value: vetCount, icon: Stethoscope, color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Care Services', value: services.length, icon: Scissors, color: '#DB2777', bg: '#FDF2F8' },
    { label: 'Appointments', value: appointments.length, icon: Calendar, color: '#D97706', bg: '#FFFBEB' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 36) }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.adminRed]} tintColor={colors.adminRed} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Dark Authority Header ── */}
      <View style={[styles.adminHeader, { paddingTop: Math.max(insets.top + 10, 24) }]}>
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />

        <View style={styles.headerTopRow}>
          <View style={styles.adminBadgeRow}>
            <View style={styles.shieldBadge}>
              <ShieldCheck size={13} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.shieldBadgeText}>SUPER ADMIN</Text>
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>System Live</Text>
            </View>
          </View>
          <View style={styles.lockBadge}>
            <Lock size={15} color="rgba(255,255,255,0.8)" strokeWidth={2} />
          </View>
        </View>

        <Text style={styles.adminName}>{user?.name || 'Administrator'}</Text>
        <Text style={styles.adminRole}>Control Center · Operations & Security</Text>

        {/* Quick Stat Strip */}
        <View style={styles.quickStatStrip}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatVal}>{users.length}</Text>
            <Text style={styles.quickStatLabel}>Users</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatVal}>{services.length}</Text>
            <Text style={styles.quickStatLabel}>Services</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatVal}>{appointments.length}</Text>
            <Text style={styles.quickStatLabel}>Appts</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatVal}>{activeUsersCount}</Text>
            <Text style={styles.quickStatLabel}>Active</Text>
          </View>
        </View>
      </View>

      {/* ── KPI Grid ── */}
      <View style={styles.content}>
        <Text style={styles.sectionHeading}>Platform Metrics</Text>
        <View style={styles.kpiGrid}>
          {KPI_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
            <View key={label} style={[styles.kpiCard, { borderTopColor: color }]}>
              <View style={[styles.kpiIconBox, { backgroundColor: bg }]}>
                <Icon size={18} color={color} strokeWidth={2.2} />
              </View>
              <Text style={[styles.kpiNumber, { color: color }]}>{value}</Text>
              <Text style={styles.kpiLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Management Portals */}
        <Text style={styles.sectionHeading}>Management Portals</Text>
        <View style={styles.actionsList}>
          <TouchableOpacity style={styles.portalCard} onPress={() => navigation.navigate('UsersTab')} activeOpacity={0.85}>
            <View style={[styles.portalCardIcon, { backgroundColor: '#EFF6FF' }]}>
              <Users size={20} color="#2563EB" strokeWidth={2} />
            </View>
            <View style={styles.portalCardContent}>
              <Text style={styles.portalCardTitle}>User Accounts & Roles</Text>
              <Text style={styles.portalCardDesc}>
                Manage credentials, toggle activation, and assign roles ({ownerCount} owners · {vetCount} vets)
              </Text>
            </View>
            <View style={styles.portalCardChevron}>
              <ArrowUpRight size={16} color="#2563EB" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.portalCard} onPress={() => navigation.navigate('ServicesTab')} activeOpacity={0.85}>
            <View style={[styles.portalCardIcon, { backgroundColor: '#FDF2F8' }]}>
              <Scissors size={20} color="#DB2777" strokeWidth={2} />
            </View>
            <View style={styles.portalCardContent}>
              <Text style={styles.portalCardTitle}>Service Catalog</Text>
              <Text style={styles.portalCardDesc}>
                Add, update pricing, duration, and manage offerings ({services.length} active)
              </Text>
            </View>
            <View style={styles.portalCardChevron}>
              <ArrowUpRight size={16} color="#DB2777" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.portalCard} onPress={() => navigation.navigate('SettingsTab')} activeOpacity={0.85}>
            <View style={[styles.portalCardIcon, { backgroundColor: '#ECFDF5' }]}>
              <Activity size={20} color="#059669" strokeWidth={2} />
            </View>
            <View style={styles.portalCardContent}>
              <Text style={styles.portalCardTitle}>System Health & Config</Text>
              <Text style={styles.portalCardDesc}>
                MongoDB Atlas status, JWT validation, and server runtime health
              </Text>
            </View>
            <View style={styles.portalCardChevron}>
              <ArrowUpRight size={16} color="#059669" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Registrations */}
        <Text style={[styles.sectionHeading, { marginTop: 8 }]}>Recent Registrations</Text>
        <View style={styles.recentCard}>
          {users.slice(0, 5).map((u, i) => {
            const isActive = u.isActive !== false;
            return (
              <View key={u._id} style={[styles.userRow, i > 0 && styles.userRowBorder]}>
                <View style={[styles.userAvatar, { backgroundColor: isActive ? '#ECFDF5' : '#FEF2F2' }]}>
                  <Text style={styles.userAvatarText}>{u.name?.charAt(0)?.toUpperCase() || '?'}</Text>
                </View>
                <View style={styles.userRowInfo}>
                  <Text style={styles.userRowName}>{u.name}</Text>
                  <Text style={styles.userRowEmail}>{u.email} · <Text style={{ textTransform: 'capitalize' }}>{u.role}</Text></Text>
                </View>
                <Badge
                  label={isActive ? 'Active' : 'Off'}
                  variant={isActive ? 'success' : 'danger'}
                  dot
                />
              </View>
            );
          })}
          {users.length === 0 && (
            <View style={styles.emptyState}>
              <Users size={28} color={colors.textMuted} />
              <Text style={styles.emptyStateText}>No users registered yet</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ── Header ──
  adminHeader: {
    backgroundColor: colors.adminGradientStart,
    paddingHorizontal: 18,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60,
    right: -60,
  },
  headerDecor2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(220,38,38,0.12)',
    bottom: -20,
    left: 30,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  adminBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(220,38,38,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.5)',
  },
  shieldBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  lockBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  adminName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 3,
  },
  adminRole: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '500',
    marginBottom: 18,
  },
  quickStatStrip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 14,
  },
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  quickStatVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  quickStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  // ── Content ──
  content: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
    marginBottom: 12,
  },

  // ── KPI Grid ──
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  kpiCard: {
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
  kpiIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kpiNumber: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // ── Portal Cards ──
  actionsList: { gap: 10, marginBottom: 22 },
  portalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  portalCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalCardContent: { flex: 1 },
  portalCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.2,
  },
  portalCardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
    fontWeight: '500',
  },
  portalCardChevron: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Recent Users Card ──
  recentCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  userRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  userRowInfo: { flex: 1 },
  userRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
  },
  userRowEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;
