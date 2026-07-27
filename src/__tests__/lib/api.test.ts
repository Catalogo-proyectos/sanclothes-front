import { describe, it, expect } from 'vitest';
import { apiCall } from '@/lib/api';
import { CatalogProduct, CutInfo } from '@/types/api';

describe('API Adapter & Mock Data Layer', () => {
  it('should fetch catalog products from mock dataset when USE_MOCK is true', async () => {
    const products = await apiCall<CatalogProduct[]>('GET', '/catalog');
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('productId');
    expect(products[0]).toHaveProperty('title');
  });

  it('should filter catalog products by cut', async () => {
    const products = await apiCall<CatalogProduct[]>('GET', '/catalog?cut=FEMENINO');
    expect(products.every((p) => p.cuts.includes('FEMENINO'))).toBe(true);
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
