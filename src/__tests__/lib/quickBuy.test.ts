import { describe, it, expect } from 'vitest';
import {
  defaultQuickSize,
  needsCutChoice,
  quickSizes,
  quickVariant,
  variantToCartItem,
} from '@/lib/catalog/quickBuy';
import type { ProductVariant } from '@/types/api';

function variant(cut: string, size: string, stock = 5): ProductVariant {
  const sku = `PA-CARGO-${cut.slice(0, 3)}-${size}`;
  return { variantId: sku, sku, cut, size, price: 280000, stock };
}

const singleCut = [variant('UNISEX', 'L'), variant('UNISEX', 'M'), variant('UNISEX', 'S', 0)];
const multiCut = [variant('FEMENINO', 'M'), variant('MASCULINO', 'M'), variant('MASCULINO', 'L')];

describe('quickSizes', () => {
  it('sólo devuelve talles con variante real, ordenados y marcando los agotados', () => {
    expect(quickSizes(singleCut)).toEqual([
      { size: 'S', soldOut: true },
      { size: 'M', soldOut: false },
      { size: 'L', soldOut: false },
    ]);
  });

  it('sin variantes no inventa talles', () => {
    expect(quickSizes([])).toEqual([]);
  });

  it('un talle con stock en algún corte no figura como agotado', () => {
    const sizes = quickSizes([variant('FEMENINO', 'M', 0), variant('MASCULINO', 'M', 3)]);
    expect(sizes).toEqual([{ size: 'M', soldOut: false }]);
  });
});

describe('defaultQuickSize', () => {
  it('preselecciona el primer talle con stock', () => {
    expect(defaultQuickSize(quickSizes(singleCut))).toBe('M');
  });

  it('sin talles devuelve undefined', () => {
    expect(defaultQuickSize([])).toBeUndefined();
  });
});

describe('quickVariant', () => {
  it('con un solo corte devuelve la variante real del talle', () => {
    expect(quickVariant(singleCut, 'L')?.sku).toBe('PA-CARGO-UNI-L');
  });

  it('no devuelve variantes sin stock', () => {
    expect(quickVariant(singleCut, 'S')).toBeUndefined();
  });

  it('con varios cortes no adivina: hay que elegir el corte en la ficha', () => {
    expect(needsCutChoice(multiCut)).toBe(true);
    expect(quickVariant(multiCut, 'M')).toBeUndefined();
  });

  it('con un talle inexistente no inventa un SKU', () => {
    expect(quickVariant(singleCut, 'XXL')).toBeUndefined();
    expect(quickVariant(singleCut, undefined)).toBeUndefined();
  });
});

describe('variantToCartItem', () => {
  it('arma el ítem con el SKU, corte y talle de la variante real', () => {
    const item = variantToCartItem(
      { productId: 'prod_01', productName: 'Pantalón Cargo', unitPrice: 280000, image: '/a.webp' },
      variant('UNISEX', 'M', 7)
    );
    expect(item).toMatchObject({
      variantId: 'PA-CARGO-UNI-M',
      sku: 'PA-CARGO-UNI-M',
      cut: 'UNISEX',
      size: 'M',
      quantity: 1,
      maxStock: 7,
    });
  });
});
