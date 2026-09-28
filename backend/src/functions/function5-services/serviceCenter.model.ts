/**
 * functions/function5-services/serviceCenter.model.ts
 * ─────────────────────────────────────────────────────────────
 * Owner: Function 5 — Pet-Care Service Management
 * ─────────────────────────────────────────────────────────────
 * Mongoose model for Pet-Care Service Center businesses.
 */

import { Schema, model } from 'mongoose';
import { IServiceCenter } from '../../types/models';

const serviceCenterSchema = new Schema<IServiceCenter>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [150, 'Business name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    website: {
      type: String,
      trim: true,
      default: null,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    openingHours: {
      type: String,
      trim: true,
      default: 'Mon - Sat: 8:00 AM - 6:00 PM',
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

serviceCenterSchema.index({ name: 'text', description: 'text', city: 'text' });
serviceCenterSchema.index({ city: 1 });

const ServiceCenter = model<IServiceCenter>('ServiceCenter', serviceCenterSchema);

export default ServiceCenter;
