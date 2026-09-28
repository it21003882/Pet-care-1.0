/**
 * functions/function3-appointments/appointment.validation.ts
 * Owner: Function 3 — Appointment Management
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

export const validateCreateAppointment: ValidationMiddleware[] = [
  body('petId').notEmpty().withMessage('Pet ID is required').isMongoId().withMessage('Invalid Pet ID'),
  body('veterinarianId').notEmpty().withMessage('Veterinarian ID is required').isMongoId().withMessage('Invalid Veterinarian ID'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date')
    .custom((val) => {
      const parts = String(val).split('T')[0].split('-');
      if (parts.length === 3) {
        const appointmentDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (appointmentDate < today) {
          throw new Error('Appointment date cannot be in the past');
        }
      }
      return true;
    }),
  body('time')
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5]\d(\s*(AM|PM|am|pm))?$/i)
    .withMessage('Time must be in valid format (e.g. 10:00 or 10:00 AM)'),
  body('reason').trim().notEmpty().withMessage('Reason is required').isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  handleValidationErrors,
];

export const validateUpdateAppointment: ValidationMiddleware[] = [
  body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date')
    .custom((val) => {
      if (!val) return true;
      const parts = String(val).split('T')[0].split('-');
      if (parts.length === 3) {
        const appointmentDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (appointmentDate < today) {
          throw new Error('Appointment date cannot be in the past');
        }
      }
      return true;
    }),
  body('time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5]\d(\s*(AM|PM|am|pm))?$/i)
    .withMessage('Time must be in valid format (e.g. 10:00 or 10:00 AM)'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  handleValidationErrors,
];
