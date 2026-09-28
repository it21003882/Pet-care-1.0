/**
 * functions/function5-services/service.controller.ts
 * Owner: Function 5 — Pet-Care Service Management
 */

import { Request, Response, NextFunction } from 'express';
import * as serviceService from './service.service';
import { sendSuccess } from '../../utils/response';

export const createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const imageUrl = req.file?.path ?? null;
    const service = await serviceService.createService(req.body, req.user!.id, imageUrl);
    sendSuccess(res, 201, 'Pet-care service created successfully.', service);
  } catch (error) {
    next(error);
  }
};

export const getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const services = await serviceService.getAllServices(req.query as serviceService.ServiceQuery);
    sendSuccess(res, 200, 'Services retrieved successfully.', services, services.length);
  } catch (error) {
    next(error);
  }
};

export const getMyServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const services = await serviceService.getMyServices(req.user!.id);
    sendSuccess(res, 200, 'Your services retrieved successfully.', services, services.length);
  } catch (error) {
    next(error);
  }
};

export const getService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    sendSuccess(res, 200, 'Service retrieved successfully.', service);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const imageUrl = req.file?.path ?? null;
    const service = await serviceService.updateService(req.params.id, req.body, req.user!.id, imageUrl);
    sendSuccess(res, 200, 'Service updated successfully.', service);
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await serviceService.deleteService(req.params.id, req.user!.id);
    sendSuccess(res, 200, 'Service deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const getMyCenterProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const center = await serviceService.getMyServiceCenterProfile(req.user!.id);
    sendSuccess(res, 200, 'Service center profile retrieved successfully.', center);
  } catch (error) {
    next(error);
  }
};

export const updateMyCenterProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const imageUrl = req.file?.path ?? null;
    const center = await serviceService.updateMyServiceCenterProfile(req.user!.id, req.body, imageUrl);
    sendSuccess(res, 200, 'Service center profile updated successfully.', center);
  } catch (error) {
    next(error);
  }
};

export const getCenterById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const center = await serviceService.getServiceCenterById(req.params.id);
    sendSuccess(res, 200, 'Service center details retrieved successfully.', center);
  } catch (error) {
    next(error);
  }
};
