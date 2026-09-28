/**
 * functions/function4-medical-records/medicalRecord.controller.ts
 * Owner: Function 4 — Medical Record Management
 */

import { Request, Response, NextFunction } from 'express';
import * as medicalRecordService from './medicalRecord.service';
import { sendSuccess } from '../../utils/response';

export const createMedicalRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await medicalRecordService.createMedicalRecord(req.body as Parameters<typeof medicalRecordService.createMedicalRecord>[0]);
    sendSuccess(res, 201, 'Medical record created successfully.', record);
  } catch (error) { next(error); }
};

export const getMedicalRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await medicalRecordService.getMedicalRecords(req.query as { petId?: string; veterinarianId?: string });
    sendSuccess(res, 200, 'Medical records retrieved successfully.', records, records.length);
  } catch (error) { next(error); }
};

export const getMedicalRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await medicalRecordService.getMedicalRecordById(req.params.id);
    sendSuccess(res, 200, 'Medical record retrieved successfully.', record);
  } catch (error) { next(error); }
};

export const updateMedicalRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await medicalRecordService.updateMedicalRecord(req.params.id, req.body as Partial<Parameters<typeof medicalRecordService.createMedicalRecord>[0]>);
    sendSuccess(res, 200, 'Medical record updated successfully.', record);
  } catch (error) { next(error); }
};

export const deleteMedicalRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await medicalRecordService.deleteMedicalRecord(req.params.id);
    sendSuccess(res, 200, 'Medical record deleted successfully.');
  } catch (error) { next(error); }
};
