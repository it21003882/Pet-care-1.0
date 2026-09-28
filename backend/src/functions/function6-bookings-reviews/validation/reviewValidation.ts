/**
 * functions/function6-bookings-reviews/validation/reviewValidation.ts
 * Owner: Function 6 — Service Bookings & Reviews
 */

import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain, validationResult } from 'express-validator';
import { sendError } from '../../../utils/response';

type ValidationMiddleware = ValidationChain | ((req: Request, res: Response, next: NextFunction) => void);

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

export const validateCreateReview: ValidationMiddleware[] = [
  body('veterinarianId').optional({ nullable: true }).isMongoId().withMessage('Invalid Veterinarian ID'),
  body('serviceId').optional({ nullable: true }).isMongoId().withMessage('Invalid Service ID'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  body().custom((value) => {
    if (!value.veterinarianId && !value.serviceId) {
      throw new Error('Must provide either veterinarianId or serviceId for the review');
    }
    return true;
  }),
  handleValidationErrors,
];

export const validateUpdateReview: ValidationMiddleware[] = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  handleValidationErrors,
];
