/**
 * functions/function5-services/service.validation.ts
 * Owner: Function 5 — Pet-Care Service Management
 */

import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain, validationResult } from 'express-validator';
import { sendError } from '../../utils/response';
import { ServiceCategory } from '../../types/models';

type ValidationMiddleware = ValidationChain | ((req: Request, res: Response, next: NextFunction) => void);

const CATEGORIES: ServiceCategory[] = [
  'Grooming',
  'Bathing',
  'Nail Trimming',
  'Nail Polishing',
  'Training',
  'Boarding',
  'Walking',
  'Pet Daycare',
  'Pet Spa',
  'Other',
];

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

export const validateCreateService: ValidationMiddleware[] = [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  handleValidationErrors,
];

export const validateUpdateService: ValidationMiddleware[] = [
  body('name').optional().trim().notEmpty().withMessage('Service name cannot be empty'),
  body('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('availability').optional().isBoolean().withMessage('Availability must be true or false'),
  handleValidationErrors,
];

export const validateUpdateCenterProfile: ValidationMiddleware[] = [
  body('name').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
  body('phone').optional().trim().isMobilePhone('any').withMessage('Please provide a valid phone number'),
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (!val) return true;
      // Allow urls with or without protocol
      const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!pattern.test(val)) throw new Error('Please provide a valid website URL');
      return true;
    }),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid email address'),
  handleValidationErrors,
];
