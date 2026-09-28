/**
 * functions/function1-pets/pet.routes.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/functions/function1-pets/pet.routes.ts
 * Owner: Function 1 — Pet Management
 * ─────────────────────────────────────────────────────────────
 *
 * Mounted at: /api/pets (in server.ts)
 * All routes require authentication.
 * ─────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { createPet, getPets, getPet, updatePet, deletePet } from './pet.controller';
import { validateCreatePet, validateUpdatePet } from './pet.validation';
import { protect } from '../../middleware/authMiddleware';
import { uploadSingle } from '../../middleware/uploadMiddleware';

import { authorize } from '../../middleware/roleMiddleware';

const router = Router();

router.use(protect);

router.post('/', authorize('owner', 'customer'), uploadSingle('image'), validateCreatePet, createPet);
router.get('/', getPets);
router.get('/:id', getPet);
router.put('/:id', uploadSingle('image'), validateUpdatePet, updatePet);
router.delete('/:id', deletePet);

export default router;
