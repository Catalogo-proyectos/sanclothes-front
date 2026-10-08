import { config } from './config';
import { migrateLegacyStorageKey } from './storage-keys';
import { DecodedJWTPayload } from '@/types/auth';


export function parseJWT(token: string): DecodedJWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload) as DecodedJWTPayload;
  } catch (err) {
    console.error('Failed to parse JWT token:', err);
    return null;
  }
}



// M5 — la sesión del cliente vive en una cookie httpOnly que setea el API: el
// JWT nunca pasa por JS. Acá solo quedan:
//   - SESSION_KEY: datos para pintar la UI (nombre, email). NO es una
//     credencial: si la cookie venció, el primer request da 401 y se borra.
//   - el token CSRF, en memoria. Se reenvía en X-CSRF-Token en cada mutación;
//     al recargar la página se pide de nuevo a GET /auth/csrf.
const SESSION_KEY = 'sant_session';
let csrfToken: string | null = null;

export function getStoredSession(): DecodedJWTPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as DecodedJWTPayload) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(user: DecodedJWTPayload, csrf?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // localStorage bloqueado: la sesión dura lo que la pestaña.
  }
  if (csrf) csrfToken = csrf;
}

export function clearStoredSession(): void {
  csrfToken = null;
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // nada que borrar
  }
}

export function hasStoredSession(): boolean {
  return getStoredSession() !== null;
}

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

/** CSRF de la sesión: el de memoria o, tras recargar, el que devuelve el API. */
export async function ensureCsrfToken(): Promise<string | null> {
  if (csrfToken || config.api.useMock) return csrfToken;
  const res = await fetch(`${config.api.baseUrl}/auth/csrf`, { credentials: 'include', cache: 'no-store' });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as { csrfToken?: string };
  csrfToken = data.csrfToken ?? null;
  return csrfToken;
}

/**
 * JWT que el storefront anterior guardaba en localStorage. Solo se lee para
 * pasarlo a cookie una vez (POST /auth/session/migrate) y borrarlo.
 */
export function readLegacyStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    migrateLegacyStorageKey(config.jwt.storageKey);
    return localStorage.getItem(config.jwt.storageKey);
  } catch {
    return null;
  }
}

export function removeLegacyStoredToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(config.jwt.storageKey);
  } catch {
    // nada que borrar
  }
}



const CHECKOUT_TOKEN_KEY = 'sant_checkout_session_token';

export function getCheckoutSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(CHECKOUT_TOKEN_KEY);
}

export function setCheckoutSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CHECKOUT_TOKEN_KEY, token);
}

export function removeCheckoutSessionToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CHECKOUT_TOKEN_KEY);
}



const GUEST_CART_TOKEN_KEY = 'sant_guest_cart_token';

export function getGuestCartToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_CART_TOKEN_KEY);
}

export function setGuestCartToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_TOKEN_KEY, token);
}

export function removeGuestCartToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_TOKEN_KEY);
}



// Token de acceso de invitado a UN pedido (ver y subir el comprobante). Por
// pedido: el cliente puede tener la pestaña de un pedido y abrir el link de otro.
const ORDER_TOKEN_KEY = 'sant_order_access_token';
const orderTokenKey = (orderId: string | number) => `${ORDER_TOKEN_KEY}:${orderId}`;

export function getOrderAccessToken(orderId: string | number): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(orderTokenKey(orderId));
}

export function setOrderAccessToken(orderId: string | number, token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(orderTokenKey(orderId), token);
}

export function removeOrderAccessToken(orderId: string | number): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(orderTokenKey(orderId));
}
