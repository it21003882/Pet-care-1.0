/**
 * common/authentication/auth.service.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/common/authentication/auth.service.ts
 * Owner: Common Group Function — Authentication
 * ─────────────────────────────────────────────────────────────
 */

import User from './user.model';
import generateToken from '../../utils/generateToken';
import VeterinarianModel from '../../functions/function2-veterinarians/veterinarian.model';
import ServiceCenterModel from '../../functions/function5-services/serviceCenter.model';
import { AuthPayload, IUser, IUserResponse, UserRole } from '../../types/models';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  regNo?: string;
}

interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

const toUserResponse = (user: IUser): IUserResponse => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive !== false,
  isVerified: user.isVerified !== false,
  regNo: user.regNo || null,
  profileImage: user.profileImage,
  createdAt: user.createdAt,
});

export const registerUser = async (userData: RegisterInput): Promise<AuthPayload> => {
  const { name, email, password, phone, role, regNo } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = Object.assign(new Error('An account with this email already exists.'), { statusCode: 409 });
    throw error;
  }

  const normalizedRole = role ? (role as string).toLowerCase() : 'owner';
  const isDoctor = normalizedRole === 'veterinarian';

  const user = await User.create({
    name,
    email,
    password,
    phone: phone ?? null,
    role: role ?? 'owner',
    isActive: true,
    isVerified: !isDoctor, // Doctors require admin verification
    regNo: isDoctor && regNo ? regNo.trim() : null,
  });

  if (isDoctor) {
    try {
      await VeterinarianModel.create({
        userId: user._id,
        name: user.name,
        specialization: 'General Veterinary Care',
        regNo: regNo ? regNo.trim() : null,
        phone: user.phone || null,
        email: user.email,
        isVerified: false,
      });
    } catch (e) {
      console.error('Failed to create default Veterinarian profile:', e);
    }

    // Doctors cannot log in until verified by admin
    return {
      user: toUserResponse(user),
      token: '',
      pendingVerification: true,
      message: 'Doctor registration submitted. Please wait for admin verification before logging in. Contact admin at admin@gmail.com, no-0770101999.',
    };
  }

  if (normalizedRole === 'service_center') {
    try {
      await ServiceCenterModel.create({
        userId: user._id,
        name: user.name,
        phone: user.phone || '000-000-0000',
        email: user.email,
        address: 'Please update your address',
        city: 'City',
      });
    } catch (e) {
      console.error('Failed to create default ServiceCenter profile:', e);
    }
  }

  const token = generateToken(user._id.toString(), user.role);
  return { user: toUserResponse(user), token };
};

export const loginUser = async (email: string, password: string): Promise<AuthPayload> => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  if (user.isActive === false) {
    throw Object.assign(
      new Error('Your account has been deactivated. Please contact an administrator.'),
      { statusCode: 403 }
    );
  }

  // Doctor verification check
  const normalizedRole = (user.role as string).toLowerCase();
  if (normalizedRole === 'veterinarian' && user.isVerified === false) {
    throw Object.assign(
      new Error('Your account is pending verification. Please wait for admin verification before signing in. Contact admin at admin@gmail.com, no-0770101999.'),
      { statusCode: 403 }
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }

  const token = generateToken(user._id.toString(), user.role);
  return { user: toUserResponse(user), token };
};

export const getCurrentUser = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }
  return user;
};

export const updateUserProfile = async (
  userId: string,
  updateData: UpdateProfileInput,
  imageUrl: string | null = null
): Promise<IUser> => {
  const allowedUpdates: Record<string, unknown> = {};

  if (updateData.name) allowedUpdates.name = updateData.name;
  if (updateData.phone) allowedUpdates.phone = updateData.phone;
  if (imageUrl) allowedUpdates.profileImage = imageUrl;

  const user = await User.findByIdAndUpdate(userId, allowedUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  return user;
};

// ─── Admin User & Role Management ────────────────────────────

export const getAllUsers = async (): Promise<IUserResponse[]> => {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(toUserResponse);
};

export const toggleUserStatus = async (
  targetUserId: string,
  isActive: boolean,
  adminId: string
): Promise<IUserResponse> => {
  if (targetUserId === adminId) {
    throw Object.assign(new Error('Admins cannot deactivate their own account.'), { statusCode: 400 });
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { isActive },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  return toUserResponse(user);
};

export const updateUserRole = async (
  targetUserId: string,
  role: UserRole,
  adminId: string
): Promise<IUserResponse> => {
  if (targetUserId === adminId && role !== 'admin') {
    throw Object.assign(new Error('Admins cannot demote their own account role.'), { statusCode: 400 });
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  return toUserResponse(user);
};

export const setDoctorVerification = async (
  targetUserId: string,
  isVerified: boolean
): Promise<IUserResponse> => {
  const user = await User.findByIdAndUpdate(
    targetUserId,
    { isVerified },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  try {
    await VeterinarianModel.findOneAndUpdate({ userId: targetUserId }, { isVerified });
  } catch (e) {
    console.error('Failed to update Veterinarian verification status:', e);
  }

  return toUserResponse(user);
};

