import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '@/types/cart';

// El servicio real (no el modo demo): config con useMock = false.
vi.mock('@/lib/config', () => ({
  config: { api: { useMock: false, baseUrl: 'https://api.test/api' } },
}));

import { fetchCheckoutQuote, normalizeCouponCode, toQuoteItems } from '@/lib/services/quote';
import { ApiError } from '@/lib/api';

const cartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  variantId: 'v1',
  productId: 'prod-1',
  productName: 'Remera',
  sku: 'REM-M',
  size: 'M',
  cut: 'UNISEX',
  quantity: 2,
  unitPrice: 999_999,
  ...overrides,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('toQuoteItems', () => {
  it('manda solo productId/sku/size/qty: el unitPrice local nunca viaja', () => {
    expect(toQuoteItems([cartItem()])).toEqual([{ productId: 'prod-1', sku: 'REM-M', size: 'M', qty: 2 }]);
    expect(toQuoteItems([cartItem()])[0]).not.toHaveProperty('unitPrice');
  });
});

describe('normalizeCouponCode', () => {
  it('trim + mayúsculas; vacío = sin cupón', () => {
    expect(normalizeCouponCode('  promo10 ')).toBe('PROMO10');
    expect(normalizeCouponCode('   ')).toBeUndefined();
    expect(normalizeCouponCode(undefined)).toBeUndefined();
  });
});

describe('fetchCheckoutQuote', () => {
  it('POST /checkout/quote con el token de identidad cuando lo hay', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ total: 1 }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchCheckoutQuote({ items: toQuoteItems([cartItem()]), couponCode: 'PROMO' }, { token: 'tok-123' });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.test/api/checkout/quote');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok-123');
    expect(JSON.parse(init.body)).toEqual({
      items: [{ productId: 'prod-1', sku: 'REM-M', size: 'M', qty: 2 }],
      couponCode: 'PROMO',
    });
  });

  it('anónima: sin header Authorization', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await fetchCheckoutQuote({ items: [] }, { token: null });
    expect(fetchMock.mock.calls[0]![1].headers.Authorization).toBeUndefined();
  });

  it('error del backend → ApiError con status, code y datos públicos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'No disponible', code: 'INVALID_PRODUCT', productId: 'prod-1' }), { status: 400 }),
      ),
    );
    const err = await fetchCheckoutQuote({ items: [] }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.code).toBe('INVALID_PRODUCT');
    expect(err.data.productId).toBe('prod-1');
  });
});
