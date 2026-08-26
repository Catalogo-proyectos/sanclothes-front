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


export function useCatalog(query: CatalogQuery = {}): UseCatalogResult {
  const path = buildCatalogPath(query);
  const { data, loading, error, refetch } = useFetch<BackendProduct[]>('GET', path);

  const products = useMemo(() => (data ?? []).map(toCatalogProduct), [data]);

  return { products, loading, error, refetch };
}
