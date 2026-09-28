/**
 * screens/veterinarian/VetPatientsScreen.tsx
 * Patient Directory & Medical Records Access for Veterinarians
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { IAppointment } from '../../types/models';
import appointmentService from '../../functions/function3-appointments/services/appointmentService';
import colors from '../../constants/colors';
import Card from '../../components/common/Card';
import PetAvatar from '../../components/common/PetAvatar';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatDate';
import {
  Search,
  X,
  FileText,
  FilePlus,
  PawPrint,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';

type NavProp = StackNavigationProp<RootStackParamList>;

interface PatientRecord {
  petId: string;
  name: string;
  species: string;
  breed?: string;
  imageUrl?: string | null;
  image?: string | null;
  ownerName: string;
  ownerPhone?: string;
  consultationCount: number;
  lastVisitDate: string;
}

export const VetPatientsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();

  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPatients = async () => {
    try {
      const appts: IAppointment[] = await appointmentService.getAppointments();

      // Aggregate distinct patients
      const patientMap: Record<string, PatientRecord> = {};

      for (const a of appts) {
        if (!a.petId) continue;
        const petObj = typeof a.petId === 'object' ? a.petId : null;
        const petId = petObj ? petObj._id : String(a.petId);
        const ownerObj = typeof a.ownerId === 'object' ? a.ownerId : null;

        if (!patientMap[petId]) {
          patientMap[petId] = {
            petId,
            name: petObj?.name || 'Unknown Patient',
            species: petObj?.species || 'Companion',
            breed: (petObj as any)?.breed || '',
            imageUrl: petObj?.imageUrl || null,
            image: petObj?.image || null,
            ownerName: ownerObj?.name || 'Pet Owner',
            ownerPhone: ownerObj?.phone || '',
            consultationCount: 0,
            lastVisitDate: a.date,
          };
        }

        patientMap[petId].consultationCount += 1;
        if (new Date(a.date) > new Date(patientMap[petId].lastVisitDate)) {
          patientMap[petId].lastVisitDate = a.date;
        }
      }

      setPatients(Object.values(patientMap));
    } catch (err) {
      console.error('Failed to load patient records:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPatients();
  };

  const filteredPatients = patients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.species.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      (p.breed && p.breed.toLowerCase().includes(q))
    );
  });

  const renderPatientItem = ({ item }: { item: PatientRecord }) => {
    return (
      <Card style={styles.patientCard}>
        <View style={styles.cardTopRow}>
          <PetAvatar
            imageUrl={item.imageUrl}
            image={item.image}
            name={item.name}
            species={item.species}
            size={52}
            borderRadius={14}
          />
          <View style={styles.patientInfoCol}>
            <View style={styles.titleRow}>
              <Text style={styles.petName}>{item.name}</Text>
              <View style={styles.visitCountTag}>
                <Text style={styles.visitCountText}>{item.consultationCount} Visits</Text>
              </View>
            </View>
            <Text style={styles.speciesText}>
              {item.species} {item.breed ? `• ${item.breed}` : ''}
            </Text>
            <Text style={styles.ownerText}>Parent: {item.ownerName}</Text>
          </View>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.bottomRow}>
          <View style={styles.lastVisitInfo}>
            <Calendar size={13} color={colors.textSecondary} />
            <Text style={styles.lastVisitText}>
              Last Visit: {formatDate(item.lastVisitDate)}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => navigation.navigate('MedicalRecordList', { petId: item.petId })}
            >
              <FileText size={14} color="#2563EB" />
              <Text style={styles.actionBtnSecondaryText}>Records</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => navigation.navigate('AddMedicalRecord', { petId: item.petId })}
            >
              <FilePlus size={14} color="#FFFFFF" />
              <Text style={styles.actionBtnPrimaryText}>Add Rx</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 8, 16) }]}>
      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={colors.textSecondary} />
          <TextInput
            placeholder="Search patient, breed, or owner..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Patients Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Clinical Patients ({patients.length})</Text>
      </View>

      {loading ? (
        <Loading message="Loading patients..." />
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.petId}
          renderItem={renderPatientItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + 24, 36) }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <PawPrint size={36} color={colors.borderLight} />
              <Text style={styles.emptyTitle}>No Clinical Patients Yet</Text>
              <Text style={styles.emptySub}>
                Patients will be automatically added here as they schedule consultations with you.
              </Text>
            </Card>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchSection: { paddingHorizontal: 16, marginBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },
  headerRow: { paddingHorizontal: 16, marginBottom: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  listContent: { paddingHorizontal: 16 },
  patientCard: { padding: 14, marginBottom: 12 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  patientInfoCol: { flex: 1, marginLeft: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  petName: { fontSize: 16, fontWeight: '700', color: colors.text },
  visitCountTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  visitCountText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  speciesText: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  ownerText: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  metaDivider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 10 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastVisitInfo: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  lastVisitText: { fontSize: 12, color: colors.textSecondary },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionBtnSecondaryText: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnPrimaryText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  emptyCard: { padding: 32, alignItems: 'center', gap: 6, marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
});

export default VetPatientsScreen;
