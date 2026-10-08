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

/**
 * M5: pasa a cookie httpOnly la sesión que el storefront anterior guardaba en
 * localStorage, y borra el JWT de ahí. Si el API la rechaza (vencida, revocada)
 * simplemente queda deslogueado.
 */
async function migrateLegacySession(token: string): Promise<void> {
  const decoded = parseJWT(token);
  const expired = !decoded?.exp || decoded.exp * 1000 <= Date.now();
  if (!decoded || expired || config.api.useMock) {
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
    // Otro error (red, 5xx): se reintenta en la próxima carga.
  } catch {
    // sin red: se reintenta en la próxima carga
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
    // Borra las cookies en el API (no necesita CSRF). Si falla, la cookie vence sola.
    if (!config.api.useMock) {
      void fetch(`${config.api.baseUrl}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    }
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
    // Una sola migración en vuelo aunque lo llamen Header y ProtectedRoute a la vez.
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

// Un request con sesión respondió 401: la cookie venció o se revocó.
if (typeof window !== 'undefined') {
  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    useAuth.setState({ user: null, profile: null, isLoggedIn: false });
  });
}
