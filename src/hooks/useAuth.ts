import { create } from 'zustand';
import { AuthState } from '@/types/auth';
import { getStoredToken, parseJWT, removeStoredToken, setStoredToken } from '@/lib/auth';

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  profile: null,
  isLoggedIn: false,

  login: (token: string, userPayload) => {
    setStoredToken(token);
    const decoded = userPayload || parseJWT(token);
    set({
      token,
      user: decoded,
      isLoggedIn: true,
    });
  },

  logout: () => {
    removeStoredToken();
    set({
      token: null,
      user: null,
      profile: null,
      isLoggedIn: false,
    });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  syncFromStorage: () => {
    const token = getStoredToken();
    if (token) {
      const decoded = parseJWT(token);
      if (decoded) {
        set({
          token,
          user: decoded,
          isLoggedIn: true,
        });
      } else {
        removeStoredToken();
      }
    }
  },
}));
