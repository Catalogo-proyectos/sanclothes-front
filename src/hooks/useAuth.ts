import { create } from 'zustand';
import { AuthState, DecodedJWTPayload } from '@/types/auth';
import { config } from '@/lib/config';
import {
  clearStoredSession,
  getStoredSession,
  parseJWT,
  readLegacyStoredToken,
  removeLegacyStoredToken,
  setStoredSession,
} from '@/lib/auth';
import { SESSION_EXPIRED_EVENT } from '@/lib/api';

const AVATAR_KEY = 'sant_avatar_url';

const readAvatar = () => (typeof window !== 'undefined' ? localStorage.getItem(AVATAR_KEY) : null);

async function migrateLegacySession(token: string): Promise<void> {
  const decoded = parseJWT(token);
  const expired = !decoded?.exp || decoded.exp * 1000 <= Date.now();
  if (!decoded || expired) {
    removeLegacyStoredToken();
    if (decoded && !expired) setStoredSession(decoded);
    return;
  }
  try {
    const res = await fetch(`${config.api.baseUrl}/auth/session/migrate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { csrfToken?: string };
      setStoredSession(decoded, data.csrfToken);
      removeLegacyStoredToken();
    } else if (res.status === 401 || res.status === 403) {
      removeLegacyStoredToken();
    }

  } catch {

  }
}

let syncPromise: Promise<void> | null = null;

export const useAuth = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoggedIn: false,
  avatarUrl: null,

  login: (user: DecodedJWTPayload, csrfToken?: string | null) => {
    removeLegacyStoredToken();
    setStoredSession(user, csrfToken);
    set({
      user,
      isLoggedIn: true,
    });
  },

  logout: () => {

    void fetch(`${config.api.baseUrl}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    clearStoredSession();
    removeLegacyStoredToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AVATAR_KEY);
    }
    set({
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

    syncPromise ??= (async () => {
      const legacy = readLegacyStoredToken();
      if (legacy) await migrateLegacySession(legacy);
    })().finally(() => {
      syncPromise = null;
    });
    return syncPromise.then(() => {
      const user = getStoredSession();
      set(user ? { user, isLoggedIn: true, avatarUrl: readAvatar() } : { user: null, isLoggedIn: false });
    });
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    useAuth.setState({ user: null, profile: null, isLoggedIn: false });
  });
}
