/**
 * functions/function2-veterinarians/veterinarian.routes.ts
 * Owner: Function 2 — Veterinarian Management
 * Mounted at: /api/veterinarians
 */

import { Router } from 'express';
import { createVeterinarian, getVeterinarians, getVeterinarian, getMyVeterinarianProfile, updateVeterinarian, deleteVeterinarian } from './veterinarian.controller';
import { validateCreateVeterinarian, validateUpdateVeterinarian } from './veterinarian.validation';
import { protect } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/roleMiddleware';
import { uploadSingle } from '../../middleware/uploadMiddleware';

const router = Router();

router.get('/', getVeterinarians);
router.get('/me', protect, authorize('veterinarian'), getMyVeterinarianProfile);
router.get('/:id', getVeterinarian);
router.post('/', protect, authorize('veterinarian', 'admin'), uploadSingle('profileImage'), validateCreateVeterinarian, createVeterinarian);
router.put('/:id', protect, authorize('veterinarian', 'admin'), uploadSingle('profileImage'), validateUpdateVeterinarian, updateVeterinarian);
router.delete('/:id', protect, authorize('admin'), deleteVeterinarian);

export default router;
