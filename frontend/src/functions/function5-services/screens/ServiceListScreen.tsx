/**
 * functions/function5-services/screens/ServiceListScreen.tsx
 * Owner: Function 5 — Pet Service Management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/navigation';
import { IService, ServiceCategory } from '../../../types/models';
import serviceService from '../services/serviceService';
import colors from '../../../constants/colors';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import Badge from '../../../components/common/Badge';
import { isSmallDevice } from '../../../utils/responsive';

type NavProp = StackNavigationProp<RootStackParamList>;

const CATEGORIES: Array<'All' | ServiceCategory> = [
  'All',
  'Grooming',
  'Bathing',
  'Nail Trimming',
  'Training',
  'Boarding',
  'Walking',
];

export const ServiceListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<'All' | ServiceCategory>('All');

  const fetchServices = useCallback(async () => {
    try {
      const params: { search?: string; category?: ServiceCategory } = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCat !== 'All') params.category = selectedCat;
      const data = await serviceService.getServices(params);
      setServices(data);
    } catch (e) {
      console.error('Failed to load services:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedCat]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const renderServiceCard = ({ item }: { item: IService }) => (
    <Card
      onPress={() => navigation.navigate('ServiceDetail', { serviceId: item._id })}
      style={styles.card}
    >
      <Image
        source={
          item.image
            ? { uri: item.image }
            : { uri: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400' }
        }
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
          <Badge label={item.category} variant="secondary" />
        </View>

        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.infoRow}>
          <Text style={styles.duration}>⏱ {item.duration} mins</Text>
          {item.provider ? <Text style={styles.provider} numberOfLines={1}>🏢 {item.provider}</Text> : null}
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <Button
            title="Book"
            size="small"
            onPress={() => navigation.navigate('BookService', { serviceId: item._id })}
            style={styles.bookBtn}
          />
        </View>
      </View>
    </Card>
  );

  const horizontalPad = isSmallDevice ? 14 : 16;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: horizontalPad, paddingTop: Math.max(insets.top + 8, 16) }]}>
        <View style={styles.titleBar}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.title}>Pet Services</Text>
            <Text style={styles.subtitle}>Grooming, training, wellness & boarding</Text>
          </View>
          <Button
            title="My Bookings"
            variant="outline"
            size="small"
            onPress={() => navigation.navigate('MyBookings')}
          />
        </View>

        <Input
          placeholder="Search services..."
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchBox}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCat === cat && styles.chipActive]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text style={[styles.chipText, selectedCat === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <Loading fullScreen message="Loading available services..." />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item._id}
          renderItem={renderServiceCard}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingHorizontal: horizontalPad,
              paddingBottom: Math.max(insets.bottom + 20, 32),
            },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Services Available</Text>
              <Text style={styles.emptySubtitle}>Try browsing another service category.</Text>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: isSmallDevice ? 22 : 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: isSmallDevice ? 12 : 13, color: colors.textSecondary, marginTop: 2, marginBottom: 10 },
  searchBox: { marginBottom: 10 },
  chipScroll: { paddingBottom: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  listContent: { paddingTop: 12 },
  card: { overflow: 'hidden', padding: 0, marginBottom: 12 },
  cardImage: { width: '100%', height: isSmallDevice ? 140 : 160, backgroundColor: colors.borderLight },
  cardContent: { padding: isSmallDevice ? 12 : 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: isSmallDevice ? 15 : 17, fontWeight: '700', color: colors.text, flex: 1, marginRight: 8 },
  description: { fontSize: 13, color: colors.textSecondary, marginTop: 6, lineHeight: 18 },
  infoRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
  duration: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  provider: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  price: { fontSize: isSmallDevice ? 18 : 20, fontWeight: '800', color: colors.secondary },
  bookBtn: { minWidth: isSmallDevice ? 80 : 90 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary },
});

export default ServiceListScreen;
