import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiCall, ApiError } from '@/lib/api';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('API HTTP adapter', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('consulta el endpoint real configurado', async () => {
    fetchMock.mockResolvedValue(json([{ productId: 'producto-real' }]));

    const products = await apiCall<Array<{ productId: string }>>('GET', '/catalog');

    expect(products).toEqual([{ productId: 'producto-real' }]);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5014/api/catalog',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('envía el cuerpo JSON al backend', async () => {
    fetchMock.mockResolvedValue(json({ success: true }));

    await apiCall('POST', '/auth/login', { email: 'cliente@example.com', password: 'secreto' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5014/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'cliente@example.com', password: 'secreto' }),
      }),
    );
  });

  it('envía tokens de acceso de propósito único como Bearer', async () => {
    fetchMock.mockResolvedValue(json({ id: 'pedido-1' }));

    await apiCall('GET', '/checkout/pedido-1', undefined, 'token-pedido');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5014/api/checkout/pedido-1',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token-pedido' }),
      }),
    );
  });

  it('convierte las respuestas de error del backend en ApiError', async () => {
    fetchMock.mockResolvedValue(json({ message: 'Credenciales inválidas', code: 'INVALID_CREDENTIALS' }, 401));

    const request = apiCall('POST', '/auth/login', { email: 'cliente@example.com', password: 'incorrecta' });

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Credenciales inválidas',
      status: 401,
      code: 'INVALID_CREDENTIALS',
    } satisfies Partial<ApiError>);
  });
});
