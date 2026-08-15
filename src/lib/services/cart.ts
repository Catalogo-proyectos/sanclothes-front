import { config } from '@/lib/config';
import { getStoredToken, getGuestCartToken } from '@/lib/auth';

/**
 * Cart sync service (§5).
 *
 * Two variants with same shape but different tokens:
 * - Logged-in:  GET/POST /api/v1/me/cart   → uses session token
 * - Guest:      GET/POST /api/v1/cart       → uses guestCartToken (from confirm-otp)
 *
 * The backend stores the cart in Redis. If Redis is down, GET returns {items:[]}
 * and POST returns {success:true} silently (§2.5 — no way to detect from client).
 */

interface CartPayload {
  items: unknown[];
}

interface CartSaveResponse {
  success: boolean;
  cart: {
    items: unknown[];
    updatedAt: string;
  };
}

async function cartFetch<T>(
  method: 'GET' | 'POST',
  path: string,
  token: string,
  body?: unknown,
): Promise<T> {
  const url = `${config.api.origin}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || `Cart request failed: ${res.status}`);
  }

  return res.json();
}

// ── Logged-in user cart ──

export async function fetchUserCart(): Promise<CartPayload> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return cartFetch<CartPayload>('GET', '/api/v1/me/cart', token);
}

export async function saveUserCart(items: unknown[]): Promise<CartSaveResponse> {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return cartFetch<CartSaveResponse>('POST', '/api/v1/me/cart', token, { items });
}

// ── Guest cart (requires guestCartToken from OTP verification) ──

export async function fetchGuestCart(): Promise<CartPayload> {
  const token = getGuestCartToken();
  if (!token) throw new Error('No guest cart token');
  return cartFetch<CartPayload>('GET', '/api/v1/cart', token);
}

export async function saveGuestCart(items: unknown[]): Promise<CartSaveResponse> {
  const token = getGuestCartToken();
  if (!token) throw new Error('No guest cart token');
  return cartFetch<CartSaveResponse>('POST', '/api/v1/cart', token, { items });
}
