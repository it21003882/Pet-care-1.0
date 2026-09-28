/**
 * context/AuthContext.tsx
 * Authentication Context and Provider
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser } from '../types/models';
import { LoginPayload, RegisterPayload } from '../types/api';
import authService from '../services/authService';
import storage from '../utils/storage';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (credentials: RegisterPayload) => Promise<import('../types/api').AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUser();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        // Silently verify or refresh user profile from server
        authService.getMe().then(setUser).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to load stored auth session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const login = async (credentials: LoginPayload): Promise<void> => {
    const authData = await authService.login(credentials);
    setUser(authData.user);
    setToken(authData.token);
  };

  const register = async (credentials: RegisterPayload): Promise<import('../types/api').AuthResponse> => {
    const authData = await authService.register(credentials);
    if (authData.token) {
      setUser(authData.user);
      setToken(authData.token);
    }
    return authData;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const updatedUser = await authService.getMe();
      setUser(updatedUser);
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
