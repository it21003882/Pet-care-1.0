/**
 * functions/function6-bookings-reviews/validation/bookingValidation.ts
 * Owner: Function 6 — Service Bookings & Reviews
 */

import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain, validationResult } from 'express-validator';
import { sendError } from '../../../utils/response';
import { BookingStatus } from '../../../types/models';

type ValidationMiddleware = ValidationChain | ((req: Request, res: Response, next: NextFunction) => void);

const BOOKING_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(
      res,
      400,
      'Validation failed.',
      errors.array().map((e) => ({ field: (e as { path: string }).path, message: e.msg as string }))
    );
    return;
  }
  next();
};

export const validateCreateBooking: ValidationMiddleware[] = [
  body('petId').isMongoId().withMessage('Valid Pet ID is required'),
  body('serviceId').isMongoId().withMessage('Valid Service ID is required'),
  body('date')
    .isISO8601().withMessage('Valid booking date is required (YYYY-MM-DD)')
    .custom((val) => {
      const parts = String(val).split('T')[0].split('-');
      if (parts.length === 3) {
        const bookingDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (bookingDate < today) {
          throw new Error('Booking date cannot be in the past');
        }
      }
      return true;
    }),
  body('time').trim().notEmpty().withMessage('Booking time is required (e.g. 10:00 AM)'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors,
];

export const validateUpdateBookingStatus: ValidationMiddleware[] = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(BOOKING_STATUSES)
    .withMessage(`Status must be one of: ${BOOKING_STATUSES.join(', ')}`),
  handleValidationErrors,
];
