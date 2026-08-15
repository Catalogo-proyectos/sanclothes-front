import { config } from '@/lib/config';
import { apiCall } from '@/lib/api';
import {
  getStoredToken,
  getCheckoutSessionToken,
  setCheckoutSessionToken,
  setGuestCartToken,
  getOrderAccessToken,
  setOrderAccessToken,
} from '@/lib/auth';
import type {
  ConfirmOtpResponse,
  CheckoutRequest,
  CheckoutResponse,
  CheckoutOrderDetail,
  ReceiptUploadResponse,
} from '@/types/api';

/**
 * Checkout service (§6).
 *
 * Guest checkout flow: verify-email → confirm-otp → POST /checkout
 * Logged-in users: skip to POST /checkout with session token.
 */

// ── Step 1: verify-email (rate limit 3/hr, Turnstile optional) ──

export async function verifyEmail(
  email: string,
  turnstileToken?: string,
): Promise<void> {
  await apiCall('POST', '/checkout/verify-email', {
    email,
    turnstileToken: turnstileToken || undefined,
  });
}

// ── Step 2: confirm-otp ──

export async function confirmOtp(
  email: string,
  otp: string,
): Promise<ConfirmOtpResponse> {
  const res = await apiCall<ConfirmOtpResponse>('POST', '/checkout/confirm-otp', {
    email,
    otp,
  });

  // Store both tokens for later use
  setCheckoutSessionToken(res.checkoutSessionToken);
  setGuestCartToken(res.guestCartToken);

  return res;
}

// ── Step 3: create order ──

export async function createOrder(
  request: CheckoutRequest,
): Promise<CheckoutResponse> {
  // Use checkout session token (guest) or session token (logged-in)
  const token = getCheckoutSessionToken() || getStoredToken();
  if (!token) throw new Error('No checkout or session token available');

  const res = await apiCall<CheckoutResponse>('POST', '/checkout', request, token);

  // Store order access token for receipt operations
  setOrderAccessToken(res.orderAccessToken);

  return res;
}

// ── Post-order: view order details (requires orderAccessToken) ──

export async function fetchCheckoutOrder(orderId: string): Promise<CheckoutOrderDetail> {
  const token = getOrderAccessToken();
  if (!token) throw new Error('No order access token');
  return apiCall<CheckoutOrderDetail>('GET', `/checkout/${orderId}`, undefined, token);
}

// ── Post-order: upload receipt (multipart, §6) ──

export async function uploadReceipt(
  orderId: string,
  file: File,
): Promise<ReceiptUploadResponse> {
  const token = getOrderAccessToken();
  if (!token) throw new Error('No order access token');

  const formData = new FormData();
  formData.append('file', file);

  const url = `${config.api.origin}/api/checkout/${orderId}/receipt`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // No Content-Type — browser sets multipart boundary
    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || `Upload failed: ${res.status}`);
  }

  return res.json();
}

// ── Post-order: get receipt URL (§2.4 — always re-fetch, URLs expire in 15 min) ──

export function getReceiptUrl(orderId: string): string {
  const token = getOrderAccessToken();
  // The endpoint returns a 302 redirect to the pre-signed URL
  return `${config.api.origin}/api/checkout/${orderId}/receipt?token=${encodeURIComponent(token || '')}`;
}
