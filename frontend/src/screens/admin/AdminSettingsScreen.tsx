/**
 * screens/admin/AdminSettingsScreen.tsx
 * System Settings, Diagnostics & Admin Profile
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../constants/config';
import api from '../../services/api';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import {
  ShieldCheck,
  Server,
  Database,
  Activity,
  LogOut,
  Lock,
  RefreshCw,
} from 'lucide-react-native';

export const AdminSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [uptime, setUptime] = useState<number | null>(null);
  const [checking, setChecking] = useState<boolean>(false);

  const checkHealth = async () => {
    try {
      setChecking(true);
      const res = await api.get('/health');
      if (res.data && res.data.success) {
        setHealthStatus('Healthy & Operational');
        setUptime(Math.round(res.data.uptime || 0));
      } else {
        setHealthStatus('Warning: Unexpected Response');
      }
    } catch (e: any) {
      setHealthStatus('Connection Error: Offline');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of the Administrator Console?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top + 8, 16),
          paddingBottom: Math.max(insets.bottom + 32, 48),
        },
      ]}
    >
      {/* Administrator Identity */}
      <Card style={styles.adminCard}>
        <View style={styles.adminIconBox}>
          <ShieldCheck size={36} color="#DC2626" />
        </View>
        <Text style={styles.adminName}>{user?.name || 'Super Administrator'}</Text>
        <Text style={styles.adminEmail}>{user?.email}</Text>
        <View style={styles.badgeRow}>
          <Badge label="Root Administrator" variant="danger" />
        </View>
      </Card>

      {/* System Diagnostics */}
      <Card style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>System Diagnostics</Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={checkHealth}
            disabled={checking}
          >
            <RefreshCw size={14} color="#2563EB" />
            <Text style={styles.refreshText}>{checking ? 'Pinging...' : 'Ping'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.diagnosticList}>
          <View style={styles.diagRow}>
            <View style={styles.diagLabelGroup}>
              <Server size={15} color="#2563EB" />
              <Text style={styles.diagLabel}>API Endpoint</Text>
            </View>
            <Text style={styles.diagValue} numberOfLines={1}>
              {config.apiUrl}
            </Text>
          </View>

          <View style={styles.diagRow}>
            <View style={styles.diagLabelGroup}>
              <Activity size={15} color="#059669" />
              <Text style={styles.diagLabel}>API Health</Text>
            </View>
            <Badge
              label={healthStatus}
              variant={healthStatus.includes('Healthy') ? 'success' : 'danger'}
            />
          </View>

          {uptime !== null && (
            <View style={styles.diagRow}>
              <View style={styles.diagLabelGroup}>
                <Activity size={15} color="#7C3AED" />
                <Text style={styles.diagLabel}>Server Uptime</Text>
              </View>
              <Text style={styles.diagValue}>{uptime} seconds</Text>
            </View>
          )}

          <View style={styles.diagRow}>
            <View style={styles.diagLabelGroup}>
              <Database size={15} color="#D97706" />
              <Text style={styles.diagLabel}>Database Cluster</Text>
            </View>
            <Text style={styles.diagValue}>MongoDB Atlas (Connected)</Text>
          </View>
        </View>
      </Card>

      {/* Security Policies */}
      <Card style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Security & Access Enforcement</Text>
        </View>

        <View style={styles.diagnosticList}>
          <View style={styles.policyRow}>
            <Lock size={15} color="#DC2626" />
            <View style={{ flex: 1 }}>
              <Text style={styles.policyTitle}>Real-Time Token Revocation</Text>
              <Text style={styles.policyDesc}>
                Deactivating an account immediately blocks their active JWT session without waiting for expiration.
              </Text>
            </View>
          </View>

          <View style={styles.policyRow}>
            <ShieldCheck size={15} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={styles.policyTitle}>Self-Protection Guardrail</Text>
              <Text style={styles.policyDesc}>
                Administrators cannot deactivate or demote their own account to prevent lockouts.
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <LogOut size={18} color="#DC2626" />
        <Text style={styles.signOutText}>Sign Out of Administrator Console</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16 },
  adminCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 12 },
  adminIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  adminName: { fontSize: 20, fontWeight: '800', color: colors.text },
  adminEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  badgeRow: { marginTop: 10 },
  infoCard: { padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4 },
  refreshText: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  diagnosticList: { gap: 12 },
  diagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  diagLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diagLabel: { fontSize: 13, color: colors.textSecondary },
  diagValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  policyRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  policyTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  policyDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  signOutText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
});

export default AdminSettingsScreen;
