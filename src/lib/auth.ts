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

/**
 * Returns stored JWT from localStorage if present and valid.
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(config.jwt.storageKey);
}

/**
 * Stores JWT in localStorage.
 */
export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(config.jwt.storageKey, token);
}

/**
 * Clears JWT from localStorage.
 */
export function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(config.jwt.storageKey);
}
