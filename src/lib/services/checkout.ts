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





export async function verifyEmail(
  email: string,
  turnstileToken?: string,
): Promise<void> {
  await apiCall('POST', '/checkout/verify-email', {
    email,
    turnstileToken: turnstileToken || undefined,
  });
}



export async function confirmOtp(
  email: string,
  otp: string,
): Promise<ConfirmOtpResponse> {
  const res = await apiCall<ConfirmOtpResponse>('POST', '/checkout/confirm-otp', {
    email,
    otp,
  });


  setCheckoutSessionToken(res.checkoutSessionToken);
  setGuestCartToken(res.guestCartToken);

  return res;
}



/**
 * Identidad con la que se crea el pedido: el token OTP del checkout o, si no
 * hay, la sesión. La quote usa EXACTAMENTE la misma, así el tier/cupón que se
 * cotiza es el que se cobra.
 */
export function getCheckoutIdentityToken(): string | null {
  return getCheckoutSessionToken() || getStoredToken();
}

export async function createOrder(
  request: CheckoutRequest,
): Promise<CheckoutResponse> {

  const token = getCheckoutIdentityToken();
  if (!token) throw new Error('No checkout or session token available');

  const res = await apiCall<CheckoutResponse>('POST', '/checkout', request, token);


  setOrderAccessToken(res.orderAccessToken);

  return res;
}



export async function fetchCheckoutOrder(orderId: string): Promise<CheckoutOrderDetail> {
  const token = getOrderAccessToken();
  if (!token) throw new Error('No order access token');
  return apiCall<CheckoutOrderDetail>('GET', `/checkout/${orderId}`, undefined, token);
}



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

    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || `Upload failed: ${res.status}`);
  }

  return res.json();
}



export function getReceiptUrl(orderId: string): string {
  const token = getOrderAccessToken();

  return `${config.api.origin}/api/checkout/${orderId}/receipt?token=${encodeURIComponent(token || '')}`;
}
