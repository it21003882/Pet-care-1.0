/**
 * utils/generateToken.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/utils/generateToken.ts
 * ─────────────────────────────────────────────────────────────
 */

import jwt from 'jsonwebtoken';
import { UserRole } from '../types/models';

/**
 * Generate a signed JWT for a user.
 * @param userId - MongoDB ObjectId string of the user
 * @param role   - User role ('owner' | 'veterinarian' | 'admin')
 * @returns Signed JWT string
 */
const generateToken = (userId: string, role: UserRole): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

  return jwt.sign(
    { id: userId, role },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any }
  );
};

export default generateToken;
