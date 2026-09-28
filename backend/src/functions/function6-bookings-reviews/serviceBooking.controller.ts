/**
 * functions/function6-bookings-reviews/serviceBooking.controller.ts
 * Owner: Function 6 — Service Bookings & Reviews
 */

import { Request, Response, NextFunction } from 'express';
import * as bookingService from './serviceBooking.service';
import { sendSuccess } from '../../utils/response';
import { BookingStatus } from '../../types/models';

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await bookingService.createBooking(req.body, req.user!.id);
    sendSuccess(res, 201, 'Service booking created successfully.', booking);
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookings = await bookingService.getBookings(req.user!.id, req.user!.role, req.query as bookingService.BookingQuery);
    sendSuccess(res, 200, 'Bookings retrieved successfully.', bookings, bookings.length);
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user!.id, req.user!.role);
    sendSuccess(res, 200, 'Booking retrieved successfully.', booking);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body as { status: BookingStatus };
    const booking = await bookingService.updateBookingStatus(req.params.id, status, req.user!.id, req.user!.role);
    sendSuccess(res, 200, 'Booking status updated successfully.', booking);
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await bookingService.deleteBooking(req.params.id, req.user!.id, req.user!.role);
    sendSuccess(res, 200, 'Booking deleted successfully.');
  } catch (error) {
    next(error);
  }
};
