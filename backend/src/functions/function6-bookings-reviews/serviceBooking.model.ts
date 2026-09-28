/**
 * functions/function6-bookings-reviews/serviceBooking.model.ts
 * Owner: Function 6 — Service Bookings & Reviews
 */

import { Schema, model } from 'mongoose';
import { IServiceBooking, BookingStatus } from '../../types/models';

const serviceBookingSchema = new Schema<IServiceBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User ID is required'] },
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: [true, 'Pet ID is required'] },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: [true, 'Service ID is required'] },
    date: { type: Date, required: [true, 'Booking date is required'] },
    time: { type: String, required: [true, 'Booking time is required'] },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[],
      default: 'pending' as BookingStatus,
    },
    notes: { type: String, trim: true, maxlength: [500, 'Notes cannot exceed 500 characters'], default: null },
  },
  { timestamps: true }
);

serviceBookingSchema.index({ userId: 1, status: 1 });
serviceBookingSchema.index({ serviceId: 1 });

const ServiceBooking = model<IServiceBooking>('ServiceBooking', serviceBookingSchema);
export default ServiceBooking;
