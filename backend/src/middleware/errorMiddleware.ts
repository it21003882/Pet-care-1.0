/// <reference types="node" />
/**
 * middleware/errorMiddleware.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/middleware/errorMiddleware.ts
 * ─────────────────────────────────────────────────────────────
 *
 * Purpose:
 *   Global Express error handler. Catches all unhandled errors
 *   and returns a typed, consistent JSON error response.
 *   Must be registered LAST in server.ts after all routes.
 * ─────────────────────────────────────────────────────────────
 */

import { Request, Response, NextFunction } from 'express';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

interface MongooseValidationError extends Error {
  errors: Record<string, { message: string }>;
}

interface MulterError extends Error {
  code?: string;
}

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode ?? 500;
  let message = err.message ?? 'Internal Server Error';

  // Mongoose: Invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID.';
  }

  // Mongoose: Validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    const validationErr = err as MongooseValidationError;
    message = Object.values(validationErr.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // MongoDB: Duplicate key
  const mongoErr = err as MongoError;
  if (mongoErr.code === 11000 && mongoErr.keyValue) {
    statusCode = 409;
    const field = Object.keys(mongoErr.keyValue)[0];
    message = `Duplicate value: ${field} already exists.`;
  }

  // Multer: File upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    const multerErr = err as MulterError;
    message =
      multerErr.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Maximum file size is 5MB.'
        : err.message;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please login again.';
  }

  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    console.error('🔥 ERROR:', err);
  }

  res.status(statusCode).json({ success: false, message });
};

export const notFound = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Not Found — ${req.originalUrl}`,
  });
};
