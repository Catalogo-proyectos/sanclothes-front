import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ApiError } from '@/lib/api';
import { deferred, makeCartItem, makeQuote } from '../helpers/quoteFixture';
import type { CheckoutQuote } from '@/types/quote';

const fetchCheckoutQuote = vi.fn();
vi.mock('@/lib/services/quote', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/services/quote')>();
  return { ...actual, fetchCheckoutQuote: (...args: unknown[]) => fetchCheckoutQuote(...args) };
});

import { useCheckoutQuote } from '@/hooks/useCheckoutQuote';
import type { CartItem } from '@/types/cart';

type Props = { items: CartItem[]; couponCode?: string; token?: string | null };
const render = (initial: Props, extra: { anonymousFallbackOn401?: boolean } = {}) =>
  renderHook((props: Props) => useCheckoutQuote({ ...props, debounceMs: 0, ...extra }), { initialProps: initial });

const lastRequest = () => fetchCheckoutQuote.mock.calls.at(-1)!;

beforeEach(() => {
  fetchCheckoutQuote.mockReset();
});

describe('useCheckoutQuote', () => {
  it('LOADING bloquea; READY muestra la quote del servidor y habilita confirmar', async () => {
    const pending = deferred<CheckoutQuote>();
    fetchCheckoutQuote.mockReturnValue(pending.promise);
    const { result } = render({ items: [makeCartItem()], token: 'tok' });

    expect(result.current.status).toBe('loading');
    expect(result.current.canConfirm).toBe(false);

    await waitFor(() => expect(fetchCheckoutQuote).toHaveBeenCalledTimes(1));
    await act(async () => pending.resolve(makeQuote({ total: 123_000 })));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.quote?.total).toBe(123_000);
    expect(result.current.canConfirm).toBe(true);
    // El request no lleva precios.
    expect(lastRequest()[0].items[0]).not.toHaveProperty('unitPrice');
    expect(lastRequest()[1].token).toBe('tok');
  });

  it('cambio de cantidad → STALE (bloqueado) y recotiza', async () => {
    fetchCheckoutQuote.mockResolvedValueOnce(makeQuote({ total: 100_000 }));
    const { result, rerender } = render({ items: [makeCartItem({ quantity: 1 })], token: 'tok' });
    await waitFor(() => expect(result.current.status).toBe('ready'));

    const next = deferred<CheckoutQuote>();
    fetchCheckoutQuote.mockReturnValueOnce(next.promise);
    rerender({ items: [makeCartItem({ quantity: 2 })], token: 'tok' });
    expect(result.current.status).toBe('stale');
    expect(result.current.canConfirm).toBe(false);

    await waitFor(() => expect(fetchCheckoutQuote).toHaveBeenCalledTimes(2));
    expect(lastRequest()[0].items[0].qty).toBe(2);
    await act(async () => next.resolve(makeQuote({ total: 180_000 })));
    expect(result.current.status).toBe('ready');
    expect(result.current.quote?.total).toBe(180_000);
  });

  it('cambio de items → recotiza con los items nuevos', async () => {
    fetchCheckoutQuote.mockResolvedValue(makeQuote());
    const { result, rerender } = render({ items: [makeCartItem()], token: 'tok' });
    await waitFor(() => expect(result.current.status).toBe('ready'));

    rerender({ items: [makeCartItem(), makeCartItem({ variantId: 'v2', sku: 'REM-L', size: 'L' })], token: 'tok' });
    expect(result.current.status).toBe('stale');
    await waitFor(() => expect(fetchCheckoutQuote).toHaveBeenCalledTimes(2));
    expect(lastRequest()[0].items.map((i: { sku: string }) => i.sku)).toEqual(['REM-M', 'REM-L']);
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it('cambio de cupón → recotiza con el código normalizado', async () => {
    fetchCheckoutQuote.mockResolvedValue(makeQuote());
    const { result, rerender } = render({ items: [makeCartItem()], token: 'tok' });
    await waitFor(() => expect(result.current.status).toBe('ready'));

    rerender({ items: [makeCartItem()], token: 'tok', couponCode: ' promo10 ' });
    expect(result.current.status).toBe('stale');
    await waitFor(() => expect(fetchCheckoutQuote).toHaveBeenCalledTimes(2));
    expect(lastRequest()[0].couponCode).toBe('PROMO10');
  });

  it('anónimo → identificado (OTP/login): la quote anónima deja de ser válida y se recotiza con token', async () => {
    fetchCheckoutQuote.mockResolvedValueOnce(makeQuote({ identified: false, total: 100_000 }));
    const { result, rerender } = render({ items: [makeCartItem()], token: null });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(lastRequest()[1].token).toBeNull();

    const identified = deferred<CheckoutQuote>();
    fetchCheckoutQuote.mockReturnValueOnce(identified.promise);
    rerender({ items: [makeCartItem()], token: 'otp-token' });
    expect(result.current.status).toBe('stale');
    expect(result.current.canConfirm).toBe(false);

    await waitFor(() => expect(fetchCheckoutQuote).toHaveBeenCalledTimes(2));
    expect(lastRequest()[1].token).toBe('otp-token');
    await act(async () => identified.resolve(makeQuote({ identified: true, total: 80_000 })));
    expect(result.current.quote).toMatchObject({ identified: true, total: 80_000 });
  });

  it('una respuesta vieja no pisa a la nueva', async () => {
    const first = deferred<CheckoutQuote>();
    const second = deferred<CheckoutQuote>();
    fetchCheckoutQuote.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result, rerender } = render({ items: [makeCartItem({ quantity: 1 })], token: 'tok' });
    await waitFor(() => expect(fetchCheckoutQuote).toHaveBeenCalledTimes(1));

    rerender({ items: [makeCartItem({ quantity: 2 })], token: 'tok' });
    await waitFor(() => expect(fetchCheckoutQuote).toHaveBeenCalledTimes(2));
    // El primer request quedó abortado.
    expect((fetchCheckoutQuote.mock.calls[0]![1].signal as AbortSignal).aborted).toBe(true);

    await act(async () => second.resolve(makeQuote({ total: 200_000 })));
    await act(async () => first.resolve(makeQuote({ total: 100_000 })));
    expect(result.current.status).toBe('ready');
    expect(result.current.quote?.total).toBe(200_000);
  });

  it('debounce: cambios rápidos generan un solo request', async () => {
    vi.useFakeTimers();
    try {
      fetchCheckoutQuote.mockResolvedValue(makeQuote());
      const { rerender } = renderHook((props: Props) => useCheckoutQuote({ ...props, debounceMs: 300 }), {
        initialProps: { items: [makeCartItem({ quantity: 1 })], token: 'tok' } as Props,
      });
      rerender({ items: [makeCartItem({ quantity: 2 })], token: 'tok' });
      rerender({ items: [makeCartItem({ quantity: 3 })], token: 'tok' });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });
      expect(fetchCheckoutQuote).toHaveBeenCalledTimes(1);
      expect(lastRequest()[0].items[0].qty).toBe(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('ERROR bloquea la confirmación y refresh() reintenta', async () => {
    fetchCheckoutQuote.mockRejectedValueOnce(new ApiError('boom', 500, 'INTERNAL_ERROR'));
    const { result } = render({ items: [makeCartItem()], token: 'tok' });
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.canConfirm).toBe(false);
    expect(result.current.quote).toBeNull();

    fetchCheckoutQuote.mockResolvedValueOnce(makeQuote());
    act(() => result.current.refresh());
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it('INVALID_PRODUCT → UNAVAILABLE con el producto afectado', async () => {
    fetchCheckoutQuote.mockRejectedValueOnce(new ApiError('No disponible', 400, 'INVALID_PRODUCT', { productId: 'prod-1' }));
    const { result } = render({ items: [makeCartItem()], token: 'tok' });
    await waitFor(() => expect(result.current.status).toBe('unavailable'));
    expect(result.current.error?.productId).toBe('prod-1');
    expect(result.current.canConfirm).toBe(false);
  });

  it('NON_POSITIVE_PRICE (M2) bloquea la confirmación aunque la quote esté READY', async () => {
    fetchCheckoutQuote.mockResolvedValueOnce(makeQuote({ warnings: [{ code: 'NON_POSITIVE_PRICE', productId: 'prod-1' }] }));
    const { result } = render({ items: [makeCartItem()], token: 'tok' });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.hasPriceIssue).toBe(true);
    expect(result.current.blockReason).toBe('PRICE_CONFIGURATION');
    expect(result.current.canConfirm).toBe(false);
  });

  it('replaceQuote (409 PRICE_CHANGED) deja READY la quote nueva para la firma actual', async () => {
    fetchCheckoutQuote.mockResolvedValueOnce(makeQuote({ total: 100_000 }));
    const { result } = render({ items: [makeCartItem()], token: 'tok' });
    await waitFor(() => expect(result.current.status).toBe('ready'));

    act(() => result.current.replaceQuote(makeQuote({ total: 125_000 }), result.current.signature));
    expect(result.current.status).toBe('ready');
    expect(result.current.quote?.total).toBe(125_000);
    expect(fetchCheckoutQuote).toHaveBeenCalledTimes(1);
  });

  it('vista informativa: token rechazado (401) → cotiza como anónimo', async () => {
    fetchCheckoutQuote
      .mockRejectedValueOnce(new ApiError('expirado', 401, 'EXPIRED_CHECKOUT_SESSION'))
      .mockResolvedValueOnce(makeQuote({ identified: false }));
    const { result } = render({ items: [makeCartItem()], token: 'old' }, { anonymousFallbackOn401: true });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(fetchCheckoutQuote.mock.calls[1]![1].token).toBeNull();
    expect(result.current.quote?.identified).toBe(false);
  });

  it('carrito vacío → IDLE sin requests', () => {
    const { result } = render({ items: [], token: 'tok' });
    expect(result.current.status).toBe('idle');
    expect(fetchCheckoutQuote).not.toHaveBeenCalled();
  });
});
