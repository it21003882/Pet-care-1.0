/**
 * functions/function4-medical-records/medicalRecord.model.ts
 * Owner: Function 4 — Medical Record Management
 */

import { Schema, model } from 'mongoose';
import { IMedicalRecord, IMedication, IVaccination } from '../../types/models';

const medicationSchema = new Schema<IMedication>(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true },
    duration: { type: String, trim: true },
  },
  { _id: false }
);

const vaccinationSchema = new Schema<IVaccination>(
  {
    vaccineName: { type: String, trim: true },
    dateGiven: { type: Date },
    nextDueDate: { type: Date },
    batchNumber: { type: String, trim: true },
  },
  { _id: false }
);

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: [true, 'Pet ID is required'] },
    veterinarianId: { type: Schema.Types.ObjectId, ref: 'Veterinarian', required: [true, 'Veterinarian ID is required'] },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', default: null },
    diagnosis: { type: String, required: [true, 'Diagnosis is required'], trim: true },
    treatment: { type: String, trim: true, default: null },
    medications: { type: [medicationSchema], default: [] },
    vaccination: { type: vaccinationSchema, default: null },
    notes: { type: String, trim: true, maxlength: [2000, 'Notes cannot exceed 2000 characters'], default: null },
    recordDate: { type: Date, required: [true, 'Record date is required'], default: Date.now },
  },
  { timestamps: true }
);

medicalRecordSchema.index({ petId: 1, recordDate: -1 });

const MedicalRecord = model<IMedicalRecord>('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
