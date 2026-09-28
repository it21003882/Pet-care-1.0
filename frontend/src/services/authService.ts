/**
 * services/authService.ts
 * Authentication API Service
 */

import api from './api';
import { storage } from '../utils/storage';
import { ApiResponse, AuthResponse, LoginPayload, RegisterPayload } from '../types/api';
import { IUser } from '../types/models';

export const authService = {
  async login(credentials: LoginPayload): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const data = res.data.data!;
    await storage.saveToken(data.token);
    await storage.saveUser(data.user);
    return data;
  },

  async register(credentials: RegisterPayload): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
    const data = res.data.data!;
    if (data.token) {
      await storage.saveToken(data.token);
      await storage.saveUser(data.user);
    }
    return data;
  },

  async getMe(): Promise<IUser> {
    const res = await api.get<ApiResponse<IUser>>('/auth/me');
    const user = res.data.data!;
    await storage.saveUser(user);
    return user;
  },

  async updateProfile(formData: FormData | Partial<IUser>): Promise<IUser> {
    const isFormData = formData instanceof FormData;
    const res = await api.put<ApiResponse<IUser>>('/auth/profile', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    const user = res.data.data!;
    await storage.saveUser(user);
    return user;
  },

  async logout(): Promise<void> {
    await storage.clearAll();
  },

  // ─── Admin Management APIs ──────────────────────────────────
  async getAllUsers(): Promise<IUser[]> {
    const res = await api.get<ApiResponse<IUser[]>>('/auth/users');
    return res.data.data || [];
  },

  async setUserStatus(userId: string, isActive: boolean): Promise<IUser> {
    const res = await api.patch<ApiResponse<IUser>>(`/auth/users/${userId}/status`, { isActive });
    return res.data.data!;
  },

  async setUserRole(userId: string, role: import('../types/models').UserRole): Promise<IUser> {
    const res = await api.patch<ApiResponse<IUser>>(`/auth/users/${userId}/role`, { role });
    return res.data.data!;
  },

  async setDoctorVerification(userId: string, isVerified: boolean): Promise<IUser> {
    const res = await api.patch<ApiResponse<IUser>>(`/auth/users/${userId}/verify-doctor`, { isVerified });
    return res.data.data!;
  },
};

export default authService;
