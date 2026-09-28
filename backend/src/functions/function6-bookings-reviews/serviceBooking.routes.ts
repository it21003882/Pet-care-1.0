/**
 * functions/function6-bookings-reviews/serviceBooking.routes.ts
 * Owner: Function 6 — Service Bookings & Reviews
 * Mounted at: /api/service-bookings
 */

import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking,
} from './serviceBooking.controller';
import {
  validateCreateBooking,
  validateUpdateBookingStatus,
} from './validation/bookingValidation';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
  .post(validateCreateBooking, createBooking)
  .get(getBookings);

router.route('/:id')
  .get(getBooking)
  .patch(validateUpdateBookingStatus, updateBookingStatus)
  .delete(deleteBooking);

export default router;
