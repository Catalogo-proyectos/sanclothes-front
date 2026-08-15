import { create } from 'zustand';
import { AuthState } from '@/types/auth';
import { getStoredToken, parseJWT, removeStoredToken, setStoredToken } from '@/lib/auth';

const AVATAR_KEY = 'sant_avatar_url';

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  profile: null,
  isLoggedIn: false,
  avatarUrl: null,

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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AVATAR_KEY);
    }
    set({
      token: null,
      user: null,
      profile: null,
      isLoggedIn: false,
      avatarUrl: null,
    });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  setAvatarUrl: (url: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AVATAR_KEY, url);
    }
    set({ avatarUrl: url });
  },

  syncFromStorage: () => {
    const token = getStoredToken();
    if (token) {
      const decoded = parseJWT(token);
      if (decoded) {
        const avatarUrl = typeof window !== 'undefined'
          ? localStorage.getItem(AVATAR_KEY)
          : null;
        set({
          token,
          user: decoded,
          isLoggedIn: true,
          avatarUrl,
        });
      } else {
        removeStoredToken();
      }
    }
  },
}));
