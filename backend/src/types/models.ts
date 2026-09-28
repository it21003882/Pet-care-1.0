/**
 * types/models.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/types/models.ts
 * ─────────────────────────────────────────────────────────────
 *
 * Purpose:
 *   Shared TypeScript interfaces and types for all Mongoose
 *   documents across all 6 functions.
 *
 *   These interfaces represent the shape of documents in the
 *   database and are used by models, services, and controllers.
 * ─────────────────────────────────────────────────────────────
 */

import { Document, Types } from 'mongoose';

// ─── Enums / Literal Types ────────────────────────────────────

export type UserRole =
  | 'owner'
  | 'customer'
  | 'veterinarian'
  | 'service_center'
  | 'admin'
  | 'CUSTOMER'
  | 'VETERINARIAN'
  | 'SERVICE_CENTER'
  | 'ADMIN';

export type Gender = 'male' | 'female' | 'unknown';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ServiceCategory =
  | 'Grooming'
  | 'Bathing'
  | 'Nail Trimming'
  | 'Nail Polishing'
  | 'Training'
  | 'Boarding'
  | 'Walking'
  | 'Pet Daycare'
  | 'Pet Spa'
  | 'Other';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

// ─── Common Auth ──────────────────────────────────────────────

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  regNo: string | null;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface IUserResponse {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  regNo: string | null;
  profileImage: string | null;
  createdAt: Date;
}

// ─── Function 1 — Pets ────────────────────────────────────────

export interface IPet extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  name: string;
  species: string;
  breed: string | null;
  gender: Gender;
  dateOfBirth: Date | null;
  weight: number | null;
  description: string | null;
  imageUrl: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Function 2 — Veterinarians ──────────────────────────────

export interface IAvailabilitySlot {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface IVeterinarian extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  specialization: string;
  qualification: string | null;
  experience: number;
  clinicName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  typesOfCare: string | null;
  consultationFee: number;
  availability: IAvailabilitySlot[];
  regNo?: string | null;
  isVerified?: boolean;
  profileImage: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Function 3 — Appointments ────────────────────────────────

export interface IAppointment extends Document {
  _id: Types.ObjectId;
  petId: Types.ObjectId;
  ownerId: Types.ObjectId;
  veterinarianId: Types.ObjectId;
  date: Date;
  time: string;
  reason: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Function 4 — Medical Records ────────────────────────────

export interface IMedication {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface IVaccination {
  vaccineName?: string;
  dateGiven?: Date;
  nextDueDate?: Date;
  batchNumber?: string;
}

export interface IMedicalRecord extends Document {
  _id: Types.ObjectId;
  petId: Types.ObjectId;
  veterinarianId: Types.ObjectId;
  appointmentId: Types.ObjectId | null;
  diagnosis: string;
  treatment: string | null;
  medications: IMedication[];
  vaccination: IVaccination | null;
  notes: string | null;
  recordDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Function 5 — Pet-Care Service Centers & Services ──────────

export interface IServiceCenter extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  description: string | null;
  phone: string;
  email: string | null;
  website: string | null;
  address: string;
  city: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  openingHours: string | null;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IService extends Document {
  _id: Types.ObjectId;
  serviceCenterId?: Types.ObjectId | IServiceCenter;
  name: string;
  description: string | null;
  category: ServiceCategory;
  price: number;
  duration: number;
  provider: string | null;
  availability: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Function 6 — Service Bookings & Reviews ─────────────────

export interface IServiceBooking extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  petId: Types.ObjectId;
  serviceId: Types.ObjectId;
  date: Date;
  time: string;
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  veterinarianId: Types.ObjectId | null;
  serviceId: Types.ObjectId | null;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── API Response Types ────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
  count?: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Auth Service Return Types ────────────────────────────────

export interface AuthPayload {
  user: IUserResponse;
  token: string;
  pendingVerification?: boolean;
  message?: string;
}

// ─── JWT Decoded Payload ──────────────────────────────────────

export interface JwtPayload {
  id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
