/**
 * screens/admin/AdminServicesScreen.tsx
 * Comprehensive Service Catalog Management for Administrators
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
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import serviceService from '../../functions/function5-services/services/serviceService';
import { IService, ServiceCategory } from '../../types/models';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import {
  Scissors,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  X,
  Sparkles,
} from 'lucide-react-native';

const CATEGORIES: ServiceCategory[] = [
  'Grooming',
  'Bathing',
  'Nail Trimming',
  'Training',
  'Boarding',
  'Walking',
  'Other',
];

export const AdminServicesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Create Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Grooming');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  const fetchServices = async () => {
    try {
      const data = await serviceService.getServices();
      setServices(data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const handleCreateService = async () => {
    if (!name.trim() || !price.trim() || !duration.trim()) {
      Alert.alert('Validation Error', 'Please enter name, price, and duration.');
      return;
    }

    try {
      setCreating(true);
      await serviceService.createService({
        name: name.trim(),
        category,
        price: parseFloat(price) || 0,
        duration: parseInt(duration, 10) || 30,
        description: description.trim() || undefined,
        availability: true,
      });
      Alert.alert('Success', 'Service created successfully.');
      setModalVisible(false);
      setName('');
      setPrice('');
      setDuration('');
      setDescription('');
      fetchServices();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create service.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteService = (service: IService) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await serviceService.deleteService(service._id);
              Alert.alert('Deleted', 'Service deleted successfully.');
              fetchServices();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete service.');
            }
          },
        },
      ]
    );
  };

  const filteredServices = services.filter((s) => {
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  const renderServiceItem = ({ item }: { item: IService }) => {
    return (
      <Card style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceHeaderLeft}>
            <Text style={styles.serviceName}>{item.name}</Text>
            <View style={styles.badgeRow}>
              <Badge label={item.category} variant="primary" />
              <View style={styles.pillMeta}>
                <Clock size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{item.duration} mins</Text>
              </View>
            </View>
          </View>
          <Text style={styles.priceTag}>${item.price}</Text>
        </View>

        {item.description ? (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.serviceActions}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteService(item)}
          >
            <Trash2 size={14} color="#DC2626" />
            <Text style={styles.deleteBtnText}>Remove Service</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 8, 16) }]}>
      {/* Top Header & Add Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Pet Care Services ({services.length})</Text>
          <Text style={styles.headerSub}>Manage offerings, pricing & descriptions</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Service</Text>
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === 'all' && styles.categoryChipActive]}
            onPress={() => setActiveCategory('all')}
          >
            <Text style={[styles.categoryChipText, activeCategory === 'all' && styles.categoryChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat && styles.categoryChipTextActive,
                  { textTransform: 'capitalize' },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Service List */}
      {loading ? (
        <Loading message="Loading service offerings..." />
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item._id}
          renderItem={renderServiceItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 24, 36) }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Sparkles size={36} color={colors.borderLight} />
              <Text style={styles.emptyTitle}>No Services Found</Text>
              <Text style={styles.emptySub}>
                {activeCategory === 'all'
                  ? 'Tap "Add Service" to create your first package.'
                  : `No services under category "${activeCategory}".`}
              </Text>
            </Card>
          }
        />
      )}

      {/* Create Service Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Service</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Service Name *"
                placeholder="e.g. Deluxe Coat Grooming"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.modalCategoryRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catPick, category === cat && styles.catPickActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.catPickText,
                        category === cat && styles.catPickTextActive,
                        { textTransform: 'capitalize' },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Price ($) *"
                placeholder="e.g. 45"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />

              <Input
                label="Duration (minutes) *"
                placeholder="e.g. 60"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />

              <Input
                label="Description"
                placeholder="Details of what this care package includes..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Button
                title="Create Service"
                onPress={handleCreateService}
                loading={creating}
                style={{ marginTop: 12 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  categoryScroll: { marginBottom: 12 },
  categoryContainer: { paddingHorizontal: 16, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  categoryChipTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16 },
  serviceCard: { padding: 14, marginBottom: 12 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceHeaderLeft: { flex: 1, paddingRight: 8 },
  serviceName: { fontSize: 16, fontWeight: '700', color: colors.text },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  pillMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  priceTag: { fontSize: 18, fontWeight: '800', color: '#059669' },
  descriptionText: { fontSize: 13, color: colors.textSecondary, marginTop: 10, lineHeight: 18 },
  serviceActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderLight },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: '#DC2626' },
  emptyCard: { padding: 32, alignItems: 'center', gap: 6, marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  modalCategoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  catPick: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  catPickActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  catPickText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  catPickTextActive: { color: '#2563EB' },
});

export default AdminServicesScreen;
