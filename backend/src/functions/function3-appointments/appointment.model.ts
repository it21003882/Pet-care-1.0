/**
 * functions/function3-appointments/appointment.model.ts
 * Owner: Function 3 — Appointment Management
 */

import { Schema, model } from 'mongoose';
import { IAppointment, AppointmentStatus } from '../../types/models';

const appointmentSchema = new Schema<IAppointment>(
  {
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: [true, 'Pet ID is required'] },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Owner ID is required'] },
    veterinarianId: { type: Schema.Types.ObjectId, ref: 'Veterinarian', required: [true, 'Veterinarian ID is required'] },
    date: { type: Date, required: [true, 'Appointment date is required'] },
    time: { type: String, required: [true, 'Appointment time is required'] },
    reason: { type: String, required: [true, 'Reason is required'], trim: true, maxlength: [500, 'Reason cannot exceed 500 characters'] },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'] as AppointmentStatus[],
      default: 'pending' as AppointmentStatus,
    },
    notes: { type: String, trim: true, maxlength: [1000, 'Notes cannot exceed 1000 characters'], default: null },
  },
  { timestamps: true }
);

appointmentSchema.index({ ownerId: 1, status: 1 });
appointmentSchema.index({ veterinarianId: 1, status: 1 });
appointmentSchema.index({ petId: 1 });

const Appointment = model<IAppointment>('Appointment', appointmentSchema);
export default Appointment;
