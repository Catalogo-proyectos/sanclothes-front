import { config } from '@/lib/config';
import { CATALOG_STYLES } from '@/lib/catalogFilters';

export interface TaxonomyCategory {
  code: string;
  name: string;
  count: number;
}

export interface TaxonomyStyle {
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  coverImage: string | null;
  coverImageMobile: string | null;
  
  categories: TaxonomyCategory[];
}

export interface CatalogTaxonomy {
  styles: TaxonomyStyle[];
  categories: Array<TaxonomyCategory & { sortOrder: number }>;
  
  fallback?: boolean;
}

const FALLBACK_ORDER = ['casual', 'streetwear', 'old-money', 'sports'];

export const FALLBACK_TAXONOMY: CatalogTaxonomy = {
  styles: CATALOG_STYLES.map((style) => ({
    code: style.id,
    name: style.label,
    description: style.caption,
    sortOrder: (FALLBACK_ORDER.indexOf(style.id) + 1) * 10 || 100,
    coverImage: null,
    coverImageMobile: null,
    categories: [],
  })).sort((x, y) => x.sortOrder - y.sortOrder),
  categories: [],
  fallback: true,
};

function isTaxonomy(value: unknown): value is CatalogTaxonomy {
  const v = value as CatalogTaxonomy | null;
  return !!v && Array.isArray(v.styles) && Array.isArray(v.categories);
}

const FALLBACK_TTL_MS = 60_000;
let useFallbackUntil = 0;

export async function fetchTaxonomy(): Promise<CatalogTaxonomy> {
  if (!config.api.origin) return FALLBACK_TAXONOMY;
  if (Date.now() < useFallbackUntil) return FALLBACK_TAXONOMY;
  try {
    const res = await fetch(`${config.api.origin}/api/v1/catalog/taxonomy`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(1_500),
    });
    if (res.ok) {
      const data: unknown = await res.json();
      if (isTaxonomy(data) && data.styles.length > 0) return data;
    }
  } catch {

  }
  useFallbackUntil = Date.now() + FALLBACK_TTL_MS;
  return FALLBACK_TAXONOMY;
}

export function findStyle(taxonomy: CatalogTaxonomy, code: string | null | undefined): TaxonomyStyle | null {
  if (!code) return null;
  return taxonomy.styles.find((s) => s.code === code) ?? null;
}
