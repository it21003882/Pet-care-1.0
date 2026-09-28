/**
 * functions/function1-pets/screens/AddPetScreen.tsx
 * Owner: Function 1 — Pet Management
 */

import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/navigation';
import { PetGender } from '../../../types/models';
import petService from '../services/petService';
import colors from '../../../constants/colors';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { isSmallDevice } from '../../../utils/responsive';

type NavProp = StackNavigationProp<RootStackParamList>;

export const AddPetScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<PetGender>('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Pet name is required';
    if (!species.trim()) errs.species = 'Species is required (e.g. Dog, Cat)';
    if (dateOfBirth.trim()) {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoDateRegex.test(dateOfBirth.trim()) || isNaN(Date.parse(dateOfBirth.trim()))) {
        errs.dateOfBirth = 'Use YYYY-MM-DD format (e.g. 2022-05-15)';
      } else {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (dateOfBirth.trim() > todayStr) {
          errs.dateOfBirth = 'Date of birth cannot be in the future';
        }
      }
    }
    if (weight.trim()) {
      const num = Number(weight.trim());
      if (isNaN(num) || num <= 0) {
        errs.weight = 'Weight must be a positive number';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      if (imageUri) {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('species', species.trim());
        if (breed.trim()) formData.append('breed', breed.trim());
        formData.append('gender', gender);
        if (dateOfBirth.trim()) formData.append('dateOfBirth', dateOfBirth.trim());
        if (weight.trim()) formData.append('weight', weight.trim());
        if (description.trim()) formData.append('description', description.trim());

        const filename = imageUri.split('/').pop() || 'pet.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as unknown as Blob);

        await petService.createPet(formData);
      } else {
        await petService.createPet({
          name: name.trim(),
          species: species.trim(),
          breed: breed.trim() || undefined,
          gender,
          dateOfBirth: dateOfBirth.trim() || undefined,
          weight: weight.trim() ? Number(weight.trim()) : undefined,
          description: description.trim() || undefined,
          imageUrl: null,
        });
      }

      Alert.alert('Success', 'Pet profile created successfully!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create pet profile');
    } finally {
      setSubmitting(false);
    }
  };

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
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.cameraIcon}>📸</Text>
                <Text style={styles.imagePickerText}>Add Photo</Text>
                <Text style={styles.optionalBadge}>(Optional)</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUri ? (
            <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setImageUri(null)}>
              <Text style={styles.removePhotoText}>Remove photo</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.photoHintText}>Photo is optional. A friendly avatar will be used if none provided.</Text>
          )}
        </View>

        <Input
          label="Pet Name *"
          placeholder="e.g. Bella, Max"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <Input
          label="Species *"
          placeholder="e.g. Dog, Cat, Bird"
          value={species}
          onChangeText={setSpecies}
          error={errors.species}
        />

        <Input
          label="Breed"
          placeholder="e.g. Golden Retriever, Siamese"
          value={breed}
          onChangeText={setBreed}
        />

        <View style={styles.genderContainer}>
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'male' && styles.genderOptionSelected,
              ]}
              onPress={() => setGender('male')}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === 'male' && styles.genderTextSelected,
                ]}
              >
                ♂ Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'female' && styles.genderOptionSelected,
              ]}
              onPress={() => setGender('female')}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === 'female' && styles.genderTextSelected,
                ]}
              >
                ♀ Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Input
          label="Date of Birth (YYYY-MM-DD)"
          placeholder="2022-05-15"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          error={errors.dateOfBirth}
        />

        <Input
          label="Weight (kg)"
          placeholder="e.g. 12.5"
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
          error={errors.weight}
        />

        <Input
          label="Description / Medical Notes"
          placeholder="Any allergies, friendly habits, or dietary preferences"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Button
          title="Create Pet Profile"
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
    marginBottom: 8,
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  placeholderContainer: { alignItems: 'center' },
  cameraIcon: { fontSize: isSmallDevice ? 22 : 26, marginBottom: 2 },
  imagePickerText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  optionalBadge: { fontSize: 10, color: colors.textPlaceholder, marginTop: 2 },
  removePhotoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  removePhotoText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  photoHintText: {
    fontSize: 12,
    color: colors.textPlaceholder,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
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

export default AddPetScreen;
