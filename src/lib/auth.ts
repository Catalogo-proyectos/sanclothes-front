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



export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  migrateLegacyStorageKey(config.jwt.storageKey);
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
