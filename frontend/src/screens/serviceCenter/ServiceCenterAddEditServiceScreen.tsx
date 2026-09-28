/**
 * screens/serviceCenter/ServiceCenterAddEditServiceScreen.tsx
 * Create / Edit Pet-Care Service Screen (strictly for Service Centers)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { ServiceCategory, IService } from '../../types/models';
import serviceService from '../../functions/function5-services/services/serviceService';
import colors from '../../constants/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { isSmallDevice } from '../../utils/responsive';

type RouteProps = RouteProp<RootStackParamList, 'ServiceCenterAddEditService'>;
type NavProp = StackNavigationProp<RootStackParamList>;

const AVAILABLE_CATEGORIES: ServiceCategory[] = [
  'Grooming',
  'Nail Polishing',
  'Bathing',
  'Nail Trimming',
  'Boarding',
  'Pet Daycare',
  'Walking',
  'Pet Spa',
  'Training',
  'Other',
];

export const ServiceCenterAddEditServiceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const serviceId = route.params?.serviceId;
  const isEditing = Boolean(serviceId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Grooming');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');
  const [availability, setAvailability] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (serviceId) {
      const loadService = async () => {
        try {
          const s = await serviceService.getServiceById(serviceId);
          setName(s.name);
          setCategory(s.category);
          setPrice(String(s.price));
          setDuration(String(s.duration || 60));
          setDescription(s.description || '');
          setAvailability(s.availability !== false);
        } catch (e: any) {
          Alert.alert('Error', e.message || 'Failed to load service details.');
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      };
      loadService();
    }
  }, [serviceId]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Service name is required';
    if (!price.trim()) errs.price = 'Price is required';
    else if (isNaN(Number(price)) || Number(price) < 0) errs.price = 'Valid price is required';
    if (duration.trim() && (isNaN(Number(duration)) || Number(duration) < 1)) {
      errs.duration = 'Duration must be at least 1 minute';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        category,
        price: parseFloat(price),
        duration: parseInt(duration, 10) || 60,
        description: description.trim() || undefined,
        availability,
      };

      if (isEditing && serviceId) {
        await serviceService.updateService(serviceId, payload);
        Alert.alert('Success', 'Pet service updated successfully.');
      } else {
        await serviceService.createService(payload);
        Alert.alert('Success', 'New pet service published to catalog.');
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Save Failed', e.message || 'Could not save service.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading service details..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom + 24, 32),
          },
        ]}
      >
        <Text style={styles.title}>{isEditing ? 'Edit Service' : 'Add New Pet Service'}</Text>
        <Text style={styles.subtitle}>
          Publish professional pet-care services directly under your Service Center
        </Text>

        <Input
          label="Service Name *"
          placeholder="e.g. Deluxe Spa & Grooming"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <Text style={styles.fieldLabel}>Category *</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {AVAILABLE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input
              label="Price ($) *"
              placeholder="45.00"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              error={errors.price}
            />
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input
              label="Duration (mins) *"
              placeholder="60"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
              error={errors.duration}
            />
          </View>
        </View>

        <Input
          label="Service Description"
          placeholder="Describe what is included in this service (e.g. organic shampoo, nail trim, brushing)..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <View style={styles.availabilityRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.availLabel}>Service Status</Text>
            <Text style={styles.availSub}>
              {availability
                ? 'Open — Customers can discover and book this service'
                : 'Closed — Temporarily unavailable for new bookings'}
            </Text>
          </View>
          <Switch
            value={availability}
            onValueChange={setAvailability}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <Button
          title={isEditing ? 'Save Service Changes' : 'Publish Pet Service'}
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  categoryScroll: { gap: 8, paddingBottom: 16 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
  },
  categoryChipActive: { backgroundColor: colors.primary },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  categoryChipTextActive: { color: '#FFFFFF' },
  row: { flexDirection: 'row' },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    marginTop: 8,
  },
  availLabel: { fontSize: 14, fontWeight: '700', color: colors.text },
  availSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2, marginRight: 8 },
  submitBtn: { marginBottom: 16 },
});

export default ServiceCenterAddEditServiceScreen;
