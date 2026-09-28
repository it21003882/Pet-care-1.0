/**
 * functions/function1-pets/pet.controller.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/functions/function1-pets/pet.controller.ts
 * Owner: Function 1 — Pet Management
 * ─────────────────────────────────────────────────────────────
 */

import { Request, Response, NextFunction } from 'express';
import * as petService from './pet.service';
import { sendSuccess } from '../../utils/response';

export const createPet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // If user uploaded a photo, store local file path reference; otherwise null
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || null);
    const pet = await petService.createPet(req.body, req.user!.id, imageUrl);
    sendSuccess(res, 201, 'Pet created successfully.', pet);
  } catch (error) {
    next(error);
  }
};

export const getPets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pets = await petService.getPetsByOwner(req.user!.id);
    sendSuccess(res, 200, 'Pets retrieved successfully.', pets, pets.length);
  } catch (error) {
    next(error);
  }
};

export const getPet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pet = await petService.getPetById(req.params.id, req.user!.id, req.user!.role);
    sendSuccess(res, 200, 'Pet retrieved successfully.', pet);
  } catch (error) {
    next(error);
  }
};

export const updatePet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // If a new photo file was attached, store its path; otherwise keep existing or accept updated URL
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl !== undefined ? req.body.imageUrl : null);
    const pet = await petService.updatePet(req.params.id, req.body, req.user!.id, imageUrl);
    sendSuccess(res, 200, 'Pet updated successfully.', pet);
  } catch (error) {
    next(error);
  }
};

export const deletePet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await petService.deletePet(req.params.id, req.user!.id);
    sendSuccess(res, 200, 'Pet deleted successfully.');
  } catch (error) {
    next(error);
  }
};
