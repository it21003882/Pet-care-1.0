/**
 * functions/function3-appointments/appointment.routes.ts
 * Owner: Function 3 — Appointment Management
 * Mounted at: /api/appointments
 */

import { Router } from 'express';
import { createAppointment, getAppointments, getAppointment, updateAppointment, deleteAppointment } from './appointment.controller';
import { validateCreateAppointment, validateUpdateAppointment } from './appointment.validation';
import { protect } from '../../middleware/authMiddleware';

const router = Router();
router.use(protect);

router.post('/', validateCreateAppointment, createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.put('/:id', validateUpdateAppointment, updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
