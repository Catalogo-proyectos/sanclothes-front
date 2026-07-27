/**
 * Auth State & JWT Types.
 */

import { CustomerProfile } from './api';

export interface DecodedJWTPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthState {
  token: string | null;
  user: DecodedJWTPayload | null;
  profile: CustomerProfile | null;
  isLoggedIn: boolean;
  login: (token: string, user?: DecodedJWTPayload) => void;
  logout: () => void;
  setProfile: (profile: CustomerProfile) => void;
  syncFromStorage: () => void;
}
