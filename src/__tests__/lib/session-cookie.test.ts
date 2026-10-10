import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config', () => ({
  config: { api: { baseUrl: 'https://api.test/api' }, jwt: { storageKey: 'sant_auth_token' } },
}));

import { apiCall, ApiError, SESSION_EXPIRED_EVENT } from '@/lib/api';
import { clearStoredSession, getStoredSession, readLegacyStoredToken, setStoredSession } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

const user = { userId: '1', email: 'c@test.local', firstName: 'C', lastName: 'L' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

const fakeJwt = (payload: Record<string, unknown>) =>
  `x.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.y`;

beforeEach(() => {
  localStorage.clear();
  clearStoredSession();
  useAuth.setState({ user: null, isLoggedIn: false, profile: null });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiCall con sesión en cookie (M5)', () => {
  it('nunca manda Authorization; manda la cookie y el CSRF en mutaciones', async () => {
    setStoredSession(user, 'csrf-1');
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiCall('PATCH', '/me', { firstName: 'X' }, true);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.test/api/me');
    expect(init.credentials).toBe('include');
    expect(init.headers.Authorization).toBeUndefined();
    expect(init.headers['X-CSRF-Token']).toBe('csrf-1');
  });

  it('GET no necesita CSRF', async () => {
    setStoredSession(user, 'csrf-1');
    const fetchMock = vi.fn().mockResolvedValue(json({}));
    vi.stubGlobal('fetch', fetchMock);
    await apiCall('GET', '/me', undefined, true);
    expect(fetchMock.mock.calls[0]![1].headers['X-CSRF-Token']).toBeUndefined();
  });

  it('tras recargar (sin CSRF en memoria) lo pide a /auth/csrf', async () => {
    setStoredSession(user);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ csrfToken: 'csrf-recuperado' }))
      .mockResolvedValueOnce(json({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiCall('POST', '/me/tickets', { subject: 'x' }, true);

    expect(fetchMock.mock.calls[0]![0]).toBe('https://api.test/api/auth/csrf');
    expect(fetchMock.mock.calls[0]![1].credentials).toBe('include');
    expect(fetchMock.mock.calls[1]![1].headers['X-CSRF-Token']).toBe('csrf-recuperado');
  });

  it('CSRF rechazado → pide uno nuevo y reintenta una vez', async () => {
    setStoredSession(user, 'csrf-viejo');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ code: 'CSRF_TOKEN_INVALID' }, 403))
      .mockResolvedValueOnce(json({ csrfToken: 'csrf-nuevo' }))
      .mockResolvedValueOnce(json({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiCall('PATCH', '/me', {}, true)).resolves.toEqual({ ok: true });
    expect(fetchMock.mock.calls[2]![1].headers['X-CSRF-Token']).toBe('csrf-nuevo');
  });

  it('401 con sesión → borra la sesión local y avisa', async () => {
    setStoredSession(user, 'csrf-1');
    useAuth.setState({ user, isLoggedIn: true });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ code: 'UNAUTHORIZED' }, 401)));
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, listener);

    await expect(apiCall('GET', '/me', undefined, true)).rejects.toBeInstanceOf(ApiError);

    expect(getStoredSession()).toBeNull();
    expect(listener).toHaveBeenCalled();
    expect(useAuth.getState().isLoggedIn).toBe(false);
    window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
  });

  it('sin sesión local no llama al API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(apiCall('GET', '/me', undefined, true)).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('un token Bearer explícito (OTP / pedido de invitado) sigue yendo en el header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({}));
    vi.stubGlobal('fetch', fetchMock);
    await apiCall('POST', '/checkout', {}, 'otp-token');
    expect(fetchMock.mock.calls[0]![1].headers.Authorization).toBe('Bearer otp-token');
  });
});

describe('useAuth (M5)', () => {
  it('login guarda solo los datos de la UI, nunca un JWT', () => {
    useAuth.getState().login(user, 'csrf-1');
    expect(useAuth.getState().isLoggedIn).toBe(true);
    const everything = JSON.stringify({ ...localStorage });
    expect(everything).not.toMatch(/eyJ|token/i);
    expect(readLegacyStoredToken()).toBeNull();
  });

  it('migra el JWT del storefront anterior a cookie y lo borra de localStorage', async () => {
    const legacy = fakeJwt({ ...user, exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('sant_auth_token', legacy);
    const fetchMock = vi.fn().mockResolvedValue(json({ success: true, csrfToken: 'csrf-mig' }));
    vi.stubGlobal('fetch', fetchMock);

    await useAuth.getState().syncFromStorage();

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.test/api/auth/session/migrate');
    expect(init.headers.Authorization).toBe(`Bearer ${legacy}`);
    expect(init.credentials).toBe('include');
    expect(localStorage.getItem('sant_auth_token')).toBeNull();
    expect(useAuth.getState().isLoggedIn).toBe(true);
  });

  it('un JWT viejo vencido se borra sin llamar al API', async () => {
    localStorage.setItem('sant_auth_token', fakeJwt({ ...user, exp: Math.floor(Date.now() / 1000) - 10 }));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await useAuth.getState().syncFromStorage();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(localStorage.getItem('sant_auth_token')).toBeNull();
    expect(useAuth.getState().isLoggedIn).toBe(false);
  });

  it('logout borra las cookies en el API y la sesión local', () => {
    setStoredSession(user, 'csrf-1');
    const fetchMock = vi.fn().mockResolvedValue(json({ success: true }));
    vi.stubGlobal('fetch', fetchMock);

    useAuth.getState().logout();

    expect(fetchMock.mock.calls[0]![0]).toBe('https://api.test/api/auth/logout');
    expect(fetchMock.mock.calls[0]![1].credentials).toBe('include');
    expect(getStoredSession()).toBeNull();
  });
});
