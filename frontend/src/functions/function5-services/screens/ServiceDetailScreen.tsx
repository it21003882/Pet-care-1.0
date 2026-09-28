/**
 * functions/function5-services/screens/ServiceDetailScreen.tsx
 * Owner: Function 5 — Pet-Care Service Management
 * Displays service details, provider Service Center info, phone, website,
 * and Google Maps directions.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  Building2,
  Phone,
  Globe,
  MapPin,
  Clock,
  Navigation,
  Sparkles,
} from 'lucide-react-native';
import { RootStackParamList } from '../../../types/navigation';
import { IService, IServiceCenter } from '../../../types/models';
import serviceService from '../services/serviceService';
import colors from '../../../constants/colors';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import Badge from '../../../components/common/Badge';
import { openGoogleMapsDirections, makePhoneCall, openWebsite } from '../../../utils/linking';

type RouteProps = RouteProp<RootStackParamList, 'ServiceDetail'>;
type NavProp = StackNavigationProp<RootStackParamList>;

export const ServiceDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { serviceId } = route.params;

  const [service, setService] = useState<IService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await serviceService.getServiceById(serviceId);
        setService(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load service details.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  if (loading) return <Loading fullScreen message="Loading service details..." />;
  if (!service) return null;

  const center =
    typeof service.serviceCenterId === 'object' && service.serviceCenterId !== null
      ? (service.serviceCenterId as IServiceCenter)
      : null;

  const providerName = center?.name || service.provider || 'Pet-Care Service Center';
  const providerPhone = center?.phone;
  const providerWebsite = center?.website;
  const providerAddress = center?.address
    ? `${center.address}${center.city ? `, ${center.city}` : ''}`
    : null;

  const handleDirections = () => {
    openGoogleMapsDirections({
      latitude: center?.latitude,
      longitude: center?.longitude,
      address: providerAddress,
      name: providerName,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image
        source={
          service.image
            ? { uri: service.image }
            : { uri: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600' }
        }
        style={styles.heroImage}
      />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{service.name}</Text>
          <Badge label={service.category} variant="secondary" />
        </View>
        <Text style={styles.price}>${service.price.toFixed(2)}</Text>
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoVal}>⏱ {service.duration} mins</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Availability</Text>
          <Text style={[styles.infoVal, { color: service.availability ? colors.success : colors.danger }]}>
            {service.availability ? '● Open' : '● Closed'}
          </Text>
        </View>
      </Card>

      {/* Service Center Provider Information Card */}
      <Card style={styles.providerCard}>
        <View style={styles.providerHeader}>
          <Building2 size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.providerTitle}>Provided by</Text>
            <Text style={styles.providerName}>{providerName}</Text>
          </View>
          <Badge label="Service Center" variant="primary" />
        </View>

        <View style={styles.contactList}>
          {providerPhone ? (
            <TouchableOpacity style={styles.contactRow} onPress={() => makePhoneCall(providerPhone)}>
              <Phone size={16} color="#059669" />
              <Text style={[styles.contactText, { color: '#059669', fontWeight: '700' }]}>
                {providerPhone}
              </Text>
              <Text style={styles.tapAction}>Call Now →</Text>
            </TouchableOpacity>
          ) : null}

          {providerWebsite ? (
            <TouchableOpacity style={styles.contactRow} onPress={() => openWebsite(providerWebsite)}>
              <Globe size={16} color="#2563EB" />
              <Text style={[styles.contactText, { color: '#2563EB' }]} numberOfLines={1}>
                {providerWebsite}
              </Text>
              <Text style={styles.tapAction}>Visit Website →</Text>
            </TouchableOpacity>
          ) : null}

          {providerAddress ? (
            <View style={styles.addressBlock}>
              <View style={styles.contactRow}>
                <MapPin size={16} color="#DC2626" />
                <Text style={styles.contactText}>{providerAddress}</Text>
              </View>
            </View>
          ) : null}

          {center?.openingHours ? (
            <View style={styles.contactRow}>
              <Clock size={16} color="#D97706" />
              <Text style={styles.contactText}>{center.openingHours}</Text>
            </View>
          ) : null}
        </View>

        {/* Google Maps Directions Action */}
        <TouchableOpacity style={styles.directionsBtn} onPress={handleDirections}>
          <Navigation size={18} color="#FFFFFF" />
          <Text style={styles.directionsBtnText}>Get Directions / View on Map</Text>
        </TouchableOpacity>
      </Card>

      {service.description ? (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Service Description</Text>
          <Text style={styles.body}>{service.description}</Text>
        </Card>
      ) : null}

      <View style={styles.actionBlock}>
        <Button
          title="Book This Service"
          disabled={!service.availability}
          onPress={() => navigation.navigate('BookService', { serviceId: service._id })}
          style={styles.bookBtn}
        />
        <Button
          title="Write a Review"
          variant="outline"
          onPress={() => navigation.navigate('AddReview', { serviceId: service._id, title: service.name })}
          style={styles.reviewBtn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  heroImage: { width: '100%', height: 240, backgroundColor: colors.borderLight },
  header: {
    backgroundColor: colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, flex: 1, marginRight: 8 },
  price: { fontSize: 24, fontWeight: '800', color: colors.secondary, marginTop: 10 },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  infoItem: { alignItems: 'center' },
  infoLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  infoVal: { fontSize: 14, fontWeight: '700', color: colors.text },
  divider: { width: 1, height: '70%', backgroundColor: colors.border },
  providerCard: { marginHorizontal: 16, marginTop: 12, padding: 16 },
  providerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  providerTitle: { fontSize: 12, color: colors.textSecondary },
  providerName: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 1 },
  contactList: { gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.borderLight },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactText: { fontSize: 13, color: colors.text, flex: 1 },
  tapAction: { fontSize: 12, fontWeight: '700', color: colors.primary },
  addressBlock: { marginTop: 2 },
  directionsBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  directionsBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  sectionCard: { marginHorizontal: 16, marginTop: 12, padding: 16 },
  sectionHeading: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 8 },
  body: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  actionBlock: { marginHorizontal: 16, marginTop: 24, gap: 10 },
  bookBtn: { width: '100%' },
  reviewBtn: { width: '100%' },
});

export default ServiceDetailScreen;
