/**
 * functions/function5-services/services/serviceService.ts
 * Owner: Function 5 — Pet Service Management
 */

import api from '../../../services/api';
import { ApiResponse } from '../../../types/api';
import { IService, IServiceCenter, ServiceCategory } from '../../../types/models';

export interface ServiceQueryParams {
  search?: string;
  category?: ServiceCategory;
  available?: string;
  serviceCenterId?: string;
}

export const serviceService = {
  async getServices(params?: ServiceQueryParams): Promise<IService[]> {
    const res = await api.get<ApiResponse<IService[]>>('/services', { params });
    return res.data.data || [];
  },

  async getServiceById(id: string): Promise<IService> {
    const res = await api.get<ApiResponse<IService>>(`/services/${id}`);
    return res.data.data!;
  },

  async createService(data: Partial<IService>): Promise<IService> {
    const res = await api.post<ApiResponse<IService>>('/services', data);
    return res.data.data!;
  },

  async updateService(id: string, data: Partial<IService>): Promise<IService> {
    const res = await api.put<ApiResponse<IService>>(`/services/${id}`, data);
    return res.data.data!;
  },

  async deleteService(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },

  // Service Center Business Profile
  async getMyCenterProfile(): Promise<IServiceCenter> {
    const res = await api.get<ApiResponse<IServiceCenter>>('/services/center/me');
    return res.data.data!;
  },

  async updateMyCenterProfile(data: Partial<IServiceCenter>): Promise<IServiceCenter> {
    const res = await api.put<ApiResponse<IServiceCenter>>('/services/center/me', data);
    return res.data.data!;
  },

  async getMyServices(): Promise<IService[]> {
    const res = await api.get<ApiResponse<IService[]>>('/services/center/my-services');
    return res.data.data || [];
  },

  async getServiceCenterById(centerId: string): Promise<IServiceCenter> {
    const res = await api.get<ApiResponse<IServiceCenter>>(`/services/center/${centerId}`);
    return res.data.data!;
  },
};

export default serviceService;
