/**
 * functions/function6-bookings-reviews/review.model.ts
 * Owner: Function 6 — Service Bookings & Reviews
 */

import { Schema, model } from 'mongoose';
import { IReview } from '../../types/models';

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'User ID is required'] },
    veterinarianId: { type: Schema.Types.ObjectId, ref: 'Veterinarian', default: null },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', default: null },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: { type: String, trim: true, maxlength: [1000, 'Comment cannot exceed 1000 characters'], default: null },
  },
  { timestamps: true }
);

// Ensure a review targets either a veterinarian or a service
reviewSchema.pre('validate', function (next) {
  if (!this.veterinarianId && !this.serviceId) {
    next(new Error('A review must be associated with either a veterinarian or a service.'));
  } else {
    next();
  }
});

reviewSchema.index({ veterinarianId: 1, createdAt: -1 });
reviewSchema.index({ serviceId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });

const Review = model<IReview>('Review', reviewSchema);
export default Review;
