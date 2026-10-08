import { config } from '@/lib/config';
import { apiCall, ApiError } from '@/lib/api';
import {
  hasStoredSession,
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
 * hay, la sesión del cliente (`true` = cookie httpOnly, M5). La quote usa
 * EXACTAMENTE la misma, así el tier/cupón que se cotiza es el que se cobra.
 */
export type CheckoutIdentity = string | true;

export function getCheckoutIdentity(): CheckoutIdentity | null {
  return getCheckoutSessionToken() || (hasStoredSession() ? true : null);
}

export async function createOrder(
  request: CheckoutRequest,
): Promise<CheckoutResponse> {

  const identity = getCheckoutIdentity();
  if (!identity) throw new Error('No checkout or session token available');

  const res = await apiCall<CheckoutResponse>('POST', '/checkout', request, identity);


  setOrderAccessToken(res.orderId, res.orderAccessToken);

  return res;
}



export async function fetchCheckoutOrder(orderId: string): Promise<CheckoutOrderDetail> {
  const token = getOrderAccessToken(orderId);
  if (!token) throw new ApiError('No tenés acceso a este pedido desde este navegador.', 401, 'MISSING_ORDER_TOKEN');
  return apiCall<CheckoutOrderDetail>('GET', `/checkout/${orderId}`, undefined, token);
}

export async function uploadReceipt(
  orderId: string,
  file: File,
): Promise<ReceiptUploadResponse> {
  const token = getOrderAccessToken(orderId);
  if (!token) throw new ApiError('No tenés acceso a este pedido desde este navegador.', 401, 'MISSING_ORDER_TOKEN');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${config.api.origin}/api/checkout/${orderId}/receipt`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message || data.error || `Upload failed: ${res.status}`, res.status, data.code, data);
  }

  return res.json();
}

/**
 * Abre el comprobante subido en una pestaña nueva. La ruta exige el token en el
 * header, así que se descarga como blob (un <a href> no puede mandar headers).
 * La pestaña se abre antes del fetch para que el navegador no la bloquee.
 */
export async function openReceipt(orderId: string): Promise<void> {
  const token = getOrderAccessToken(orderId);
  if (!token) throw new ApiError('No tenés acceso a este pedido desde este navegador.', 401, 'MISSING_ORDER_TOKEN');
  const tab = window.open('', '_blank');
  try {
    const res = await fetch(`${config.api.origin}/api/checkout/${orderId}/receipt`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new ApiError('No se pudo abrir el comprobante.', res.status);
    const url = URL.createObjectURL(await res.blob());
    if (tab) tab.location.href = url;
    else window.location.href = url;
    // La pestaña ya lo cargó: liberar el blob.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    tab?.close();
    throw err;
  }
}
