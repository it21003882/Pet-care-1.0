/**
 * middleware/roleMiddleware.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/middleware/roleMiddleware.ts
 * ─────────────────────────────────────────────────────────────
 *
 * Purpose:
 *   Role-based authorization middleware factory.
 *   Returns a typed Express middleware function that checks
 *   req.user.role against the allowed roles list.
 *   Must be used AFTER protect middleware.
 * ─────────────────────────────────────────────────────────────
 */

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { UserRole } from '../types/models';

export const normalizeRole = (role: string): string => {
  const r = role.toLowerCase();
  if (r === 'customer' || r === 'owner') return 'customer';
  return r;
};

/**
 * Middleware factory: Restrict route to specific roles.
 * @param roles - One or more allowed UserRole values
 */
export const authorize = (...roles: UserRole[]) => {
  const normalizedAllowed = roles.map(r => normalizeRole(r));

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'Authentication required.');
      return;
    }

    const userNormalized = normalizeRole(req.user.role);

    if (!normalizedAllowed.includes(userNormalized)) {
      sendError(
        res,
        403,
        `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
      );
      return;
    }

    next();
  };
};
