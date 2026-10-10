import { config } from './config';
import { migrateLegacyStorageKey } from './storage-keys';
import { DecodedJWTPayload } from '@/types/auth';

export function parseJWT(token: string): DecodedJWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    
    const jsonPayload = new TextDecoder('utf-8', { fatal: true }).decode(bytes);

    const payload = JSON.parse(jsonPayload);
    if (!payload || typeof payload !== 'object') return null;
    return payload as DecodedJWTPayload;
  } catch {

return null;
  }
}

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
    
  }
  if (csrf) csrfToken = csrf;
}

export function clearStoredSession(): void {
  csrfToken = null;
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    
  }
}

export function hasStoredSession(): boolean {
  return getStoredSession() !== null;
}

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export async function ensureCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  const res = await fetch(`${config.api.baseUrl}/auth/csrf`, { credentials: 'include', cache: 'no-store' });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as { csrfToken?: string };
  csrfToken = data.csrfToken ?? null;
  return csrfToken;
}

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
