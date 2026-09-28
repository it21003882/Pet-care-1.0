/**
 * functions/function2-veterinarians/services/vetService.ts
 * Owner: Function 2 — Veterinarian Management
 */

import api from '../../../services/api';
import { ApiResponse } from '../../../types/api';
import { IVeterinarian } from '../../../types/models';

export interface VetQueryParams {
  search?: string;
  specialization?: string;
  location?: string;
}

export const vetService = {
  async getVeterinarians(params?: VetQueryParams): Promise<IVeterinarian[]> {
    const res = await api.get<ApiResponse<IVeterinarian[]>>('/veterinarians', { params });
    return res.data.data || [];
  },

  async getVeterinarianById(id: string): Promise<IVeterinarian> {
    const res = await api.get<ApiResponse<IVeterinarian>>(`/veterinarians/${id}`);
    return res.data.data!;
  },

  async getMyProfile(): Promise<IVeterinarian> {
    const res = await api.get<ApiResponse<IVeterinarian>>('/veterinarians/me');
    return res.data.data!;
  },

  async updateVeterinarian(id: string, data: Partial<IVeterinarian>): Promise<IVeterinarian> {
    const res = await api.put<ApiResponse<IVeterinarian>>(`/veterinarians/${id}`, data);
    return res.data.data!;
  },
};

export default vetService;
