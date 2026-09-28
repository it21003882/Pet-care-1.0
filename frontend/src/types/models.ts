/**
 * types/models.ts
 * Shared Domain Interfaces for Frontend
 */

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
export type PetGender = 'male' | 'female';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
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
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  regNo?: string | null;
  profileImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPet {
  _id: string;
  ownerId: string | IUser;
  name: string;
  species: string;
  breed?: string;
  gender: PetGender;
  dateOfBirth?: string;
  weight?: number;
  description?: string;
  imageUrl?: string | null;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface IVeterinarian {
  _id: string;
  userId?: string | IUser;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  clinicName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  typesOfCare?: string;
  consultationFee: number;
  availability: IAvailabilitySlot[];
  regNo?: string | null;
  isVerified?: boolean;
  profileImage?: string | null;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IServiceCenter {
  _id: string;
  userId?: string | IUser;
  name: string;
  description?: string;
  phone: string;
  email?: string;
  website?: string;
  address: string;
  city: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: string;
  profileImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAppointment {
  _id: string;
  petId: IPet | string;
  ownerId: IUser | string;
  veterinarianId: IVeterinarian | string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface IVaccination {
  vaccineName: string;
  dateGiven: string;
  nextDueDate?: string;
  batchNumber?: string;
}

export interface IMedicalRecord {
  _id: string;
  petId: IPet | string;
  veterinarianId: IVeterinarian | string;
  appointmentId?: IAppointment | string | null;
  diagnosis: string;
  treatment?: string;
  medications: IMedication[];
  vaccination?: IVaccination | null;
  notes?: string;
  recordDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IService {
  _id: string;
  serviceCenterId?: IServiceCenter | string;
  name: string;
  description?: string;
  category: ServiceCategory;
  price: number;
  duration: number;
  provider?: string;
  availability: boolean;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IServiceBooking {
  _id: string;
  userId: IUser | string;
  petId: IPet | string;
  serviceId: IService | string;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IReview {
  _id: string;
  userId: IUser;
  veterinarianId?: IVeterinarian | string | null;
  serviceId?: IService | string | null;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}
