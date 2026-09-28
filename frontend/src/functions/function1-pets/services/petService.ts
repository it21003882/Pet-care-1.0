/**
 * functions/function1-pets/services/petService.ts
 * Owner: Function 1 — Pet Management
 */

import api from '../../../services/api';
import { ApiResponse } from '../../../types/api';
import { IPet } from '../../../types/models';

export interface PetPayload {
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string;
  weight?: number | string;
  description?: string;
  imageUrl?: string | null;
}

export const petService = {
  async getMyPets(): Promise<IPet[]> {
    const res = await api.get<ApiResponse<IPet[]>>('/pets');
    return res.data.data || [];
  },

  async getPetById(id: string): Promise<IPet> {
    const res = await api.get<ApiResponse<IPet>>(`/pets/${id}`);
    return res.data.data!;
  },

  async createPet(data: FormData | PetPayload): Promise<IPet> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await api.post<ApiResponse<IPet>>('/pets', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data.data!;
  },

  async updatePet(id: string, data: FormData | Partial<PetPayload>): Promise<IPet> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await api.put<ApiResponse<IPet>>(`/pets/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data.data!;
  },

  async deletePet(id: string): Promise<void> {
    await api.delete(`/pets/${id}`);
  },
};

export default petService;
