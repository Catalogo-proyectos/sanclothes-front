import { apiCall } from '@/lib/api';
import { toCatalogProduct } from '@/lib/adapters/product';
import type { BackendProduct } from '@/types/backend';
import type { CatalogProduct } from '@/types/api';

/**
 * Frontera de datos del catálogo.
 *
 * Es el único lugar del front que ve el modelo crudo de la API: acá entra
 * `BackendProduct` y sale `CatalogProduct` con las imágenes ya resueltas y
 * normalizadas. Las vistas no importan `@/types/backend` ni arman URLs.
 */

export interface CatalogQuery {
  cut?: string;
  category?: string;
  size?: string;
  color?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

function buildCatalogPath(query: CatalogQuery = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `/catalog?${qs}` : '/catalog';
}

export async function fetchCatalog(query: CatalogQuery = {}): Promise<CatalogProduct[]> {
  const raw = await apiCall<BackendProduct[]>('GET', buildCatalogPath(query));
  return (raw ?? []).map(toCatalogProduct);
}

/**
 * Producto individual.
 *
 * `GET /api/catalog/:productId` resuelve por id de producto, no por slug: busca
 * la clave `catalog:product:{id}` en Redis. Las rutas del front usan el id, así
 * que alcanza.
 */
export async function fetchProduct(productId: string): Promise<CatalogProduct | null> {
  try {
    const raw = await apiCall<BackendProduct>('GET', `/catalog/${productId}`);
    return raw ? toCatalogProduct(raw) : null;
  } catch {
    return null;
  }
}

/** Ruta de catálogo lista para `useFetch`, que cachea por string de path. */
export { buildCatalogPath };
