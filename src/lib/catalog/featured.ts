import type { CatalogProduct } from '@/types/api';

const MAX_FEATURED = 4;

export function selectFeatured(products: CatalogProduct[]): CatalogProduct[] {
  const flagged = products.filter((p) => p.isFeatured === true);
  if (flagged.length > 0) return flagged.slice(0, MAX_FEATURED);

return products.filter((p) => p.isLimitedDrop || !!p.badge).slice(0, MAX_FEATURED);
}

export function selectBento(products: CatalogProduct[], limit = 4): CatalogProduct[] {
  return products.filter((p) => p.isFeatured === true).slice(0, limit);
}

export function excludeProducts(products: CatalogProduct[], exclude: CatalogProduct[]): CatalogProduct[] {
  const ids = new Set(exclude.map((p) => p.productId));
  return products.filter((p) => !ids.has(p.productId));
}

export function selectFeaturedWithFallback(
  products: CatalogProduct[],
  limit: number,
): CatalogProduct[] {
  const featured = selectFeatured(products);
  const featuredIds = new Set(featured.map((product) => product.productId));
  const rest = products.filter((product) => !featuredIds.has(product.productId));

  return [...featured, ...rest].slice(0, limit);
}

export type BentoLayout =
  | { kind: 'none' }
  | { kind: 'hero-only'; hero: CatalogProduct; secondary: [] }
  | { kind: 'partial'; hero: CatalogProduct; secondary: CatalogProduct[] }
  | { kind: 'full'; hero: CatalogProduct; secondary: CatalogProduct[] };

export function bentoLayout(featured: CatalogProduct[]): BentoLayout {
  if (featured.length === 0) return { kind: 'none' };
  if (featured.length === 1) return { kind: 'hero-only', hero: featured[0], secondary: [] };
  if (featured.length < 4) {
    return { kind: 'partial', hero: featured[0], secondary: featured.slice(1) };
  }
  return { kind: 'full', hero: featured[0], secondary: featured.slice(1, 4) };
}
