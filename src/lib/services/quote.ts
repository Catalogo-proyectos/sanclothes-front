import { config } from '@/lib/config';
import { ApiError } from '@/lib/api';
import { ensureCsrfToken } from '@/lib/auth';
import type { CartItem } from '@/types/cart';
import type { CheckoutQuote, QuoteItemRequest, QuoteRequest } from '@/types/quote';

/**
 * Items para cotizar: solo identidad de la variante y cantidad. El `unitPrice`
 * del carrito es una referencia visual y NO viaja: el backend precifica.
 */
export function toQuoteItems(items: CartItem[]): QuoteItemRequest[] {
  return items.map((item) => ({
    productId: item.productId,
    sku: item.sku,
    size: item.size,
    qty: item.quantity,
  }));
}

/** El backend normaliza el código igual (trim + mayúsculas); vacío = sin cupón. */
export function normalizeCouponCode(code: string | null | undefined): string | undefined {
  const normalized = (code ?? '').trim().toUpperCase();
  return normalized === '' ? undefined : normalized;
}

/**
 * POST /api/checkout/quote. `token` (opcional) identifica al cliente: un token
 * OTP (Bearer) o `true` = la sesión en cookie (M5). Sin él la quote es anónima
 * (sin tier; cupones personales → REQUIRES_IDENTITY).
 */
export async function fetchCheckoutQuote(
  request: QuoteRequest,
  options: { token?: string | true | null; signal?: AbortSignal } = {},
): Promise<CheckoutQuote> {
  if (config.api.useMock) {
    return mockQuote(request, Boolean(options.token));
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof options.token === 'string') {
    headers.Authorization = `Bearer ${options.token}`;
  } else if (options.token === true) {
    const csrf = await ensureCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  const response = await fetch(`${config.api.baseUrl}/checkout/quote`, {
    method: 'POST',
    headers,
    credentials: options.token === true ? 'include' : 'omit',
    body: JSON.stringify(request),
    signal: options.signal,
  });

  if (!response.ok) {
    let message = `HTTP Error ${response.status}`;
    let code: string | undefined;
    let data: Record<string, unknown> | undefined;
    try {
      data = await response.json();
      message = (data?.message as string) || (data?.error as string) || message;
      code = (data?.code as string) || undefined;
    } catch {
      // cuerpo no JSON: se conserva el mensaje HTTP
    }
    throw new ApiError(message, response.status, code, data);
  }

  return response.json();
}

/**
 * Solo para el modo demo (NEXT_PUBLIC_USE_MOCK=true): precio de lista del
 * dataset mock, sin descuentos y envío gratis. Nunca se usa contra el backend.
 */
async function mockQuote(request: QuoteRequest, identified: boolean): Promise<CheckoutQuote> {
  const { MOCK_PRODUCTS } = await import('@/mocks/catalog');
  const lines = request.items.map((item) => {
    const product = MOCK_PRODUCTS.find((p) => p.productId === item.productId);
    const variant = product?.variants?.find((v) => v.sku === item.sku);
    const unitPrice = variant?.price ?? product?.price ?? 0;
    return {
      productId: item.productId,
      sku: item.sku,
      size: variant?.size ?? item.size,
      qty: item.qty,
      kind: 'PRODUCT' as const,
      rule: 'BASE' as const,
      baseUnitPrice: unitPrice,
      unitPrice,
      lineTotal: unitPrice * item.qty,
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  return {
    currency: 'PYG',
    identified,
    lines,
    subtotal,
    discount: { applied: 'NONE', amount: 0, tier: null, coupon: null },
    shipping: { mode: 'FREE_ALWAYS', amount: 0, freeThreshold: null, remainingForFree: null },
    total: subtotal,
    warnings: [],
    quotedAt: new Date().toISOString(),
  };
}
