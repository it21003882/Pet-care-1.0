/**
 * functions/function2-veterinarians/veterinarian.model.ts
 * ─────────────────────────────────────────────────────────────
 * Owner: Function 2 — Veterinarian Management
 * ─────────────────────────────────────────────────────────────
 */

import { Schema, model } from 'mongoose';
import { IVeterinarian, IAvailabilitySlot, DayOfWeek } from '../../types/models';

const availabilitySlotSchema = new Schema<IAvailabilitySlot>(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as DayOfWeek[],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const veterinarianSchema = new Schema<IVeterinarian>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User ID is required'], unique: true },
    name: { type: String, required: [true, 'Veterinarian name is required'], trim: true },
    specialization: { type: String, required: [true, 'Specialization is required'], trim: true },
    qualification: { type: String, trim: true, default: null },
    experience: { type: Number, min: [0, 'Experience cannot be negative'], default: 0 },
    clinicName: { type: String, trim: true, default: null },
    phone: { type: String, trim: true, default: null },
    email: { type: String, trim: true, lowercase: true, default: null },
    address: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    location: { type: String, trim: true, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    typesOfCare: { type: String, trim: true, default: null },
    consultationFee: { type: Number, min: [0, 'Consultation fee cannot be negative'], default: 0 },
    availability: { type: [availabilitySlotSchema], default: [] },
    regNo: { type: String, trim: true, default: null },
    isVerified: { type: Boolean, default: false },
    profileImage: { type: String, default: null },
    description: { type: String, trim: true, maxlength: [1000, 'Description cannot exceed 1000 characters'], default: null },
  },
  { timestamps: true }
);

veterinarianSchema.index({ specialization: 'text', name: 'text' });
veterinarianSchema.index({ location: 1 });

const Veterinarian = model<IVeterinarian>('Veterinarian', veterinarianSchema);
export default Veterinarian;
