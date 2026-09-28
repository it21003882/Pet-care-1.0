/**
 * middleware/authMiddleware.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/middleware/authMiddleware.ts
 * ─────────────────────────────────────────────────────────────
 *
 * Purpose:
 *   JWT Authentication Middleware.
 *   Verifies the Bearer token and attaches decoded user
 *   payload to req.user (typed via src/types/express.d.ts).
 * ─────────────────────────────────────────────────────────────
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';
import { JwtPayload } from '../types/models';
import User from '../common/authentication/user.model';

/**
 * Middleware: Verify JWT and attach active user to req.
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    sendError(res, 401, 'Access denied. No token provided.');
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    sendError(res, 500, 'Server configuration error.');
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select('isActive role');
    if (!user) {
      sendError(res, 401, 'User belonging to this token no longer exists.');
      return;
    }

    if (user.isActive === false) {
      sendError(res, 403, 'Your account has been deactivated. Please contact support.');
      return;
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch {
    sendError(res, 401, 'Invalid or expired token. Please login again.');
  }
};
