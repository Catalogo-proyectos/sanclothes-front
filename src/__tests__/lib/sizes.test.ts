import { describe, it, expect } from 'vitest';
import { initialCutForSize, productHref, sortSizes } from '@/lib/catalog/sizes';
import type { CatalogProduct, ProductVariant } from '@/types/api';

function variant(cut: string, size: string): ProductVariant {
  return { variantId: `${cut}-${size}`, sku: `${cut}-${size}`, cut, size, price: 100000, stock: 5 };
}

function makeProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    productId: 'prod_01',
    slug: 'prenda',
    title: 'Prenda',
    description: '',
    price: 100000,
    discountPrice: null,
    images: [],
    cuts: ['FEMENINO', 'UNISEX'],
    category: 'HOMBRE',
    sizes: ['S', 'M', 'XS', 'L'],
    stockStatus: 'IN_STOCK',
    variants: [
      variant('FEMENINO', 'S'),
      variant('FEMENINO', 'M'),
      variant('UNISEX', 'XS'),
      variant('UNISEX', 'L'),
    ],
    ...overrides,
  };
}

describe('sortSizes', () => {
  it('ordena de chico a grande sin importar el orden del backend', () => {
    expect(sortSizes(['S', 'M', 'XS', 'L', 'XXL', 'XL'])).toEqual(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  });

  it('ordena talles numéricos por valor y deja los desconocidos al final', () => {
    expect(sortSizes(['42', 'ÚNICO', '38', '40'])).toEqual(['38', '40', '42', 'ÚNICO']);
  });

  it('no muta el array original', () => {
    const sizes = ['M', 'S'];
    sortSizes(sizes);
    expect(sizes).toEqual(['M', 'S']);
  });
});

describe('productHref', () => {
  it('sin talle elegido deja la URL canónica', () => {
    expect(productHref('prod_01')).toBe('/products/prod_01');
    expect(productHref('prod_01', null)).toBe('/products/prod_01');
  });

  it('con talle elegido lo pasa como ?talle=', () => {
    expect(productHref('prod_01', 'M')).toBe('/products/prod_01?talle=M');
  });
});

describe('initialCutForSize', () => {
  it('sin talle abre en el primer corte', () => {
    expect(initialCutForSize(makeProduct())).toBe('FEMENINO');
  });

  it('mantiene el primer corte si tiene el talle pedido', () => {
    expect(initialCutForSize(makeProduct(), 'M')).toBe('FEMENINO');
  });

  it('cambia al primer corte que tenga el talle pedido', () => {
    expect(initialCutForSize(makeProduct(), 'XS')).toBe('UNISEX');
  });

  it('con un talle inexistente vuelve al primer corte', () => {
    expect(initialCutForSize(makeProduct(), 'XXL')).toBe('FEMENINO');
  });
});
