/**
 * services/api.ts
 * Axios client instance with auth interceptors
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '../constants/config';
import { storage } from '../utils/storage';

export const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  async (reqConfig: InternalAxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle API Errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errors?: Array<{ field: string; message: string }> }>) => {
    const errorData = error.response?.data;
    let message =
      errorData?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      const fieldErrors = errorData.errors.map((e) => e.message).join('. ');
      message = `${message} (${fieldErrors})`;
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
