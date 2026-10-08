

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
  /** M5: la sesión ya está en la cookie httpOnly; acá solo llegan los datos para la UI y el CSRF. */
  login: (user: DecodedJWTPayload, csrfToken?: string | null) => void;
  logout: () => void;
  setProfile: (profile: CustomerProfile) => void;
  setAvatarUrl: (url: string) => void;
  /** Restaura la sesión (y migra la del storefront anterior). */
  syncFromStorage: () => Promise<void>;
}
