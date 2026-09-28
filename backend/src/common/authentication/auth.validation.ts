/**
 * common/authentication/auth.validation.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/common/authentication/auth.validation.ts
 * Owner: Common Group Function — Authentication
 * ─────────────────────────────────────────────────────────────
 */

import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain, validationResult } from 'express-validator';
import { sendError } from '../../utils/response';

type ValidationMiddleware = ValidationChain | ((req: Request, res: Response, next: NextFunction) => void);

const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    sendError(
      res,
      400,
      'Validation failed. Please check your input.',
      errors.array().map((err) => ({ field: (err as { path: string }).path, message: err.msg as string }))
    );
    return;
  }

  next();
};

export const validateRegister: ValidationMiddleware[] = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .trim()
    .custom((val) => {
      const digitsOnly = String(val).replace(/\D/g, '');
      if (digitsOnly.length !== 10 || String(val).trim().length !== 10) {
        throw new Error('Phone number must be exactly 10 numbers');
      }
      return true;
    }),

  body('role')
    .optional()
    .custom((val) => {
      const allowed = ['owner', 'customer', 'veterinarian', 'service_center', 'admin'];
      if (!allowed.includes(String(val).toLowerCase())) {
        throw new Error('Role must be Customer, Veterinarian, Pet-Care Service Center, or Admin');
      }
      return true;
    }),

  body('regNo')
    .optional()
    .trim(),

  body().custom((reqBody) => {
    const role = String(reqBody.role || '').toLowerCase();
    if (role === 'veterinarian') {
      if (!reqBody.regNo || !String(reqBody.regNo).trim()) {
        throw new Error('Registration number (Reg. No) is required for veterinarians');
      }
    }
    return true;
  }),

  handleValidationErrors,
];

export const validateLogin: ValidationMiddleware[] = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors,
];

export const validateProfileUpdate: ValidationMiddleware[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('phone')
    .optional()
    .trim()
    .custom((val) => {
      if (!val) return true;
      const digitsOnly = String(val).replace(/\D/g, '');
      if (digitsOnly.length !== 10 || String(val).trim().length !== 10) {
        throw new Error('Phone number must be exactly 10 numbers');
      }
      return true;
    }),

  handleValidationErrors,
];
