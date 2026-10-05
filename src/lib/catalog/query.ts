import type { CatalogProduct } from '@/types/api';

/**
 * Catálogo v2 — estado del catálogo en la URL y filtros. Funciones puras.
 *
 *   ?category=<estilo>   (se mantiene el nombre por los links ya publicados)
 *   &tipo=<código>       tipo de prenda
 *   &talle=S,M           talles (cualquiera)
 *   &genero=hombre|mujer
 *   &min=&max=           precio final (con descuento) en guaraníes
 *   &disponible=1        solo con stock (si hay talle elegido: stock en ese talle)
 *   &orden=nuevos|precio-asc|precio-desc
 */

export type SortId = 'nuevos' | 'precio-asc' | 'precio-desc';
export type GenderId = 'hombre' | 'mujer';

export interface CatalogQuery {
  style: string | null;
  tipo: string | null;
  sizes: string[];
  gender: GenderId | null;
  min: number | null;
  max: number | null;
  onlyAvailable: boolean;
  sort: SortId;
}

export const DEFAULT_SORT: SortId = 'nuevos';
export const PAGE_SIZE = 24;

type ParamsLike = { get(name: string): string | null };

const toNumber = (v: string | null): number | null => {
  if (v == null || v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};

export function parseCatalogQuery(params: ParamsLike): CatalogQuery {
  const sort = params.get('orden');
  const gender = params.get('genero');
  return {
    style: params.get('category')?.trim() || null,
    tipo: params.get('tipo')?.trim() || null,
    sizes: (params.get('talle') ?? '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
    gender: gender === 'hombre' || gender === 'mujer' ? gender : null,
    min: toNumber(params.get('min')),
    max: toNumber(params.get('max')),
    onlyAvailable: params.get('disponible') === '1',
    sort: sort === 'precio-asc' || sort === 'precio-desc' ? sort : DEFAULT_SORT,
  };
}

/** Serializa la query (solo lo que no es default) para armar links. */
export function catalogHref(query: Partial<CatalogQuery>): string {
  const p = new URLSearchParams();
  if (query.style) p.set('category', query.style);
  if (query.tipo) p.set('tipo', query.tipo);
  if (query.sizes?.length) p.set('talle', query.sizes.join(','));
  if (query.gender) p.set('genero', query.gender);
  if (query.min != null) p.set('min', String(query.min));
  if (query.max != null) p.set('max', String(query.max));
  if (query.onlyAvailable) p.set('disponible', '1');
  if (query.sort && query.sort !== DEFAULT_SORT) p.set('orden', query.sort);
  const qs = p.toString();
  return qs ? `/catalog?${qs}` : '/catalog';
}

/**
 * ¿Hay algún filtro además del estilo? Con filtros activos el catálogo pasa a
 * grilla simple sin bentos (un bento de chaquetas filtrado por talle XS sin
 * productos al lado no tiene sentido).
 */
export function hasActiveFilters(q: CatalogQuery): boolean {
  return (
    q.tipo !== null ||
    q.sizes.length > 0 ||
    q.gender !== null ||
    q.min !== null ||
    q.max !== null ||
    q.onlyAvailable ||
    q.sort !== DEFAULT_SORT
  );
}

export const finalPrice = (p: CatalogProduct) => p.discountPrice ?? p.price;

// Cortes neutros: valen para hombre y para mujer.
const NEUTRAL_CUTS = new Set(['CLASSIC', 'UNISEX']);
const GENDER_CUT: Record<GenderId, string> = { hombre: 'MASCULINO', mujer: 'FEMENINO' };

export function matchesGender(p: CatalogProduct, gender: GenderId): boolean {
  return p.cuts.some((cut) => cut === GENDER_CUT[gender] || NEUTRAL_CUTS.has(cut));
}

function hasStockIn(p: CatalogProduct, sizes: string[]): boolean {
  if (!p.variants?.length) return p.stockStatus !== 'OUT_OF_STOCK';
  return p.variants.some((v) => v.stock > 0 && (sizes.length === 0 || sizes.includes(v.size.toUpperCase())));
}

/** Filtro por estilo. `legacy` se usa solo si el backend todavía no manda `styles`. */
export function filterByStyleCode(
  products: CatalogProduct[],
  style: string | null,
  legacy?: (products: CatalogProduct[], style: string) => CatalogProduct[]
): CatalogProduct[] {
  if (!style) return products;
  const backendSendsStyles = products.some((p) => p.styles.length > 0);
  if (!backendSendsStyles && legacy) return legacy(products, style);
  return products.filter((p) => p.styles.includes(style));
}

export function applyFilters(products: CatalogProduct[], q: CatalogQuery): CatalogProduct[] {
  return products.filter((p) => {
    if (q.tipo && p.category !== q.tipo) return false;
    if (q.sizes.length > 0 && !p.sizes.some((s) => q.sizes.includes(s.toUpperCase()))) return false;
    if (q.gender && !matchesGender(p, q.gender)) return false;
    const price = finalPrice(p);
    if (q.min !== null && price < q.min) return false;
    if (q.max !== null && price > q.max) return false;
    if (q.onlyAvailable && !hasStockIn(p, q.sizes)) return false;
    return true;
  });
}

export function sortProducts(products: CatalogProduct[], sort: SortId): CatalogProduct[] {
  const indexed = products.map((product, index) => ({ product, index }));
  const time = (p: CatalogProduct) => (p.createdAt ? Date.parse(p.createdAt) || 0 : 0);
  indexed.sort((a, b) => {
    if (sort === 'precio-asc') return finalPrice(a.product) - finalPrice(b.product) || a.index - b.index;
    if (sort === 'precio-desc') return finalPrice(b.product) - finalPrice(a.product) || a.index - b.index;
    return time(b.product) - time(a.product) || a.index - b.index;
  });
  return indexed.map(({ product }) => product);
}

/** Talles presentes en una lista, en orden de talle conocido y luego alfabético. */
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
export function availableSizes(products: CatalogProduct[]): string[] {
  const set = new Set(products.flatMap((p) => p.sizes.map((s) => s.toUpperCase())));
  return [...set].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, 'es', { numeric: true });
  });
}
