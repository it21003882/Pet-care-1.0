/**
 * functions/function6-bookings-reviews/services/reviewService.ts
 * Owner: Function 6 — Service Bookings & Reviews
 */

import api from '../../../services/api';
import { ApiResponse } from '../../../types/api';
import { IReview } from '../../../types/models';

export interface CreateReviewPayload {
  veterinarianId?: string;
  serviceId?: string;
  rating: number;
  comment?: string;
}

export const reviewService = {
  async getReviews(params?: { veterinarianId?: string; serviceId?: string }): Promise<IReview[]> {
    const res = await api.get<ApiResponse<IReview[]>>('/reviews', { params });
    return res.data.data || [];
  },

  async createReview(payload: CreateReviewPayload): Promise<IReview> {
    const res = await api.post<ApiResponse<IReview>>('/reviews', payload);
    return res.data.data!;
  },

  async deleteReview(id: string): Promise<void> {
    await api.delete(`/reviews/${id}`);
  },
};

export default reviewService;
