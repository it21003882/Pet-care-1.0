/**
 * functions/function6-bookings-reviews/services/bookingService.ts
 * Owner: Function 6 — Service Bookings & Reviews
 */

import api from '../../../services/api';
import { ApiResponse } from '../../../types/api';
import { IServiceBooking, BookingStatus } from '../../../types/models';

export interface CreateBookingPayload {
  petId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}

export const bookingService = {
  async getMyBookings(status?: BookingStatus): Promise<IServiceBooking[]> {
    const res = await api.get<ApiResponse<IServiceBooking[]>>('/service-bookings', {
      params: status ? { status } : undefined,
    });
    return res.data.data || [];
  },

  async getBookingById(id: string): Promise<IServiceBooking> {
    const res = await api.get<ApiResponse<IServiceBooking>>(`/service-bookings/${id}`);
    return res.data.data!;
  },

  async createBooking(payload: CreateBookingPayload): Promise<IServiceBooking> {
    const res = await api.post<ApiResponse<IServiceBooking>>('/service-bookings', payload);
    return res.data.data!;
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<IServiceBooking> {
    const res = await api.patch<ApiResponse<IServiceBooking>>(`/service-bookings/${id}`, {
      status,
    });
    return res.data.data!;
  },

  async cancelBooking(id: string): Promise<IServiceBooking> {
    return this.updateBookingStatus(id, 'cancelled');
  },

  async deleteBooking(id: string): Promise<void> {
    await api.delete(`/service-bookings/${id}`);
  },
};

export default bookingService;
