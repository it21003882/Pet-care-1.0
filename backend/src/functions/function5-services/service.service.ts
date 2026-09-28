/**
 * functions/function5-services/service.service.ts
 * Owner: Function 5 — Pet-Care Service Management
 */

import Service from './service.model';
import ServiceCenter from './serviceCenter.model';
import User from '../../common/authentication/user.model';
import { IService, IServiceCenter, ServiceCategory } from '../../types/models';

export interface CreateServiceInput {
  name: string;
  description?: string;
  category: ServiceCategory;
  price: number;
  duration?: number;
  provider?: string;
  availability?: boolean;
}

export interface ServiceQuery {
  search?: string;
  category?: string;
  available?: string;
  serviceCenterId?: string;
}

export interface UpdateServiceCenterInput {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
}

/**
 * Find or auto-initialize ServiceCenter profile for a user
 */
export const getOrCreateServiceCenter = async (userId: string): Promise<IServiceCenter> => {
  let center = await ServiceCenter.findOne({ userId });
  if (!center) {
    const user = await User.findById(userId);
    if (!user) throw Object.assign(new Error('User not found.'), { statusCode: 404 });

    center = await ServiceCenter.create({
      userId: user._id,
      name: user.name || 'Pet-Care Service Center',
      phone: user.phone || '000-000-0000',
      email: user.email,
      address: 'Address not specified',
      city: 'City',
      openingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
    });
  }
  return center;
};

export const getMyServiceCenterProfile = async (userId: string): Promise<IServiceCenter> => {
  return getOrCreateServiceCenter(userId);
};

export const updateMyServiceCenterProfile = async (
  userId: string,
  updateData: UpdateServiceCenterInput,
  imageUrl: string | null = null
): Promise<IServiceCenter> => {
  const center = await getOrCreateServiceCenter(userId);

  const updates: Record<string, unknown> = { ...updateData };
  if (imageUrl) updates.profileImage = imageUrl;

  const updatedCenter = await ServiceCenter.findByIdAndUpdate(center._id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedCenter) throw Object.assign(new Error('Service center not found.'), { statusCode: 404 });

  // If business name was changed, sync provider field on their services
  if (updateData.name) {
    await Service.updateMany({ serviceCenterId: center._id }, { provider: updateData.name });
  }

  return updatedCenter;
};

export const getServiceCenterById = async (centerId: string): Promise<IServiceCenter> => {
  const center = await ServiceCenter.findById(centerId);
  if (!center) throw Object.assign(new Error('Service center not found.'), { statusCode: 404 });
  return center;
};

export const createService = async (
  data: CreateServiceInput,
  userId: string,
  imageUrl: string | null = null
): Promise<IService> => {
  const center = await getOrCreateServiceCenter(userId);

  const service = await Service.create({
    ...data,
    serviceCenterId: center._id,
    provider: center.name,
    image: imageUrl,
  });

  return service;
};

export const getAllServices = async (query: ServiceQuery = {}): Promise<IService[]> => {
  const filter: Record<string, unknown> = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.category) filter.category = query.category;
  if (query.available !== undefined) filter.availability = query.available === 'true';
  if (query.serviceCenterId) filter.serviceCenterId = query.serviceCenterId;

  return Service.find(filter)
    .populate('serviceCenterId', 'name phone email website address city location latitude longitude openingHours profileImage')
    .sort({ createdAt: -1 });
};

export const getMyServices = async (userId: string): Promise<IService[]> => {
  const center = await getOrCreateServiceCenter(userId);
  return Service.find({ serviceCenterId: center._id }).sort({ createdAt: -1 });
};

export const getServiceById = async (serviceId: string): Promise<IService> => {
  const service = await Service.findById(serviceId).populate(
    'serviceCenterId',
    'name phone email website address city location latitude longitude openingHours profileImage'
  );
  if (!service) throw Object.assign(new Error('Service not found.'), { statusCode: 404 });
  return service;
};

export const updateService = async (
  serviceId: string,
  updateData: Partial<CreateServiceInput>,
  userId: string,
  imageUrl: string | null = null
): Promise<IService> => {
  const service = await Service.findById(serviceId);
  if (!service) throw Object.assign(new Error('Service not found.'), { statusCode: 404 });

  const center = await getOrCreateServiceCenter(userId);

  // Enforce ownership: serviceCenterId must match
  if (service.serviceCenterId && service.serviceCenterId.toString() !== center._id.toString()) {
    throw Object.assign(
      new Error('Access denied. You can only edit services belonging to your Service Center.'),
      { statusCode: 403 }
    );
  }

  const updates: Record<string, unknown> = { ...updateData };
  if (imageUrl) updates.image = imageUrl;

  const updated = await Service.findByIdAndUpdate(serviceId, updates, { new: true, runValidators: true });
  return updated as IService;
};

export const deleteService = async (serviceId: string, userId: string): Promise<void> => {
  const service = await Service.findById(serviceId);
  if (!service) throw Object.assign(new Error('Service not found.'), { statusCode: 404 });

  const center = await getOrCreateServiceCenter(userId);

  // Enforce ownership: serviceCenterId must match
  if (service.serviceCenterId && service.serviceCenterId.toString() !== center._id.toString()) {
    throw Object.assign(
      new Error('Access denied. You can only delete services belonging to your Service Center.'),
      { statusCode: 403 }
    );
  }

  await Service.findByIdAndDelete(serviceId);
};
