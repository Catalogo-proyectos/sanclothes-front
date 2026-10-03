'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import { fetchCheckoutQuote, normalizeCouponCode, toQuoteItems } from '@/lib/services/quote';
import type { CartItem } from '@/types/cart';
import type { CheckoutQuote, QuoteItemRequest } from '@/types/quote';

/**
 * Estados de la cotización del servidor:
 * - idle        → no hay nada que cotizar (carrito vacío o deshabilitado).
 * - loading     → primera cotización en curso; no hay importes que mostrar.
 * - ready       → la quote corresponde EXACTAMENTE al carrito/cupón/identidad actuales.
 * - stale       → cambió el carrito, el cupón o la identidad: la quote anterior
 *                 ya no vale y se está pidiendo una nueva.
 * - error       → no se pudo cotizar (red, servidor, sesión vencida).
 * - unavailable → un producto del carrito ya no se puede comprar (INVALID_PRODUCT).
 */
export type QuoteStatus = 'idle' | 'loading' | 'ready' | 'stale' | 'error' | 'unavailable';

/** Motivo por el que no se puede confirmar el pedido con la quote actual. */
export type QuoteBlockReason = Exclude<QuoteStatus, 'ready'> | 'PRICE_CONFIGURATION';

export interface QuoteError {
  status?: number;
  code?: string;
  message: string;
  productId?: string;
}

interface UseCheckoutQuoteOptions {
  items: CartItem[];
  couponCode?: string | null;
  /** Token de identidad (OTP de checkout o sesión). null = quote anónima. */
  token?: string | null;
  enabled?: boolean;
  debounceMs?: number;
  /** Si el token es rechazado (401), cotizar como anónimo en vez de fallar (solo para vistas informativas). */
  anonymousFallbackOn401?: boolean;
}

interface Settled {
  signature: string;
  quote: CheckoutQuote | null;
  error: QuoteError | null;
}

interface SignaturePayload {
  items: QuoteItemRequest[];
  couponCode?: string;
  token: string | null;
  nonce: number;
}

export const QUOTE_DEBOUNCE_MS = 300;

export function useCheckoutQuote({
  items,
  couponCode,
  token = null,
  enabled = true,
  debounceMs = QUOTE_DEBOUNCE_MS,
  anonymousFallbackOn401 = false,
}: UseCheckoutQuoteOptions) {
  const [nonce, setNonce] = useState(0);
  const [settled, setSettled] = useState<Settled | null>(null);
  const [lastQuote, setLastQuote] = useState<CheckoutQuote | null>(null);
  const requestIdRef = useRef(0);

  const active = enabled && items.length > 0;
  const normalizedCoupon = normalizeCouponCode(couponCode);

  // Todo lo que define el precio: items, cupón e identidad. Una quote solo es
  // válida para la firma con la que se pidió.
  const signature = useMemo(
    () =>
      JSON.stringify({
        items: toQuoteItems(items),
        couponCode: normalizedCoupon,
        token: token ?? null,
        nonce,
      } satisfies SignaturePayload),
    [items, normalizedCoupon, token, nonce],
  );

  useEffect(() => {
    if (!active) return;
    const payload = JSON.parse(signature) as SignaturePayload;
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    const run = async () => {
      const request = { items: payload.items, ...(payload.couponCode ? { couponCode: payload.couponCode } : {}) };
      try {
        let quote: CheckoutQuote;
        try {
          quote = await fetchCheckoutQuote(request, { token: payload.token, signal: controller.signal });
        } catch (err) {
          if (anonymousFallbackOn401 && payload.token && err instanceof ApiError && err.status === 401) {
            quote = await fetchCheckoutQuote(request, { token: null, signal: controller.signal });
          } else {
            throw err;
          }
        }
        // Una respuesta vieja nunca pisa a una más nueva.
        if (requestId !== requestIdRef.current || controller.signal.aborted) return;
        setSettled({ signature, quote, error: null });
        setLastQuote(quote);
      } catch (err) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        if ((err as Error)?.name === 'AbortError') return;
        const apiError = err instanceof ApiError ? err : null;
        setSettled({
          signature,
          quote: null,
          error: {
            status: apiError?.status,
            code: apiError?.code,
            message: (err as Error)?.message || 'No se pudo calcular el total',
            productId: typeof apiError?.data?.productId === 'string' ? apiError.data.productId : undefined,
          },
        });
      }
    };

    const timer = setTimeout(run, debounceMs);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [signature, active, debounceMs, anonymousFallbackOn401]);

  let status: QuoteStatus;
  let quote: CheckoutQuote | null = null;
  let error: QuoteError | null = null;
  if (!active) {
    status = 'idle';
  } else if (settled && settled.signature === signature) {
    if (settled.quote) {
      status = 'ready';
      quote = settled.quote;
    } else {
      error = settled.error;
      status = error?.code === 'INVALID_PRODUCT' ? 'unavailable' : 'error';
    }
  } else if (lastQuote) {
    status = 'stale';
    quote = lastQuote;
  } else {
    status = 'loading';
  }

  // M2 pendiente en el backend: un precio <= 0 nunca se confirma ni se
  // "arregla" acá. Protección de UX, no resolución de M2.
  const hasPriceIssue = Boolean(quote?.warnings.some((w) => w.code === 'NON_POSITIVE_PRICE'));
  const blockReason: QuoteBlockReason | null =
    status !== 'ready' ? status : hasPriceIssue ? 'PRICE_CONFIGURATION' : null;

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  /**
   * Reemplaza la quote con una que devolvió el servidor por otra vía (409
   * PRICE_CHANGED). Solo queda READY si `forSignature` sigue siendo la firma
   * actual; si el carrito cambió mientras tanto, queda STALE y se recotiza.
   */
  const replaceQuote = useCallback((next: CheckoutQuote, forSignature: string) => {
    requestIdRef.current += 1; // invalida cualquier respuesta en vuelo
    setSettled({ signature: forSignature, quote: next, error: null });
    setLastQuote(next);
  }, []);

  return {
    status,
    quote,
    error,
    signature,
    canConfirm: blockReason === null,
    blockReason,
    hasPriceIssue,
    refresh,
    replaceQuote,
  };
}
