/**
 * common/authentication/auth.controller.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/common/authentication/auth.controller.ts
 * Owner: Common Group Function — Authentication
 * ─────────────────────────────────────────────────────────────
 */

import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { sendSuccess } from '../../utils/response';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body as {
      name: string;
      email: string;
      password: string;
      phone?: string;
      role?: import('../../types/models').UserRole;
      regNo?: string;
    });
    const message = result.pendingVerification
      ? 'Doctor registration submitted. Please wait for admin verification before logging in.'
      : 'Account created successfully.';
    sendSuccess(res, 201, message, result);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { user, token } = await authService.loginUser(email, password);
    sendSuccess(res, 200, 'Login successful.', { user, token });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    sendSuccess(res, 200, 'User profile retrieved successfully.', user);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const imageUrl = req.file?.path ?? null;
    const user = await authService.updateUserProfile(req.user!.id, req.body as { name?: string; phone?: string }, imageUrl);
    sendSuccess(res, 200, 'Profile updated successfully.', user);
  } catch (error) {
    next(error);
  }
};

// ─── Admin Controller Handlers ────────────────────────────────

export const getUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await authService.getAllUsers();
    sendSuccess(res, 200, 'All registered users retrieved successfully.', users);
  } catch (error) {
    next(error);
  }
};

export const setUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body as { isActive: boolean };
    const updatedUser = await authService.toggleUserStatus(id, Boolean(isActive), req.user!.id);
    sendSuccess(
      res,
      200,
      `User account ${isActive ? 'activated' : 'deactivated'} successfully.`,
      updatedUser
    );
  } catch (error) {
    next(error);
  }
};

export const setUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role: import('../../types/models').UserRole };
    const updatedUser = await authService.updateUserRole(id, role, req.user!.id);
    sendSuccess(res, 200, `User role updated to ${role} successfully.`, updatedUser);
  } catch (error) {
    next(error);
  }
};

export const verifyDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body as { isVerified?: boolean };
    const updatedUser = await authService.setDoctorVerification(id, isVerified !== false);
    sendSuccess(
      res,
      200,
      `Doctor account has been ${isVerified !== false ? 'verified' : 'unverified'} successfully.`,
      updatedUser
    );
  } catch (error) {
    next(error);
  }
};
