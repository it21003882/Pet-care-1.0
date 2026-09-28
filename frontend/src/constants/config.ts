/**
 * constants/config.ts
 * Application Configuration
 */

export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
  tokenKey: 'petcare_auth_token',
  userKey: 'petcare_auth_user',
};

export default config;
