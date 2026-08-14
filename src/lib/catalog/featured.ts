import type { CatalogProduct } from '@/types/api';

/**
 * Selección y layout del Bento Grid de destacados de la portada.
 *
 * Trabaja sobre `CatalogProduct` (el modelo ya adaptado) para que las vistas no
 * manejen dos formas del mismo producto. El adaptador arrastra `isFeatured`,
 * `isLimitedDrop` y `badge` justamente para esta decisión.
 */

const MAX_FEATURED = 4;

/**
 * Productos destacados para el Bento 2×2.
 *
 * El admin los marca en Catálogo → Bento Grid / Destacados 2×2, que escribe
 * `is_featured` en la base. Ese flag todavía puede no llegar al storefront: el
 * catálogo se sirve desde Redis y `catalog.service.ts` tiene que propagarlo al
 * sincronizar. Mientras no llegue, `isFeatured` viene `undefined` en todos los
 * productos y caemos a una heurística para no dejar el bloque vacío.
 *
 * Cuando el backend propague el flag, esta función pasa a devolver exactamente
 * lo que el admin marcó, sin tocar ninguna vista.
 */
export function selectFeatured(products: CatalogProduct[]): CatalogProduct[] {
  const flagged = products.filter((p) => p.isFeatured === true);
  if (flagged.length > 0) return flagged.slice(0, MAX_FEATURED);

  // Respaldo: drops limitados y prendas con badge son lo más cercano a "destacado"
  // que el catálogo expone hoy sin el flag.
  return products.filter((p) => p.isLimitedDrop || !!p.badge).slice(0, MAX_FEATURED);
}

export type BentoLayout =
  | { kind: 'none' }
  | { kind: 'hero-only'; hero: CatalogProduct; secondary: [] }
  | { kind: 'partial'; hero: CatalogProduct; secondary: CatalogProduct[] }
  | { kind: 'full'; hero: CatalogProduct; secondary: CatalogProduct[] };

/**
 * Reglas de renderizado del Bento según cuántos destacados haya.
 *
 * Con 2 o 3 productos se dibuja el héroe más solo los slots secundarios que
 * existan, en vez de rellenar la grilla con huecos: media grilla vacía se lee
 * como un error de carga.
 */
export function bentoLayout(featured: CatalogProduct[]): BentoLayout {
  if (featured.length === 0) return { kind: 'none' };
  if (featured.length === 1) return { kind: 'hero-only', hero: featured[0], secondary: [] };
  if (featured.length < 4) {
    return { kind: 'partial', hero: featured[0], secondary: featured.slice(1) };
  }
  return { kind: 'full', hero: featured[0], secondary: featured.slice(1, 4) };
}
