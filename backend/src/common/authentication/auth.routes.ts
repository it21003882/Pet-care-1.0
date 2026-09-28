/**
 * common/authentication/auth.routes.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/common/authentication/auth.routes.ts
 * Owner: Common Group Function — Authentication
 * ─────────────────────────────────────────────────────────────
 *
 * Mounted at: /api/auth (in server.ts)
 * ─────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { register, login, getMe, updateMe, getUsers, setUserStatus, setUserRole, verifyDoctor } from './auth.controller';
import { validateRegister, validateLogin, validateProfileUpdate } from './auth.validation';
import { protect } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/roleMiddleware';
import { uploadSingle } from '../../middleware/uploadMiddleware';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected user routes
router.get('/me', protect, getMe);
router.put('/me', protect, uploadSingle('profileImage'), validateProfileUpdate, updateMe);

// Admin-only User & Role Management routes
router.get('/users', protect, authorize('admin'), getUsers);
router.patch('/users/:id/status', protect, authorize('admin'), setUserStatus);
router.patch('/users/:id/role', protect, authorize('admin'), setUserRole);
router.patch('/users/:id/verify-doctor', protect, authorize('admin'), verifyDoctor);

export default router;
