/**
 * functions/function2-veterinarians/veterinarian.service.ts
 * Owner: Function 2 — Veterinarian Management
 */

import Veterinarian from './veterinarian.model';
import { IVeterinarian, UserRole } from '../../types/models';

interface CreateVetInput {
  userId: string;
  name: string;
  specialization: string;
  qualification?: string;
  experience?: number;
  clinicName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  typesOfCare?: string;
  consultationFee?: number;
  description?: string;
}

interface VetQuery {
  search?: string;
  specialization?: string;
  location?: string;
}

export const createVeterinarian = async (
  vetData: CreateVetInput,
  imageUrl: string | null = null
): Promise<IVeterinarian> => {
  return Veterinarian.create({ ...vetData, profileImage: imageUrl });
};

export const getAllVeterinarians = async (query: VetQuery = {}): Promise<IVeterinarian[]> => {
  const filter: Record<string, unknown> = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { specialization: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.specialization) filter.specialization = { $regex: query.specialization, $options: 'i' };
  if (query.location) filter.location = { $regex: query.location, $options: 'i' };

  return Veterinarian.find(filter).populate('userId', 'name email').sort({ createdAt: -1 });
};

export const getVeterinarianById = async (vetId: string): Promise<IVeterinarian> => {
  const vet = await Veterinarian.findById(vetId).populate('userId', 'name email');
  if (!vet) throw Object.assign(new Error('Veterinarian not found.'), { statusCode: 404 });
  return vet;
};

export const updateVeterinarian = async (
  vetId: string,
  updateData: Partial<CreateVetInput>,
  requesterId: string,
  requesterRole: UserRole,
  imageUrl: string | null = null
): Promise<IVeterinarian> => {
  const vet = await Veterinarian.findById(vetId);
  if (!vet) throw Object.assign(new Error('Veterinarian not found.'), { statusCode: 404 });

  if (requesterRole === 'veterinarian' && vet.userId.toString() !== requesterId) {
    throw Object.assign(new Error('You can only update your own profile.'), { statusCode: 403 });
  }

  const updates: Record<string, unknown> = { ...updateData };
  if (imageUrl) updates.profileImage = imageUrl;

  const updated = await Veterinarian.findByIdAndUpdate(vetId, updates, { new: true, runValidators: true });
  return updated as IVeterinarian;
};

export const getMyVeterinarianProfile = async (userId: string): Promise<IVeterinarian> => {
  let vet = await Veterinarian.findOne({ userId }).populate('userId', 'name email phone');
  if (!vet) {
    const User = (await import('../../common/authentication/user.model')).default;
    const user = await User.findById(userId);
    if (!user) throw Object.assign(new Error('User not found.'), { statusCode: 404 });

    vet = await Veterinarian.create({
      userId: user._id,
      name: user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`,
      specialization: 'General Veterinary Medicine',
      qualification: 'DVM / BVSc',
      phone: user.phone || '',
      email: user.email,
      address: 'Clinic Address',
      city: 'City',
      clinicName: 'PetCare Veterinary Clinic',
      consultationFee: 50,
    });
    await vet.populate('userId', 'name email phone');
  }
  return vet;
};

export const deleteVeterinarian = async (vetId: string): Promise<void> => {
  const vet = await Veterinarian.findById(vetId);
  if (!vet) throw Object.assign(new Error('Veterinarian not found.'), { statusCode: 404 });
  await Veterinarian.findByIdAndDelete(vetId);
};
