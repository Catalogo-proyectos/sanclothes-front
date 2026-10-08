import { config } from '@/lib/config';
import { ensureCsrfToken, getGuestCartToken, hasStoredSession } from '@/lib/auth';



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
  /** Token del carrito de invitado, o `'session'`: la cookie del cliente logueado (M5). */
  auth: string,
  body?: unknown,
): Promise<T> {
  const url = `${config.api.origin}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth !== 'session') {
    headers.Authorization = `Bearer ${auth}`;
  } else if (method !== 'GET') {
    const csrf = await ensureCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  const res = await fetch(url, {
    method,
    headers,
    credentials: auth === 'session' ? 'include' : 'omit',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || `Cart request failed: ${res.status}`);
  }

  return res.json();
}



export async function fetchUserCart(): Promise<CartPayload> {
  if (!hasStoredSession()) throw new Error('Not authenticated');
  return cartFetch<CartPayload>('GET', '/api/v1/me/cart', 'session');
}

export async function saveUserCart(items: unknown[]): Promise<CartSaveResponse> {
  if (!hasStoredSession()) throw new Error('Not authenticated');
  return cartFetch<CartSaveResponse>('POST', '/api/v1/me/cart', 'session', { items });
}



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
