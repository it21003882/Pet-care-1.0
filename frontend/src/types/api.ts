/**
 * types/api.ts
 * API Request & Response Types
 */

import { IUser, UserRole } from './models';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  errors?: Array<{ field: string; message: string }>;
}

export interface AuthResponse {
  user: IUser;
  token: string;
  pendingVerification?: boolean;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  regNo?: string;
  address?: string;
  city?: string;
  website?: string;
}
