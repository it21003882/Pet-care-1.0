/**
 * functions/function3-appointments/appointment.service.ts
 * Owner: Function 3 — Appointment Management
 */

import Appointment from './appointment.model';
import Veterinarian from '../function2-veterinarians/veterinarian.model';
import { IAppointment, UserRole } from '../../types/models';

interface CreateAppointmentInput {
  petId: string;
  veterinarianId: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
}

interface AppointmentQuery {
  status?: string;
  veterinarianId?: string;
}

export const createAppointment = async (
  data: CreateAppointmentInput,
  ownerId: string
): Promise<IAppointment> => {
  const appointment = await Appointment.create({ ...data, ownerId });
  await appointment.populate(['petId', 'veterinarianId']);
  return appointment;
};

export const getAppointments = async (
  userId: string,
  userRole: UserRole,
  query: AppointmentQuery = {}
): Promise<IAppointment[]> => {
  const filter: Record<string, unknown> = {};

  if (userRole === 'owner') {
    filter.ownerId = userId;
  } else if (userRole === 'veterinarian') {
    const vet = await Veterinarian.findOne({ userId });
    if (vet) {
      filter.veterinarianId = vet._id;
    }
  }

  if (query.veterinarianId) filter.veterinarianId = query.veterinarianId;
  if (query.status) filter.status = query.status;

  return Appointment.find(filter)
    .populate('petId', 'name species image imageUrl')
    .populate('veterinarianId', 'name specialization clinicName phone')
    .populate('ownerId', 'name email phone')
    .sort({ date: 1, time: 1 });
};

export const getAppointmentById = async (
  appointmentId: string,
  userId: string,
  userRole: UserRole
): Promise<IAppointment> => {
  const appointment = await Appointment.findById(appointmentId)
    .populate('petId', 'name species image imageUrl')
    .populate('veterinarianId', 'name specialization clinicName phone')
    .populate('ownerId', 'name email phone');

  if (!appointment) throw Object.assign(new Error('Appointment not found.'), { statusCode: 404 });

  const owner = appointment.ownerId as any;
  const ownerIdString = owner && owner._id ? owner._id.toString() : String(owner);

  if (userRole === 'owner' && ownerIdString !== userId.toString()) {
    throw Object.assign(new Error('You do not have permission to view this appointment.'), { statusCode: 403 });
  }

  if (userRole === 'veterinarian') {
    const vet = await Veterinarian.findOne({ userId });
    const vetObj = appointment.veterinarianId as any;
    const vetIdString = vetObj && vetObj._id ? vetObj._id.toString() : String(vetObj);
    if (!vet || vetIdString !== vet._id.toString()) {
      throw Object.assign(new Error('You do not have permission to view this appointment.'), { statusCode: 403 });
    }
  }

  return appointment;
};

export const updateAppointment = async (
  appointmentId: string,
  updateData: Partial<CreateAppointmentInput & { status: string }>,
  userId: string,
  userRole: UserRole
): Promise<IAppointment> => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw Object.assign(new Error('Appointment not found.'), { statusCode: 404 });

  if (userRole === 'owner' && appointment.ownerId.toString() !== userId) {
    throw Object.assign(new Error('You do not have permission to update this appointment.'), { statusCode: 403 });
  }

  if (userRole === 'veterinarian') {
    const vet = await Veterinarian.findOne({ userId });
    if (!vet || appointment.veterinarianId.toString() !== vet._id.toString()) {
      throw Object.assign(new Error('You do not have permission to update this appointment.'), { statusCode: 403 });
    }
  }

  const updated = await Appointment.findByIdAndUpdate(appointmentId, updateData, { new: true, runValidators: true })
    .populate(['petId', 'veterinarianId', 'ownerId']);

  return updated as IAppointment;
};

export const deleteAppointment = async (
  appointmentId: string,
  userId: string,
  userRole: UserRole
): Promise<void> => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw Object.assign(new Error('Appointment not found.'), { statusCode: 404 });

  if (userRole === 'owner' && appointment.ownerId.toString() !== userId) {
    throw Object.assign(new Error('You do not have permission to cancel this appointment.'), { statusCode: 403 });
  }

  await Appointment.findByIdAndDelete(appointmentId);
};
