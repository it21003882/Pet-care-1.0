/**
 * functions/function1-pets/pet.service.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/functions/function1-pets/pet.service.ts
 * Owner: Function 1 — Pet Management
 * ─────────────────────────────────────────────────────────────
 */

import Pet from './pet.model';
import { IPet, UserRole } from '../../types/models';

export interface CreatePetInput {
  name: string;
  species: string;
  breed?: string;
  gender?: 'male' | 'female' | 'unknown';
  dateOfBirth?: string;
  weight?: number;
  description?: string;
  imageUrl?: string | null;
  image?: string | null;
}

export interface UpdatePetInput extends Partial<CreatePetInput> {
  imageUrl?: string | null;
  image?: string | null;
}

export const createPet = async (
  petData: CreatePetInput,
  ownerId: string,
  imageUrl: string | null = null
): Promise<IPet> => {
  const finalImageUrl = imageUrl || petData.imageUrl || petData.image || null;
  const pet = await Pet.create({
    ...petData,
    ownerId,
    imageUrl: finalImageUrl,
    image: finalImageUrl,
  });
  return pet;
};

export const getPetsByOwner = async (ownerId: string): Promise<IPet[]> => {
  return Pet.find({ ownerId }).sort({ createdAt: -1 });
};

const extractId = (entity: any): string => {
  if (!entity) return '';
  if (typeof entity === 'object' && entity._id) {
    return entity._id.toString();
  }
  return entity.toString();
};

export const getPetById = async (
  petId: string,
  userId: string,
  userRole: UserRole
): Promise<IPet> => {
  const pet = await Pet.findById(petId).populate('ownerId', 'name email phone');

  if (!pet) {
    throw Object.assign(new Error('Pet not found.'), { statusCode: 404 });
  }

  const ownerIdString = extractId(pet.ownerId);

  if (userRole === 'owner' && ownerIdString !== userId.toString()) {
    throw Object.assign(new Error('You do not have permission to view this pet.'), { statusCode: 403 });
  }

  return pet;
};

export const updatePet = async (
  petId: string,
  updateData: UpdatePetInput,
  ownerId: string,
  imageUrl: string | null = null
): Promise<IPet> => {
  const pet = await Pet.findById(petId);

  if (!pet) {
    throw Object.assign(new Error('Pet not found.'), { statusCode: 404 });
  }

  if (extractId(pet.ownerId) !== ownerId.toString()) {
    throw Object.assign(new Error('You do not have permission to update this pet.'), { statusCode: 403 });
  }

  const updates: Record<string, unknown> = { ...updateData };
  const finalImageUrl = imageUrl || updateData.imageUrl || updateData.image;
  if (finalImageUrl !== undefined) {
    updates.imageUrl = finalImageUrl;
    updates.image = finalImageUrl;
  }

  const updated = await Pet.findByIdAndUpdate(petId, updates, { new: true, runValidators: true });
  return updated as IPet;
};

export const deletePet = async (petId: string, ownerId: string): Promise<void> => {
  const pet = await Pet.findById(petId);

  if (!pet) {
    throw Object.assign(new Error('Pet not found.'), { statusCode: 404 });
  }

  if (extractId(pet.ownerId) !== ownerId.toString()) {
    throw Object.assign(new Error('You do not have permission to delete this pet.'), { statusCode: 403 });
  }

  await Pet.findByIdAndDelete(petId);
};
