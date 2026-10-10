import { config } from '@/lib/config';
import { ApiError } from '@/lib/api';
import { ensureCsrfToken } from '@/lib/auth';
import type { CartItem } from '@/types/cart';
import type { CheckoutQuote, QuoteItemRequest, QuoteRequest } from '@/types/quote';

export function toQuoteItems(items: CartItem[]): QuoteItemRequest[] {
  return items.map((item) => ({
    productId: item.productId,
    sku: item.sku,
    size: item.size,
    qty: item.quantity,
  }));
}

export function normalizeCouponCode(code: string | null | undefined): string | undefined {
  const normalized = (code ?? '').trim().toUpperCase();
  return normalized === '' ? undefined : normalized;
}

export async function fetchCheckoutQuote(
  request: QuoteRequest,
  options: { token?: string | true | null; signal?: AbortSignal } = {},
): Promise<CheckoutQuote> {
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

    }
    throw new ApiError(message, response.status, code, data);
  }

  return response.json();
}

