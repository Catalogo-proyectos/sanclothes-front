import type { CatalogProduct } from '@/types/api';



const MAX_FEATURED = 4;


export function selectFeatured(products: CatalogProduct[]): CatalogProduct[] {
  const flagged = products.filter((p) => p.isFeatured === true);
  if (flagged.length > 0) return flagged.slice(0, MAX_FEATURED);



  return products.filter((p) => p.isLimitedDrop || !!p.badge).slice(0, MAX_FEATURED);
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
