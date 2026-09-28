/**
 * functions/function6-bookings-reviews/review.service.ts
 * Owner: Function 6 — Service Bookings & Reviews
 */

import Review from './review.model';
import { IReview, UserRole } from '../../types/models';

export interface CreateReviewInput {
  veterinarianId?: string | null;
  serviceId?: string | null;
  rating: number;
  comment?: string | null;
}

export interface ReviewQuery {
  veterinarianId?: string;
  serviceId?: string;
  userId?: string;
}

export const createReview = async (
  data: CreateReviewInput,
  userId: string
): Promise<IReview> => {
  const review = await Review.create({
    userId,
    veterinarianId: data.veterinarianId || null,
    serviceId: data.serviceId || null,
    rating: data.rating,
    comment: data.comment || null,
  });

  await review.populate([
    { path: 'userId', select: 'name profileImage' },
    { path: 'veterinarianId', select: 'name clinicName' },
    { path: 'serviceId', select: 'name category' },
  ]);

  return review;
};

export const getReviews = async (query: ReviewQuery = {}): Promise<IReview[]> => {
  const filter: Record<string, unknown> = {};

  if (query.veterinarianId) filter.veterinarianId = query.veterinarianId;
  if (query.serviceId) filter.serviceId = query.serviceId;
  if (query.userId) filter.userId = query.userId;

  return Review.find(filter)
    .populate('userId', 'name profileImage')
    .populate('veterinarianId', 'name clinicName specialization')
    .populate('serviceId', 'name category price')
    .sort({ createdAt: -1 });
};

export const getReviewById = async (id: string): Promise<IReview> => {
  const review = await Review.findById(id)
    .populate('userId', 'name profileImage')
    .populate('veterinarianId', 'name clinicName')
    .populate('serviceId', 'name category');

  if (!review) {
    throw Object.assign(new Error('Review not found.'), { statusCode: 404 });
  }

  return review;
};

export const updateReview = async (
  id: string,
  updateData: { rating?: number; comment?: string },
  userId: string,
  userRole: UserRole
): Promise<IReview> => {
  const review = await Review.findById(id);
  if (!review) {
    throw Object.assign(new Error('Review not found.'), { statusCode: 404 });
  }

  if (userRole !== 'admin' && review.userId.toString() !== userId) {
    throw Object.assign(new Error('You do not have permission to update this review.'), { statusCode: 403 });
  }

  const updated = await Review.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate('userId', 'name profileImage');

  return updated as IReview;
};

export const deleteReview = async (
  id: string,
  userId: string,
  userRole: UserRole
): Promise<void> => {
  const review = await Review.findById(id);
  if (!review) {
    throw Object.assign(new Error('Review not found.'), { statusCode: 404 });
  }

  if (userRole !== 'admin' && review.userId.toString() !== userId) {
    throw Object.assign(new Error('You do not have permission to delete this review.'), { statusCode: 403 });
  }

  await Review.findByIdAndDelete(id);
};
