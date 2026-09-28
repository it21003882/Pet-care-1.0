/**
 * app.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/app.ts
 * ─────────────────────────────────────────────────────────────
 * Express application configuration and route registration.
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

// Route Imports
import authRoutes from './common/authentication/auth.routes';
import petRoutes from './functions/function1-pets/pet.routes';
import veterinarianRoutes from './functions/function2-veterinarians/veterinarian.routes';
import appointmentRoutes from './functions/function3-appointments/appointment.routes';
import medicalRecordRoutes from './functions/function4-medical-records/medicalRecord.routes';
import serviceRoutes from './functions/function5-services/service.routes';
import serviceBookingRoutes from './functions/function6-bookings-reviews/serviceBooking.routes';
import reviewRoutes from './functions/function6-bookings-reviews/review.routes';

// Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware';

const app: Application = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploaded files if uploads directory is used
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'PetCare API is active and healthy.',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/veterinarians', veterinarianRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-bookings', serviceBookingRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 & Error Handler
app.use(notFound);
app.use(errorHandler);

export default app;
