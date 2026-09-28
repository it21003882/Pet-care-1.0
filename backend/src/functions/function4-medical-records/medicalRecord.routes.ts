/**
 * functions/function4-medical-records/medicalRecord.routes.ts
 * Owner: Function 4 — Medical Record Management
 * Mounted at: /api/medical-records
 */

import { Router } from 'express';
import { createMedicalRecord, getMedicalRecords, getMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from './medicalRecord.controller';
import { validateCreateMedicalRecord, validateUpdateMedicalRecord } from './medicalRecord.validation';
import { protect } from '../../middleware/authMiddleware';
import { authorize } from '../../middleware/roleMiddleware';

const router = Router();
router.use(protect);

router.post('/', authorize('veterinarian', 'admin'), validateCreateMedicalRecord, createMedicalRecord);
router.get('/', getMedicalRecords);
router.get('/:id', getMedicalRecord);
router.put('/:id', authorize('veterinarian', 'admin'), validateUpdateMedicalRecord, updateMedicalRecord);
router.delete('/:id', authorize('veterinarian', 'admin'), deleteMedicalRecord);

export default router;
