/**
 * functions/function2-veterinarians/veterinarian.controller.ts
 * Owner: Function 2 — Veterinarian Management
 */

import { Request, Response, NextFunction } from 'express';
import * as vetService from './veterinarian.service';
import { sendSuccess } from '../../utils/response';

export const createVeterinarian = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const imageUrl = req.file?.path ?? null;
    const vet = await vetService.createVeterinarian(req.body as Parameters<typeof vetService.createVeterinarian>[0], imageUrl);
    sendSuccess(res, 201, 'Veterinarian profile created successfully.', vet);
  } catch (error) { next(error); }
};

export const getVeterinarians = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vets = await vetService.getAllVeterinarians(req.query as { search?: string; specialization?: string; location?: string });
    sendSuccess(res, 200, 'Veterinarians retrieved successfully.', vets, vets.length);
  } catch (error) { next(error); }
};

export const getVeterinarian = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vet = await vetService.getVeterinarianById(req.params.id);
    sendSuccess(res, 200, 'Veterinarian retrieved successfully.', vet);
  } catch (error) { next(error); }
};

export const updateVeterinarian = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const imageUrl = req.file?.path ?? null;
    const vet = await vetService.updateVeterinarian(req.params.id, req.body as Partial<Parameters<typeof vetService.createVeterinarian>[0]>, req.user!.id, req.user!.role, imageUrl);
    sendSuccess(res, 200, 'Veterinarian updated successfully.', vet);
  } catch (error) { next(error); }
};

export const getMyVeterinarianProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vet = await vetService.getMyVeterinarianProfile(req.user!.id);
    sendSuccess(res, 200, 'Veterinarian profile retrieved successfully.', vet);
  } catch (error) { next(error); }
};

export const deleteVeterinarian = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await vetService.deleteVeterinarian(req.params.id);
    sendSuccess(res, 200, 'Veterinarian deleted successfully.');
  } catch (error) { next(error); }
};
