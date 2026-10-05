import { config } from '@/lib/config';
import { CATALOG_STYLES } from '@/lib/catalogFilters';

/**
 * Catálogo v2 — estilos (Casual, Streetwear, …) y tipos de prenda, editables
 * desde el admin. Alimenta menú, footer, hero, sitemap, filtros y secciones.
 *
 * Si la API no responde (o es un backend anterior al catálogo v2), se usan los
 * 4 estilos que antes estaban fijos en el front: el menú nunca queda vacío.
 */

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
  /** Tipos de prenda con productos visibles en este estilo, en orden del admin. */
  categories: TaxonomyCategory[];
}

export interface CatalogTaxonomy {
  styles: TaxonomyStyle[];
  categories: Array<TaxonomyCategory & { sortOrder: number }>;
  /** true = datos de respaldo locales (la API no respondió). */
  fallback?: boolean;
}

export const FALLBACK_TAXONOMY: CatalogTaxonomy = {
  styles: CATALOG_STYLES.map((style, index) => ({
    code: style.id,
    name: style.label,
    description: style.caption,
    sortOrder: (index + 1) * 10,
    coverImage: null,
    coverImageMobile: null,
    categories: [],
  })),
  categories: [],
  fallback: true,
};

function isTaxonomy(value: unknown): value is CatalogTaxonomy {
  const v = value as CatalogTaxonomy | null;
  return !!v && Array.isArray(v.styles) && Array.isArray(v.categories);
}

/** Server-side: se revalida cada 5 minutos (los cambios del admin aparecen solos). */
export async function fetchTaxonomy(): Promise<CatalogTaxonomy> {
  if (config.api.useMock || !config.api.origin) return FALLBACK_TAXONOMY;
  try {
    const res = await fetch(`${config.api.origin}/api/v1/catalog/taxonomy`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return FALLBACK_TAXONOMY;
    const data: unknown = await res.json();
    return isTaxonomy(data) && data.styles.length > 0 ? data : FALLBACK_TAXONOMY;
  } catch {
    return FALLBACK_TAXONOMY;
  }
}

export function findStyle(taxonomy: CatalogTaxonomy, code: string | null | undefined): TaxonomyStyle | null {
  if (!code) return null;
  return taxonomy.styles.find((s) => s.code === code) ?? null;
}
