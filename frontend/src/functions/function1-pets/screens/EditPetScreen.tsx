/**
 * functions/function1-pets/screens/EditPetScreen.tsx
 * Owner: Function 1 — Pet Management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/navigation';
import { PetGender } from '../../../types/models';
import petService from '../services/petService';
import colors from '../../../constants/colors';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import PetAvatar from '../../../components/common/PetAvatar';
import { isSmallDevice } from '../../../utils/responsive';

type RouteProps = RouteProp<RootStackParamList, 'EditPet'>;
type NavProp = StackNavigationProp<RootStackParamList>;

export const EditPetScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { petId } = route.params;

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<PetGender>('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const pet = await petService.getPetById(petId);
        setName(pet.name);
        setSpecies(pet.species);
        setBreed(pet.breed || '');
        setGender(pet.gender);
        setDateOfBirth(pet.dateOfBirth ? pet.dateOfBirth.substring(0, 10) : '');
        setWeight(pet.weight ? String(pet.weight) : '');
        setDescription(pet.description || '');
        const existingImg = pet.imageUrl || pet.image || null;
        setImageUri(existingImg);
        setInitialImageUrl(existingImg);
      } catch (error) {
        Alert.alert('Error', 'Failed to load pet information');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [petId]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permission is needed to upload pet photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim() || !species.trim()) {
      Alert.alert('Validation Error', 'Pet name and species are required');
      return;
    }

    if (dateOfBirth.trim()) {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoDateRegex.test(dateOfBirth.trim()) || isNaN(Date.parse(dateOfBirth.trim()))) {
        Alert.alert('Validation Error', 'Date of birth must be in YYYY-MM-DD format (e.g. 2022-05-15)');
        return;
      }
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (dateOfBirth.trim() > todayStr) {
        Alert.alert('Validation Error', 'Date of birth cannot be in the future');
        return;
      }
    }

    if (weight.trim()) {
      const num = Number(weight.trim());
      if (isNaN(num) || num <= 0) {
        Alert.alert('Validation Error', 'Weight must be a positive number');
        return;
      }
    }

    try {
      setSubmitting(true);
      const isNewLocalFile = imageUri && (imageUri.startsWith('file://') || !imageUri.startsWith('http') && !imageUri.startsWith('/uploads'));

      if (isNewLocalFile) {
        // Upload new photo via FormData
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('species', species.trim());
        if (breed.trim()) formData.append('breed', breed.trim());
        formData.append('gender', gender);
        if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);
        if (weight) formData.append('weight', weight);
        formData.append('description', description.trim());

        const filename = imageUri!.split('/').pop() || 'pet.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as unknown as Blob);

        await petService.updatePet(petId, formData);
      } else {
        // Plain JSON update (retains existing imageUrl, or clears to null if removed)
        await petService.updatePet(petId, {
          name: name.trim(),
          species: species.trim(),
          breed: breed.trim() || undefined,
          gender,
          dateOfBirth: dateOfBirth || undefined,
          weight: weight ? Number(weight) : undefined,
          description: description.trim() || undefined,
          imageUrl: imageUri, // either existing path or null
        });
      }

      Alert.alert('Success', 'Pet profile updated!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update pet profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading fullScreen message="Loading pet profile..." />;

  const avatarSize = isSmallDevice ? 100 : 116;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: isSmallDevice ? 16 : 20,
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            {imageUri ? (
              imageUri.startsWith('file://') ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <PetAvatar imageUrl={imageUri} name={name} species={species} size={avatarSize} borderRadius={avatarSize / 2} />
              )
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.cameraIcon}>📸</Text>
                <Text style={styles.imagePickerText}>Add Photo</Text>
                <Text style={styles.optionalBadge}>(Optional)</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.photoBtnRow}>
            <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
              <Text style={styles.changePhotoText}>{imageUri ? 'Change' : 'Choose Photo'}</Text>
            </TouchableOpacity>
            {imageUri ? (
              <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setImageUri(null)}>
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <Input label="Pet Name *" value={name} onChangeText={setName} />
        <Input label="Species *" value={species} onChangeText={setSpecies} />
        <Input label="Breed" value={breed} onChangeText={setBreed} />

        <View style={styles.genderContainer}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderOption, gender === 'male' && styles.genderOptionSelected]}
              onPress={() => setGender('male')}
            >
              <Text style={[styles.genderText, gender === 'male' && styles.genderTextSelected]}>
                ♂ Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderOption, gender === 'female' && styles.genderOptionSelected]}
              onPress={() => setGender('female')}
            >
              <Text style={[styles.genderText, gender === 'female' && styles.genderTextSelected]}>
                ♀ Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Input
          label="Date of Birth (YYYY-MM-DD)"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
        />
        <Input
          label="Weight (kg)"
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
        />
        <Input
          label="Description / Medical Notes"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Button
          title="Save Changes"
          onPress={handleUpdate}
          loading={submitting}
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingVertical: 20 },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePicker: {
    alignSelf: 'center',
    width: isSmallDevice ? 104 : 120,
    height: isSmallDevice ? 104 : 120,
    borderRadius: isSmallDevice ? 52 : 60,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  placeholderContainer: { alignItems: 'center' },
  cameraIcon: { fontSize: isSmallDevice ? 22 : 26, marginBottom: 2 },
  imagePickerText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  optionalBadge: { fontSize: 10, color: colors.textPlaceholder, marginTop: 2 },
  photoBtnRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  changePhotoBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  removePhotoBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  removePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  genderContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderOption: {
    flex: 1,
    paddingVertical: isSmallDevice ? 10 : 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  genderOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  genderText: { fontSize: isSmallDevice ? 13 : 14, fontWeight: '600', color: colors.textSecondary },
  genderTextSelected: { color: colors.primary },
  submitBtn: { marginTop: 12 },
});

export default EditPetScreen;
