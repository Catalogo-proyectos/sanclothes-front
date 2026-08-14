import { describe, it, expect } from 'vitest';
import { bentoLayout, selectFeatured } from '@/lib/catalog/featured';
import type { CatalogProduct } from '@/types/api';

function makeProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    productId: 'prod_01',
    slug: 'prenda',
    title: 'Prenda',
    description: '',
    price: 180000,
    discountPrice: null,
    images: [],
    cuts: ['CLASSIC'],
    category: 'HOMBRE',
    sizes: ['M'],
    stockStatus: 'IN_STOCK',
    ...overrides,
  };
}

const build = (n: number, overrides: Partial<CatalogProduct> = {}) =>
  Array.from({ length: n }, (_, i) =>
    makeProduct({ productId: `prod_${i}`, title: `Prenda ${i}`, ...overrides })
  );

describe('selectFeatured', () => {
  it('respeta el flag del admin cuando llega desde el backend', () => {
    const products = [
      makeProduct({ productId: 'a', isFeatured: true }),
      makeProduct({ productId: 'b' }),
      makeProduct({ productId: 'c', isFeatured: true }),
    ];

    expect(selectFeatured(products).map((p) => p.productId)).toEqual(['a', 'c']);
  });

  it('nunca devuelve más de cuatro: la grilla es 2×2', () => {
    expect(selectFeatured(build(9, { isFeatured: true }))).toHaveLength(4);
  });

  it('sin el flag cae a drops limitados y prendas con badge', () => {
    const products = [
      makeProduct({ productId: 'a' }),
      makeProduct({ productId: 'b', isLimitedDrop: true }),
      makeProduct({ productId: 'c', badge: 'NUEVO' }),
    ];

    expect(selectFeatured(products).map((p) => p.productId)).toEqual(['b', 'c']);
  });

  it('devuelve vacío si no hay nada destacable', () => {
    expect(selectFeatured(build(3))).toEqual([]);
  });
});

describe('bentoLayout', () => {
  it('sin destacados no se renderiza el bloque', () => {
    expect(bentoLayout([]).kind).toBe('none');
  });

  it('con uno solo se dibuja el héroe 2×2 y nada más', () => {
    const layout = bentoLayout(build(1));
    expect(layout.kind).toBe('hero-only');
    if (layout.kind === 'hero-only') expect(layout.secondary).toHaveLength(0);
  });

  it.each([2, 3])('con %i dibuja héroe más los secundarios que existan', (n) => {
    const layout = bentoLayout(build(n));
    expect(layout.kind).toBe('partial');
    if (layout.kind === 'partial') expect(layout.secondary).toHaveLength(n - 1);
  });

  it('con cuatro o más dibuja la grilla completa: héroe + 3', () => {
    const layout = bentoLayout(build(6));
    expect(layout.kind).toBe('full');
    if (layout.kind === 'full') {
      expect(layout.secondary).toHaveLength(3);
      expect(layout.hero.productId).toBe('prod_0');
    }
  });
});
