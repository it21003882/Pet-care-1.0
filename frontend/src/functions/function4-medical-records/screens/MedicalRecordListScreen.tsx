/**
 * functions/function4-medical-records/screens/MedicalRecordListScreen.tsx
 * Owner: Function 4 — Medical Record Management
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/navigation';
import { IMedicalRecord } from '../../../types/models';
import medicalRecordService from '../services/medicalRecordService';
import colors from '../../../constants/colors';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import Badge from '../../../components/common/Badge';
import { formatDate } from '../../../utils/formatDate';
import { isSmallDevice } from '../../../utils/responsive';

type RouteProps = RouteProp<RootStackParamList, 'MedicalRecordList'>;
type NavProp = StackNavigationProp<RootStackParamList>;

export const MedicalRecordListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const petId = route.params?.petId;

  const [records, setRecords] = useState<IMedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchRecords = async () => {
    try {
      const data = await medicalRecordService.getMedicalRecords(petId ? { petId } : undefined);
      setRecords(data);
    } catch (error) {
      console.error('Failed to load medical records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [petId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const renderRecordItem = ({ item }: { item: IMedicalRecord }) => {
    const petName = typeof item.petId === 'object' ? item.petId.name : 'Pet';
    const vetName = typeof item.veterinarianId === 'object' ? item.veterinarianId.name : 'Doctor';

    return (
      <Card
        onPress={() => navigation.navigate('MedicalRecordDetail', { recordId: item._id })}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{formatDate(item.recordDate)}</Text>
          </View>
          {item.vaccination ? <Badge label="Vaccine" variant="success" /> : null}
        </View>

        <Text style={styles.diagnosis}>{item.diagnosis}</Text>
        <Text style={styles.subtext} numberOfLines={1}>Patient: {petName} • Examined by {vetName}</Text>

        {item.treatment ? (
          <Text style={styles.treatment} numberOfLines={2}>
            <Text style={styles.treatmentLabel}>Treatment: </Text>
            {item.treatment}
          </Text>
        ) : null}

        {item.medications && item.medications.length > 0 ? (
          <View style={styles.medsRow}>
            <Text style={styles.medsCount}>💊 {item.medications.length} Prescribed medication(s)</Text>
          </View>
        ) : null}
      </Card>
    );
  };

  const horizontalPad = isSmallDevice ? 14 : 16;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: horizontalPad, paddingTop: Math.max(insets.top + 8, 16) }]}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.title}>Medical Timeline</Text>
          <Text style={styles.subtitle}>Diagnostic records, prescriptions & vaccines</Text>
        </View>
        <Button
          title="+ Add"
          size="small"
          onPress={() => navigation.navigate('AddMedicalRecord', { petId })}
        />
      </View>

      {loading && !refreshing ? (
        <Loading fullScreen message="Loading medical history..." />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item._id}
          renderItem={renderRecordItem}
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
              <Text style={styles.emptyTitle}>No Medical Records</Text>
              <Text style={styles.emptySubtitle}>
                There are no medical checkups recorded for this pet.
              </Text>
              <Button
                title="Add Clinical Entry"
                onPress={() => navigation.navigate('AddMedicalRecord', { petId })}
                style={styles.emptyBtn}
              />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
  },
  title: { fontSize: isSmallDevice ? 22 : 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: isSmallDevice ? 12 : 13, color: colors.textSecondary, marginTop: 2 },
  listContent: { paddingTop: 6 },
  card: { padding: isSmallDevice ? 12 : 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateBadge: {
    backgroundColor: colors.borderLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dateText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  diagnosis: { fontSize: isSmallDevice ? 15 : 17, fontWeight: '700', color: colors.text, marginTop: 8 },
  subtext: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  treatment: { fontSize: 13, color: colors.text, marginTop: 8, lineHeight: 18 },
  treatmentLabel: { fontWeight: '600', color: colors.textSecondary },
  medsRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderLight },
  medsCount: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  emptyBtn: { minWidth: 180 },
});

export default MedicalRecordListScreen;
