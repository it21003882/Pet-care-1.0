/**
 * functions/function4-medical-records/medicalRecord.validation.ts
 * Owner: Function 4 — Medical Record Management
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

export const validateCreateMedicalRecord: ValidationMiddleware[] = [
  body('petId').notEmpty().withMessage('Pet ID is required').isMongoId().withMessage('Invalid Pet ID'),
  body('veterinarianId').notEmpty().withMessage('Veterinarian ID is required').isMongoId().withMessage('Invalid Veterinarian ID'),
  body('appointmentId').optional().isMongoId().withMessage('Invalid Appointment ID'),
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
  body('treatment').optional().trim(),
  body('medications').optional().isArray().withMessage('Medications must be an array'),
  body('recordDate').optional().isISO8601().withMessage('Record date must be a valid date'),
  body('notes').optional().trim().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),
  handleValidationErrors,
];

export const validateUpdateMedicalRecord: ValidationMiddleware[] = [
  body('diagnosis').optional().trim().notEmpty().withMessage('Diagnosis cannot be empty'),
  body('medications').optional().isArray().withMessage('Medications must be an array'),
  body('recordDate').optional().isISO8601().withMessage('Record date must be a valid date'),
  body('notes').optional().trim().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),
  handleValidationErrors,
];
