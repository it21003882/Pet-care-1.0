/**
 * functions/function3-appointments/services/appointmentService.ts
 * Owner: Function 3 — Appointment Management
 */

import api from '../../../services/api';
import { ApiResponse } from '../../../types/api';
import { IAppointment } from '../../../types/models';

export interface CreateAppointmentPayload {
  petId: string;
  veterinarianId: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
}

export const appointmentService = {
  async getAppointments(status?: string): Promise<IAppointment[]> {
    const res = await api.get<ApiResponse<IAppointment[]>>('/appointments', {
      params: status ? { status } : undefined,
    });
    return res.data.data || [];
  },

  async getAppointmentById(id: string): Promise<IAppointment> {
    const res = await api.get<ApiResponse<IAppointment>>(`/appointments/${id}`);
    return res.data.data!;
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<IAppointment> {
    const res = await api.post<ApiResponse<IAppointment>>('/appointments', payload);
    return res.data.data!;
  },

  async updateAppointmentStatus(id: string, status: string): Promise<IAppointment> {
    const res = await api.put<ApiResponse<IAppointment>>(`/appointments/${id}`, { status });
    return res.data.data!;
  },

  async cancelAppointment(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },
};

export default appointmentService;
