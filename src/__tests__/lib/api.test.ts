import { describe, it, expect } from 'vitest';
import { apiCall } from '@/lib/api';
import { CutInfo } from '@/types/api';
import type { BackendProduct } from '@/types/backend';

describe('API Adapter & Mock Data Layer', () => {
  // El catálogo simulado emite el modelo de la API real (BackendProduct), no el
  // de vista: así el modo mock ejercita el adaptador y la capa de slots en lugar
  // de saltárselos.
  it('should fetch catalog products from mock dataset when USE_MOCK is true', async () => {
    const products = await apiCall<BackendProduct[]>('GET', '/catalog');
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('productId');
    expect(products[0]).toHaveProperty('name');
    expect(products[0]).toHaveProperty('imagesByCut');
  });

  it('should expose variants nested by cut and size like the real API', async () => {
    const [product] = await apiCall<BackendProduct[]>('GET', '/catalog');
    const cut = product.availableCuts?.[0];

    expect(cut).toBeTruthy();
    const sizesForCut = product.variants[cut!];
    expect(sizesForCut).toBeTypeOf('object');

    const [firstSize] = Object.keys(sizesForCut);
    expect(sizesForCut[firstSize]).toHaveProperty('sku');
    expect(sizesForCut[firstSize]).toHaveProperty('stock');
  });

  it('should filter catalog products by cut', async () => {
    const products = await apiCall<BackendProduct[]>('GET', '/catalog?cut=FEMENINO');
    expect(products.every((p) => p.availableCuts?.includes('FEMENINO'))).toBe(true);
  });

  it('should fetch available cuts list', async () => {
    const cuts = await apiCall<CutInfo[]>('GET', '/catalog/cuts');
    expect(cuts).toHaveLength(3);
    expect(cuts.map((c) => c.code)).toContain('FEMENINO');
  });

  it('should handle login request in mock mode', async () => {
    const response = await apiCall('POST', '/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(response).toHaveProperty('token');
    expect(response.email).toBe('test@example.com');
  });

  it('should reject invalid password in mock mode', async () => {
    await expect(
      apiCall('POST', '/auth/login', {
        email: 'test@example.com',
        password: 'wrong',
      })
    ).rejects.toThrow('Invalid email or password');
  });
});
