/**
 * utils/storage.ts
 * AsyncStorage wrapper for Auth Token and User data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../constants/config';
import { IUser } from '../types/models';

export const storage = {
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(config.tokenKey, token);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(config.tokenKey);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(config.tokenKey);
  },

  async saveUser(user: IUser): Promise<void> {
    await AsyncStorage.setItem(config.userKey, JSON.stringify(user));
  },

  async getUser(): Promise<IUser | null> {
    const userStr = await AsyncStorage.getItem(config.userKey);
    return userStr ? JSON.parse(userStr) : null;
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(config.userKey);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([config.tokenKey, config.userKey]);
  },
};

export default storage;
