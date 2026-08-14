/**
 * Espejo de los tipos que emite la API de Santclothes.
 *
 * Reflejo 1:1 de backend/src/types/domain.ts + lo que arma
 * backend/src/modules/catalog/catalog.service.ts al escribir en Redis.
 * No renombrar campos acá para que "queden más lindos": la traducción al modelo
 * que consumen los componentes vive en src/lib/adapters/product.ts.
 */

/** Código de corte. Dinámico: el admin los da de alta en la tabla `cuts`. */
export type BackendCut = string;

export type DropType = 'DROP_01' | 'DROP_02' | 'ESPECIAL';

export interface BackendVariant {
  sku: string;
  stock: number;
}

export interface BackendFlashSale {
  discountType: 'PERCENTAGE' | 'FIXED' | 'OVERRIDE';
  discountValue: number;
  overridePrice?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  isActive?: boolean;
}

export interface BackendQuantityDiscount {
  minQty: number;
  discountType: 'PERCENTAGE' | 'FIXED' | 'OVERRIDE';
  discountValue: number;
}

export interface BackendComboItem {
  productId: string;
  qty: number;
  allowedSizes: string[];
  name?: string;
  images?: string[];
}

export interface BackendProduct {
  productId: string;
  slug: string;
  name: string;
  category: string;
  dropType: DropType;
  /** Guaraníes enteros pese a que el backend llame "cents" a la columna. */
  price: number;
  isDropActive: boolean;

  /**
   * Array plano legacy. NO usar como fuente de verdad: el admin lo desincroniza
   * al borrar fotos de un corte que no sea el primero (ver docs/CATALOG-IMAGES-IMPLEMENTATION.md §2.4).
   */
  images: string[];

  /** Fuente de verdad de las imágenes, agrupadas por corte. */
  imagesByCut?: Record<BackendCut, string[]>;

  /** Mapa anidado corte → talle → variante. */
  variants: Record<BackendCut, Record<string, BackendVariant>>;
  /** Alias exacto de `variants` que emite el backend por comodidad del front. */
  variantsByCut?: Record<BackendCut, Record<string, BackendVariant>>;
  availableCuts?: BackendCut[];

  discountPercent: number;
  quantityDiscounts?: BackendQuantityDiscount[];
  tags: string[];
  isLimitedDrop: boolean;
  purchaseType?: string;
  badge?: string | null;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  successMessage?: string;
  shippingEstimated?: string | null;
  flashSale?: BackendFlashSale | null;

  isCombo?: boolean;
  comboItems?: BackendComboItem[];

  showHypeCountdown?: boolean;
  publishAt?: string | null;
  unpublishAt?: string | null;

  /**
   * Marcado desde el admin en Catálogo → Bento Grid / Destacados 2×2.
   *
   * Opcional porque `catalog.service.ts` todavía puede no propagarlo a Redis:
   * mientras eso no esté desplegado el campo llega `undefined` y
   * selectFeatured() cae a su heurística de respaldo.
   */
  isFeatured?: boolean;

  /** Puede faltar si el backend aún no lo mapea al catálogo de Redis. */
  description?: string | null;
  care?: string | null;
}
