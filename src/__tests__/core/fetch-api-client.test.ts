import { afterEach, describe, expect, it, vi } from 'vitest';
import { FetchApiClient } from '@/core/adapters/fetch-api-client';
import type { TokenVault } from '@/core';

const tokens: TokenVault = {
  get: vi.fn((kind) => kind === 'checkoutSession' ? 'checkout-token' : kind === 'customerSession' ? 'customer-token' : 'cart-token'),
  set: vi.fn(), remove: vi.fn(),
  getOrderAccess: vi.fn((id) => id === 42 ? 'order-42-token' : null),
  setOrderAccess: vi.fn(), removeOrderAccess: vi.fn(), clearAll: vi.fn(),
};

describe('FetchApiClient', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('injects exactly the requested credential', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    const api = new FetchApiClient('http://api.test/api', tokens);
    await api.post('/checkout', {}, { auth: { kind: 'checkoutSession' } });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer checkout-token');
  });

  it('rejects before fetch when the order token is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const api = new FetchApiClient('http://api.test/api', tokens);
    await expect(api.get('/checkout/99', { auth: { kind: 'orderAccess', orderId: 99 } }))
      .rejects.toMatchObject({ code: 'MISSING_TOKEN', status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not set Content-Type for multipart data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
    const api = new FetchApiClient('http://api.test/api', tokens);
    await api.postMultipart('/checkout/42/receipt', new FormData(), { auth: { kind: 'orderAccess', orderId: 42 } });
    expect(fetchMock.mock.calls[0][1].headers['Content-Type']).toBeUndefined();
  });

  it('normalizes both backend error formats', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ statusCode: 401, error: 'Unauthorized', message: 'Sesión vencida' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )));
    const api = new FetchApiClient('http://api.test/api', tokens);
    await expect(api.get('/me')).rejects.toEqual(expect.objectContaining({
      message: 'Sesión vencida', status: 401, code: 'HTTP_ERROR',
    }));
  });
});
