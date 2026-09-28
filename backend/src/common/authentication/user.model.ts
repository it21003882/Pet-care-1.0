/**
 * common/authentication/user.model.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/common/authentication/user.model.ts
 * Owner: Common Group Function — Authentication
 * ─────────────────────────────────────────────────────────────
 *
 * Purpose:
 *   Mongoose schema + model for the User entity with full
 *   TypeScript typings via the IUser interface.
 *   Password is hashed in a pre-save hook.
 *   comparePassword() is an instance method typed on IUser.
 * ─────────────────────────────────────────────────────────────
 */

import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../../types/models';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never returned in queries by default
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    role: {
      type: String,
      enum: [
        'owner',
        'customer',
        'veterinarian',
        'service_center',
        'admin',
        'CUSTOMER',
        'VETERINARIAN',
        'SERVICE_CENTER',
        'ADMIN',
      ] as UserRole[],
      default: 'owner' as UserRole,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    regNo: {
      type: String,
      trim: true,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ─── Pre-save: Normalize role & Hash password ─────────────────
userSchema.pre<IUser>('save', async function (next) {
  if (this.role) {
    const r = (this.role as string).toLowerCase();
    if (r === 'customer' || r === 'owner') this.role = 'owner';
    else if (r === 'veterinarian') this.role = 'veterinarian';
    else if (r === 'service_center') this.role = 'service_center';
    else if (r === 'admin') this.role = 'admin';
  }

  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: Compare passwords ──────────────────────
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password as string);
};

const User = model<IUser>('User', userSchema);

export default User;
