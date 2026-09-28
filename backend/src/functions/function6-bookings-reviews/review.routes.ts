/**
 * functions/function6-bookings-reviews/review.routes.ts
 * Owner: Function 6 — Service Bookings & Reviews
 * Mounted at: /api/reviews
 */

import { Router } from 'express';
import {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
} from './review.controller';
import {
  validateCreateReview,
  validateUpdateReview,
} from './validation/reviewValidation';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

// Public routes for viewing reviews
router.get('/', getReviews);
router.get('/:id', getReview);

// Protected routes for submitting and managing reviews
router.use(protect);
router.post('/', validateCreateReview, createReview);
router.put('/:id', validateUpdateReview, updateReview);
router.delete('/:id', deleteReview);

export default router;
