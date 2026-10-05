import { describe, it, expect } from 'vitest';
import { comboCartItem, comboHasStock, defaultComboSelection, toComboInfo } from '@/lib/catalog/combo';
import { toCatalogProduct } from '@/lib/adapters/product';
import type { BackendProduct } from '@/types/backend';

const opt = (token: string, stock: number, cut = 'CLASSIC') => ({ token, cut, size: token.split(' ').pop()!, sku: `SKU-${token}`, stock });

const combo = toComboInfo([
  { productId: 'remera', qty: 1, allowedSizes: [], name: 'Remera', fixed: false, options: [opt('S', 0), opt('M', 3)] },
  { productId: 'gorra', qty: 1, allowedSizes: ['U'], name: 'Gorra', fixed: true, options: [opt('U', 10)] },
  { productId: 'buzo', qty: 2, allowedSizes: [], name: 'Buzo', fixed: false, options: [opt('MASCULINO L', 5, 'MASCULINO'), opt('FEMENINO L', 1, 'FEMENINO')] },
])!;
const product = { productId: 'combo_1', title: 'Combo verano', price: 300_000, discountPrice: null };

describe('combos en la tienda', () => {
  it('arranca con el primer talle con stock de cada prenda', () => {
    expect(defaultComboSelection(combo)).toEqual({ 0: 'M', 1: 'U', 2: 'MASCULINO L' });
  });

  it('el ítem de carrito manda solo los talles elegibles, en orden, y el tope por stock', () => {
    const item = comboCartItem(product, combo, { 0: 'M', 1: 'U', 2: 'MASCULINO L' });
    expect(item?.sku).toMatch(/^combo_1~[0-9a-f]{8}$/);
    expect(comboCartItem(product, combo, { 0: 'M', 1: 'U', 2: 'FEMENINO L' }) ?? { sku: 'otro' }).not.toMatchObject({ sku: item?.sku });
    expect(item).toMatchObject({ productId: 'combo_1', size: 'M/MASCULINO L', cut: 'COMBO', unitPrice: 300_000 });
    // Remera M: 3 · Gorra: 10 · Buzo L (2 por combo): 5 → 2 combos.
    expect(item?.maxStock).toBe(2);
  });

  it('una prenda sin stock suficiente (2 por combo, 1 disponible) no se puede elegir', () => {
    expect(comboCartItem(product, combo, { 0: 'M', 1: 'U', 2: 'FEMENINO L' })).toBeNull();
  });

  it('combo sin stock en una prenda: agotado', () => {
    const none = toComboInfo([{ productId: 'x', qty: 1, allowedSizes: [], options: [opt('S', 0)] }])!;
    expect(comboHasStock(none)).toBe(false);
    expect(comboHasStock(combo)).toBe(true);
  });

  it('el adapter marca combos con su info y no los da por agotados', () => {
    const backend = {
      productId: 'combo_1', slug: 'combo', name: 'Combo', category: 'COMBOS', dropType: 'ESPECIAL', price: 300_000,
      isDropActive: true, images: [], variants: {}, discountPercent: 0, tags: [], isLimitedDrop: false,
      isCombo: true,
      comboItems: [{ productId: 'remera', qty: 1, allowedSizes: [], name: 'Remera', options: [opt('M', 3)] }],
    } as unknown as BackendProduct;
    const p = toCatalogProduct(backend);
    expect(p.combo?.items).toHaveLength(1);
    expect(p.stockStatus).toBe('IN_STOCK');
    expect(p.hype).toBeNull();
  });

  it('hype con lanzamiento futuro → cuenta regresiva; ya lanzado → producto normal', () => {
    const base = {
      productId: 'h', slug: 'h', name: 'Hype', category: 'remeras', dropType: 'DROP_01', price: 100_000,
      isDropActive: false, images: [], variants: {}, discountPercent: 0, tags: [], isLimitedDrop: false, showHypeCountdown: true,
    };
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(toCatalogProduct({ ...base, publishAt: future } as unknown as BackendProduct).hype).toEqual({ launchAt: future });
    const past = new Date(Date.now() - 86_400_000).toISOString();
    expect(toCatalogProduct({ ...base, publishAt: past } as unknown as BackendProduct).hype).toBeNull();
  });
});
