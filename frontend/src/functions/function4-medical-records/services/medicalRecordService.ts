/**
 * functions/function4-medical-records/services/medicalRecordService.ts
 * Owner: Function 4 — Medical Record Management
 */

import api from '../../../services/api';
import { ApiResponse } from '../../../types/api';
import { IMedicalRecord } from '../../../types/models';

export interface CreateMedicalRecordPayload {
  petId: string;
  veterinarianId: string;
  appointmentId?: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  recordDate?: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  vaccination?: {
    vaccineName: string;
    dateGiven: string;
    nextDueDate?: string;
    batchNumber?: string;
  };
}

export const medicalRecordService = {
  async getMedicalRecords(params?: { petId?: string; veterinarianId?: string }): Promise<IMedicalRecord[]> {
    const res = await api.get<ApiResponse<IMedicalRecord[]>>('/medical-records', { params });
    return res.data.data || [];
  },

  async getMedicalRecordById(id: string): Promise<IMedicalRecord> {
    const res = await api.get<ApiResponse<IMedicalRecord>>(`/medical-records/${id}`);
    return res.data.data!;
  },

  async createMedicalRecord(payload: CreateMedicalRecordPayload): Promise<IMedicalRecord> {
    const res = await api.post<ApiResponse<IMedicalRecord>>('/medical-records', payload);
    return res.data.data!;
  },

  async deleteMedicalRecord(id: string): Promise<void> {
    await api.delete(`/medical-records/${id}`);
  },
};

export default medicalRecordService;
