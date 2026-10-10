import type { CatalogProduct } from '@/types/api';

export const SIZE_PARAM = 'talle';

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export function sortSizes(sizes: string[]): string[] {
  const rank = (size: string): number => {
    const idx = SIZE_ORDER.indexOf(size.toUpperCase());
    if (idx !== -1) return idx;
    const n = Number(size);
    return Number.isFinite(n) ? 1000 + n : Number.POSITIVE_INFINITY;
  };
  
  return [...sizes].sort((a, b) => rank(a) - rank(b));
}

export function productHref(productId: string, size?: string | null): string {
  const base = `/products/${productId}`;
  return size ? `${base}?${SIZE_PARAM}=${encodeURIComponent(size)}` : base;
}

export function initialCutForSize(product: CatalogProduct, size?: string): string {
  const defaultCut = product.cuts?.[0] ?? '';
  const variants = product.variants ?? [];
  if (!size || variants.length === 0) return defaultCut;

  const hasSize = (cut: string) => variants.some((v) => v.cut === cut && v.size === size);
  if (hasSize(defaultCut)) return defaultCut;
  return product.cuts.find(hasSize) ?? defaultCut;
}
