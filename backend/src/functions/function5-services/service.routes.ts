/**
 * functions/function5-services/service.routes.ts
 * Owner: Function 5 — Pet-Care Service Management
 * Mounted at: /api/services
 */

import { Router } from 'express';
import {
  createService,
  getServices,
  getMyServices,
  getService,
  updateService,
  deleteService,
  getMyCenterProfile,
  updateMyCenterProfile,
  getCenterById,
} from './service.controller';
import {
  validateCreateService,
  validateUpdateService,
  validateUpdateCenterProfile,
} from './service.validation';
import { protect } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/roleMiddleware';
import { uploadSingle } from '../../middleware/uploadMiddleware';

const router = Router();

// Public service listing
router.get('/', getServices);

// Service Center Profile routes (Must be defined before /:id)
router.get('/center/me', protect, authorize('service_center'), getMyCenterProfile);
router.put(
  '/center/me',
  protect,
  authorize('service_center'),
  uploadSingle('profileImage'),
  validateUpdateCenterProfile,
  updateMyCenterProfile
);
router.get('/center/my-services', protect, authorize('service_center'), getMyServices);
router.get('/center/:id', getCenterById);

// Public single service retrieval
router.get('/:id', getService);

// Strict business rule: ONLY authenticated Pet-Care Service Centers can create/edit/delete services
router.post(
  '/',
  protect,
  authorize('service_center'),
  uploadSingle('image'),
  validateCreateService,
  createService
);

router.put(
  '/:id',
  protect,
  authorize('service_center'),
  uploadSingle('image'),
  validateUpdateService,
  updateService
);

router.delete('/:id', protect, authorize('service_center'), deleteService);

export default router;
