/**
 * functions/function6-bookings-reviews/review.controller.ts
 * Owner: Function 6 — Service Bookings & Reviews
 */

import { Request, Response, NextFunction } from 'express';
import * as reviewService from './review.service';
import { sendSuccess } from '../../utils/response';

export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await reviewService.createReview(req.body, req.user!.id);
    sendSuccess(res, 201, 'Review submitted successfully.', review);
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await reviewService.getReviews(req.query as reviewService.ReviewQuery);
    sendSuccess(res, 200, 'Reviews retrieved successfully.', reviews, reviews.length);
  } catch (error) {
    next(error);
  }
};

export const getReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    sendSuccess(res, 200, 'Review retrieved successfully.', review);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await reviewService.updateReview(req.params.id, req.body, req.user!.id, req.user!.role);
    sendSuccess(res, 200, 'Review updated successfully.', review);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await reviewService.deleteReview(req.params.id, req.user!.id, req.user!.role);
    sendSuccess(res, 200, 'Review deleted successfully.');
  } catch (error) {
    next(error);
  }
};
