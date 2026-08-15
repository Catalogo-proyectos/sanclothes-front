import { config } from './config';
import { DecodedJWTPayload } from '@/types/auth';

/**
 * Parses and decodes a standard base64/HS256 JWT payload.
 */
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

// ── Session token (login/register/google) ──

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(config.jwt.storageKey);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(config.jwt.storageKey, token);
}

export function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(config.jwt.storageKey);
}

// ── Checkout session token (30 min, from confirm-otp) ──

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

// ── Guest cart token (7 days, from confirm-otp) ──

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

// ── Order access token (60 min, from POST /checkout response) ──

const ORDER_TOKEN_KEY = 'sant_order_access_token';

export function getOrderAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ORDER_TOKEN_KEY);
}

export function setOrderAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ORDER_TOKEN_KEY, token);
}

export function removeOrderAccessToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ORDER_TOKEN_KEY);
}
