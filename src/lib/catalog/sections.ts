import type { CatalogProduct } from '@/types/api';

/**
 * Catálogo v2 — armado de secciones (una por tipo de prenda) con bentos.
 * Funciones puras: todo el layout del catálogo sale de acá y se testea sin DOM.
 *
 * Reglas (santclothesback/docs/PLAN-CATALOGO-V2-2026-10-05.md):
 *  - Una sección por tipo de prenda, en el orden de `sortOrder` del admin.
 *  - Sin productos marcados como bento → la sección es solo grilla de cards.
 *  - Cada bento toma hasta 4 productos de SU sección para mostrarlos al lado;
 *    un producto nunca aparece dos veces y un bento nunca se repite.
 *  - El armado depende de cuántos productos quedan al lado del bento.
 */

export type BentoArrangement =
  /** 0 al lado: el bento ocupa todo el ancho. */
  | 'banner'
  /** 1 al lado: mitad y mitad. */
  | 'split'
  /** 2 al lado: dos cards apiladas. */
  | 'stack'
  /** 3 al lado: 3 cards + tarjeta "Ver todas". */
  | 'trio'
  /** 4 al lado: 2×2. */
  | 'quad';

export const SIDE_CARDS = 4;
export const CARDS_PER_ROW = 4;
export const SECTION_GRID_ROWS = 2;

export interface BentoBand {
  bento: CatalogProduct;
  side: CatalogProduct[];
  arrangement: BentoArrangement;
}

export interface CatalogSection {
  categoryCode: string;
  categoryName: string;
  /** Total de productos de la sección (bentos incluidos). */
  total: number;
  bands: BentoBand[];
  /** Cards normales visibles debajo de los bentos. */
  grid: CatalogProduct[];
  /** Cards que quedaron fuera por el límite de filas ("Ver todas (N)"). */
  hiddenCount: number;
}

export interface CategoryOrder {
  code: string;
  name: string;
  sortOrder: number;
}

export function arrangementFor(sideCount: number): BentoArrangement {
  if (sideCount <= 0) return 'banner';
  if (sideCount === 1) return 'split';
  if (sideCount === 2) return 'stack';
  if (sideCount === 3) return 'trio';
  return 'quad';
}

const time = (p: CatalogProduct) => (p.createdAt ? Date.parse(p.createdAt) || 0 : 0);

/** Orden por defecto dentro de una sección: más nuevos primero (estable). */
export function newestFirst(products: CatalogProduct[]): CatalogProduct[] {
  return products
    .map((product, index) => ({ product, index }))
    .sort((a, b) => time(b.product) - time(a.product) || a.index - b.index)
    .map(({ product }) => product);
}

/** Bentos de una sección: prioridad ascendente (0 = primero), luego los más nuevos. */
export function orderBentos(products: CatalogProduct[]): CatalogProduct[] {
  return newestFirst(products.filter((p) => p.bento)).sort(
    (a, b) => (a.bento?.priority ?? 0) - (b.bento?.priority ?? 0)
  );
}

/**
 * Arma bandas de bento + grilla para los productos de UNA sección (ya en el
 * orden en que deben verse). `maxGridRows` limita las filas de cards normales;
 * `null` = sin límite (vista "Ver todas").
 */
export function buildSectionBody(
  products: CatalogProduct[],
  { maxGridRows = SECTION_GRID_ROWS, perRow = CARDS_PER_ROW }: { maxGridRows?: number | null; perRow?: number } = {}
): Pick<CatalogSection, 'bands' | 'grid' | 'hiddenCount'> {
  const bentos = orderBentos(products);
  const rest = products.filter((p) => !p.bento);

  let cursor = 0;
  const bands: BentoBand[] = bentos.map((bento) => {
    const side = rest.slice(cursor, cursor + SIDE_CARDS);
    cursor += side.length;
    return { bento, side, arrangement: arrangementFor(side.length) };
  });

  const remaining = rest.slice(cursor);
  const limit = maxGridRows === null ? remaining.length : Math.max(0, maxGridRows) * perRow;
  return {
    bands,
    grid: remaining.slice(0, limit),
    hiddenCount: Math.max(0, remaining.length - limit),
  };
}

/**
 * Agrupa por tipo de prenda en el orden del admin. Tipos que el catálogo trae
 * pero la taxonomía no conoce (p. ej. combos) van al final, por nombre.
 */
export function buildSections(
  products: CatalogProduct[],
  categories: CategoryOrder[],
  options?: { maxGridRows?: number | null; perRow?: number }
): CatalogSection[] {
  const byCode = new Map<string, CatalogProduct[]>();
  for (const product of newestFirst(products)) {
    const list = byCode.get(product.category) ?? [];
    list.push(product);
    byCode.set(product.category, list);
  }

  const known = new Map(categories.map((c) => [c.code, c]));
  const codes = [...byCode.keys()].sort((a, b) => {
    const ca = known.get(a);
    const cb = known.get(b);
    if (ca && cb) return ca.sortOrder - cb.sortOrder || ca.name.localeCompare(cb.name, 'es');
    if (ca) return -1;
    if (cb) return 1;
    return nameOf(a, byCode).localeCompare(nameOf(b, byCode), 'es');
  });

  return codes.map((code) => {
    const list = byCode.get(code) ?? [];
    return {
      categoryCode: code,
      categoryName: known.get(code)?.name ?? nameOf(code, byCode),
      total: list.length,
      ...buildSectionBody(list, options),
    };
  });
}

function nameOf(code: string, byCode: Map<string, CatalogProduct[]>): string {
  return byCode.get(code)?.[0]?.categoryName || code;
}

/** Título del bento: el del admin o, si no tiene, el nombre del tipo de prenda. */
export function bentoTitle(product: CatalogProduct): string {
  return product.bento?.title?.trim() || product.categoryName || product.category;
}
