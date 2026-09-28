/**
 * functions/function1-pets/pet.model.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/functions/function1-pets/pet.model.ts
 * Owner: Function 1 — Pet Management
 * ─────────────────────────────────────────────────────────────
 */

import { Schema, model, Types } from 'mongoose';
import { IPet, Gender } from '../../types/models';

const petSchema = new Schema<IPet>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },

    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
      minlength: [1, 'Pet name must be at least 1 character'],
      maxlength: [100, 'Pet name cannot exceed 100 characters'],
    },

    species: {
      type: String,
      required: [true, 'Species is required'],
      trim: true,
    },

    breed: { type: String, trim: true, default: null },

    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'] as Gender[],
      default: 'unknown' as Gender,
    },

    dateOfBirth: { type: Date, default: null },

    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null,
    },

    imageUrl: { type: String, default: null },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

petSchema.index({ ownerId: 1 });

const Pet = model<IPet>('Pet', petSchema);

export default Pet;
