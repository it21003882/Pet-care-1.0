/**
 * functions/function2-veterinarians/veterinarian.validation.ts
 * Owner: Function 2 — Veterinarian Management
 */

import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain, validationResult } from 'express-validator';
import { sendError } from '../../utils/response';

type ValidationMiddleware = ValidationChain | ((req: Request, res: Response, next: NextFunction) => void);

const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 400, 'Validation failed.', errors.array().map((e) => ({ field: (e as { path: string }).path, message: e.msg as string })));
    return;
  }
  next();
};

export const validateCreateVeterinarian: ValidationMiddleware[] = [
  body('userId').notEmpty().withMessage('User ID is required').isMongoId().withMessage('Invalid User ID'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
  body('consultationFee').optional().isFloat({ min: 0 }).withMessage('Consultation fee must be non-negative'),
  handleValidationErrors,
];

export const validateUpdateVeterinarian: ValidationMiddleware[] = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('specialization').optional().trim().notEmpty().withMessage('Specialization cannot be empty'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
  body('consultationFee').optional().isFloat({ min: 0 }).withMessage('Consultation fee must be non-negative'),
  handleValidationErrors,
];
