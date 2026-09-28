/**
 * functions/function4-medical-records/medicalRecord.service.ts
 * Owner: Function 4 — Medical Record Management
 */

import MedicalRecord from './medicalRecord.model';
import { IMedicalRecord, IMedication, IVaccination } from '../../types/models';

interface CreateMedicalRecordInput {
  petId: string;
  veterinarianId: string;
  appointmentId?: string;
  diagnosis: string;
  treatment?: string;
  medications?: IMedication[];
  vaccination?: IVaccination;
  notes?: string;
  recordDate?: string;
}

interface MedicalRecordQuery {
  petId?: string;
  veterinarianId?: string;
}

export const createMedicalRecord = async (data: CreateMedicalRecordInput): Promise<IMedicalRecord> => {
  const record = await MedicalRecord.create(data);
  await record.populate(['petId', 'veterinarianId', 'appointmentId']);
  return record;
};

export const getMedicalRecords = async (query: MedicalRecordQuery = {}): Promise<IMedicalRecord[]> => {
  const filter: Record<string, unknown> = {};
  if (query.petId) filter.petId = query.petId;
  if (query.veterinarianId) filter.veterinarianId = query.veterinarianId;

  return MedicalRecord.find(filter)
    .populate('petId', 'name species image')
    .populate('veterinarianId', 'name specialization')
    .populate('appointmentId', 'date time reason')
    .sort({ recordDate: -1 });
};

export const getMedicalRecordById = async (recordId: string): Promise<IMedicalRecord> => {
  const record = await MedicalRecord.findById(recordId)
    .populate('petId', 'name species breed image')
    .populate('veterinarianId', 'name specialization clinicName')
    .populate('appointmentId', 'date time reason status');

  if (!record) throw Object.assign(new Error('Medical record not found.'), { statusCode: 404 });
  return record;
};

export const updateMedicalRecord = async (
  recordId: string,
  updateData: Partial<CreateMedicalRecordInput>
): Promise<IMedicalRecord> => {
  const record = await MedicalRecord.findById(recordId);
  if (!record) throw Object.assign(new Error('Medical record not found.'), { statusCode: 404 });

  const updated = await MedicalRecord.findByIdAndUpdate(recordId, updateData, { new: true, runValidators: true })
    .populate(['petId', 'veterinarianId']);

  return updated as IMedicalRecord;
};

export const deleteMedicalRecord = async (recordId: string): Promise<void> => {
  const record = await MedicalRecord.findById(recordId);
  if (!record) throw Object.assign(new Error('Medical record not found.'), { statusCode: 404 });
  await MedicalRecord.findByIdAndDelete(recordId);
};
