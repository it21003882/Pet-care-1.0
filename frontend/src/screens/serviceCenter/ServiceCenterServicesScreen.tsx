/**
 * screens/serviceCenter/ServiceCenterServicesScreen.tsx
 * Service Center Service Catalog Management (My Services, Edit, Delete, Toggle Availability)
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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Plus, Edit2, Trash2, Clock, DollarSign, Sparkles } from 'lucide-react-native';
import { RootStackParamList } from '../../types/navigation';
import serviceService from '../../functions/function5-services/services/serviceService';
import { IService } from '../../types/models';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { isSmallDevice } from '../../utils/responsive';

type NavProp = StackNavigationProp<RootStackParamList>;

export const ServiceCenterServicesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();

  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchMyServices = useCallback(async () => {
    try {
      const data = await serviceService.getMyServices();
      setServices(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to fetch services.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyServices();
  }, [fetchMyServices]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyServices();
  };

  const handleDeleteService = (service: IService) => {
    Alert.alert(
      'Remove Service',
      `Are you sure you want to remove "${service.name}"? Customers will no longer be able to discover or book this service.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoadingId(service._id);
              await serviceService.deleteService(service._id);
              setServices((prev) => prev.filter((s) => s._id !== service._id));
              Alert.alert('Service Removed', `"${service.name}" has been removed from your catalog.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove service.');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  const handleToggleAvailability = async (service: IService) => {
    try {
      setActionLoadingId(service._id);
      const updated = await serviceService.updateService(service._id, {
        availability: !service.availability,
      });
      setServices((prev) => prev.map((s) => (s._id === service._id ? updated : s)));
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update availability.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderServiceItem = ({ item }: { item: IService }) => (
    <Card style={styles.serviceCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.serviceTitle}>{item.name}</Text>
          <View style={styles.tagsRow}>
            <Badge label={item.category} variant="secondary" />
            <Badge
              label={item.availability ? 'Open' : 'Closed'}
              variant={item.availability ? 'success' : 'danger'}
            />
          </View>
        </View>

        <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
      </View>

      {item.description ? (
        <Text style={styles.descText} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>{item.duration} mins</Text>
        </View>
      </View>

      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => handleToggleAvailability(item)}
          disabled={actionLoadingId === item._id}
        >
          <Text style={styles.toggleBtnText}>
            {item.availability ? 'Mark Closed' : 'Mark Available'}
          </Text>
        </TouchableOpacity>

        <View style={styles.iconActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              navigation.navigate('ServiceCenterAddEditService', { serviceId: item._id })
            }
          >
            <Edit2 size={18} color="#2563EB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.deleteBtn]}
            onPress={() => handleDeleteService(item)}
            disabled={actionLoadingId === item._id}
          >
            <Trash2 size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top + 8, 16),
          },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.screenTitle}>My Pet Services</Text>
            <Text style={styles.screenSubtitle}>Manage your service offerings & pricing</Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('ServiceCenterAddEditService', {})}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Service</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <Loading fullScreen message="Loading your services..." />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item._id}
          renderItem={renderServiceItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <Card style={styles.emptyContainer}>
              <Sparkles size={40} color={colors.primary} />
              <Text style={styles.emptyTitle}>No Services Added Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your grooming, bathing, boarding, spa, or daycare packages to start taking customer bookings.
              </Text>
              <Button
                title="Create First Service"
                onPress={() => navigation.navigate('ServiceCenterAddEditService', {})}
                style={{ marginTop: 12 }}
              />
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: { fontSize: isSmallDevice ? 20 : 24, fontWeight: '800', color: colors.text },
  screenSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  addBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  listContent: { padding: 16 },
  serviceCard: { marginBottom: 12, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6 },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  priceText: { fontSize: 20, fontWeight: '800', color: colors.secondary },
  descText: { fontSize: 13, color: colors.textSecondary, marginTop: 10, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.borderLight,
  },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: colors.text },
  iconActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  deleteBtn: { backgroundColor: '#FEF2F2' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18 },
});

export default ServiceCenterServicesScreen;
