/**
 * functions/function3-appointments/appointment.controller.ts
 * Owner: Function 3 — Appointment Management
 */

import { Request, Response, NextFunction } from 'express';
import * as appointmentService from './appointment.service';
import { sendSuccess } from '../../utils/response';

export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await appointmentService.createAppointment(req.body as Parameters<typeof appointmentService.createAppointment>[0], req.user!.id);
    sendSuccess(res, 201, 'Appointment booked successfully.', appointment);
  } catch (error) { next(error); }
};

export const getAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointments = await appointmentService.getAppointments(req.user!.id, req.user!.role, req.query as { status?: string; veterinarianId?: string });
    sendSuccess(res, 200, 'Appointments retrieved successfully.', appointments, appointments.length);
  } catch (error) { next(error); }
};

export const getAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id, req.user!.id, req.user!.role);
    sendSuccess(res, 200, 'Appointment retrieved successfully.', appointment);
  } catch (error) { next(error); }
};

export const updateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body as Partial<Parameters<typeof appointmentService.createAppointment>[0] & { status: string }>, req.user!.id, req.user!.role);
    sendSuccess(res, 200, 'Appointment updated successfully.', appointment);
  } catch (error) { next(error); }
};

export const deleteAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await appointmentService.deleteAppointment(req.params.id, req.user!.id, req.user!.role);
    sendSuccess(res, 200, 'Appointment cancelled successfully.');
  } catch (error) { next(error); }
};
