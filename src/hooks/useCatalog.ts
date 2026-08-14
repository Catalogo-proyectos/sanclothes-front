'use client';

import { useMemo } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { toCatalogProduct } from '@/lib/adapters/product';
import { buildCatalogPath, type CatalogQuery } from '@/lib/services/catalog';
import type { BackendProduct } from '@/types/backend';
import type { CatalogProduct } from '@/types/api';

interface UseCatalogResult {
  products: CatalogProduct[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Catálogo para componentes cliente, ya adaptado al modelo de vista.
 *
 * `useFetch` devuelve el payload crudo de la API; adaptar en cada componente
 * significaría repetir el mapeo (y olvidarse de normalizar las URLs de imagen en
 * alguno). El path se arma como string para que la dependencia de `useFetch` sea
 * estable entre renders aunque el objeto de query se recree.
 */
export function useCatalog(query: CatalogQuery = {}): UseCatalogResult {
  const path = buildCatalogPath(query);
  const { data, loading, error, refetch } = useFetch<BackendProduct[]>('GET', path);

  const products = useMemo(() => (data ?? []).map(toCatalogProduct), [data]);

  return { products, loading, error, refetch };
}
