/**
 * functions/function2-veterinarians/screens/VetListScreen.tsx
 * Owner: Function 2 — Veterinarian Management
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
import { IVeterinarian } from '../../../types/models';
import vetService from '../services/vetService';
import colors from '../../../constants/colors';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import Badge from '../../../components/common/Badge';
import { isSmallDevice } from '../../../utils/responsive';

type NavProp = StackNavigationProp<RootStackParamList>;

const SPECIALIZATIONS = ['All', 'General Practice', 'Surgery', 'Dermatology', 'Dentistry', 'Cardiology'];

export const VetListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const [vets, setVets] = useState<IVeterinarian[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedSpec, setSelectedSpec] = useState<string>('All');

  const fetchVets = useCallback(async () => {
    try {
      const params: { search?: string; specialization?: string } = {};
      if (search.trim()) params.search = search.trim();
      if (selectedSpec !== 'All') params.specialization = selectedSpec;
      const data = await vetService.getVeterinarians(params);
      setVets(data);
    } catch (error) {
      console.error('Failed to load vets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedSpec]);

  useEffect(() => {
    fetchVets();
  }, [fetchVets]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVets();
  };

  const renderVetItem = ({ item }: { item: IVeterinarian }) => (
    <Card
      onPress={() => navigation.navigate('VetDetail', { vetId: item._id })}
      style={styles.vetCard}
    >
      <Image
        source={
          item.profileImage
            ? { uri: item.profileImage }
            : { uri: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300' }
        }
        style={styles.vetImage}
      />
      <View style={styles.vetInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.vetName} numberOfLines={1}>{item.name}</Text>
          <Badge label={`${item.experience} yrs`} variant="neutral" />
        </View>
        <Text style={styles.specialization} numberOfLines={1}>{item.specialization}</Text>
        <Text style={styles.clinicName} numberOfLines={1}>🏥 {item.clinicName}</Text>
        <Text style={styles.location} numberOfLines={1}>📍 {item.location}</Text>

        <View style={styles.footerRow}>
          <Text style={styles.fee}>${item.consultationFee} <Text style={styles.feeLabel}>/ visit</Text></Text>
          <Button
            title="Book"
            size="small"
            onPress={() => navigation.navigate('BookAppointment', { vetId: item._id })}
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
        <Text style={styles.headerTitle}>Find Veterinarians</Text>
        <Text style={styles.headerSubtitle}>Book certified vets for examinations & consultations</Text>
        <Input
          placeholder="Search by doctor or clinic name..."
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchContainer}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {SPECIALIZATIONS.map((spec) => (
            <TouchableOpacity
              key={spec}
              style={[
                styles.chip,
                selectedSpec === spec && styles.chipActive,
              ]}
              onPress={() => setSelectedSpec(spec)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedSpec === spec && styles.chipTextActive,
                ]}
              >
                {spec}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <Loading fullScreen message="Finding specialists..." />
      ) : (
        <FlatList
          data={vets}
          keyExtractor={(item) => item._id}
          renderItem={renderVetItem}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingHorizontal: horizontalPad,
              paddingBottom: Math.max(insets.bottom + 20, 32),
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Veterinarians Found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search criteria or specialization.</Text>
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
  headerTitle: { fontSize: isSmallDevice ? 22 : 24, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: isSmallDevice ? 12 : 13, color: colors.textSecondary, marginTop: 2, marginBottom: 12 },
  searchContainer: { marginBottom: 10 },
  chipsScroll: { paddingBottom: 12, gap: 8 },
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
  vetCard: { flexDirection: 'row', padding: isSmallDevice ? 10 : 14, marginBottom: 10 },
  vetImage: {
    width: isSmallDevice ? 72 : 84,
    height: isSmallDevice ? 72 : 84,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
  },
  vetInfo: { flex: 1, marginLeft: isSmallDevice ? 10 : 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  vetName: { fontSize: isSmallDevice ? 15 : 16, fontWeight: '700', color: colors.text, flexShrink: 1 },
  specialization: { fontSize: 13, fontWeight: '600', color: colors.primary, marginTop: 2 },
  clinicName: { fontSize: 12, color: colors.text, marginTop: 4 },
  location: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  fee: { fontSize: 15, fontWeight: '700', color: colors.text },
  feeLabel: { fontSize: 12, fontWeight: '400', color: colors.textSecondary },
  bookBtn: { minWidth: isSmallDevice ? 72 : 80 },
  emptyContainer: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
});

export default VetListScreen;
