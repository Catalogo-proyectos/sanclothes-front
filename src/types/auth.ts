

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
  user: DecodedJWTPayload | null;
  profile: CustomerProfile | null;
  isLoggedIn: boolean;

  avatarUrl: string | null;
  
  login: (user: DecodedJWTPayload, csrfToken?: string | null) => void;
  logout: () => void;
  setProfile: (profile: CustomerProfile) => void;
  setAvatarUrl: (url: string) => void;
  
  syncFromStorage: () => Promise<void>;
}
