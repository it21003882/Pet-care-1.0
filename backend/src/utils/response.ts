/**
 * utils/response.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/utils/response.ts
 * ─────────────────────────────────────────────────────────────
 *
 * Purpose:
 *   Typed API response helpers. All controllers use these
 *   to ensure consistent JSON response shapes.
 * ─────────────────────────────────────────────────────────────
 */

import { Response } from 'express';

interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Send a standardized success response.
 */
export const sendSuccess = <T = unknown>(
  res: Response,
  statusCode: number,
  message: string,
  data: T | null = null,
  count: number | null = null
): Response => {
  const response: Record<string, unknown> = {
    success: true,
    message,
  };

  if (data !== null) response.data = data;
  if (count !== null) response.count = count;

  return res.status(statusCode).json(response);
};

/**
 * Send a standardized error response.
 */
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors: ValidationErrorDetail[] | null = null
): Response => {
  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (errors !== null) response.errors = errors;

  return res.status(statusCode).json(response);
};
