'use client';

import { useFetch } from '@/hooks/useFetch';
import { CatalogProduct } from '@/types/api';
import ProductCard from '@/components/catalog/ProductCard';

/**
 * COLUMNS_PER_ROW defines how many products fill one visual row at desktop width.
 * 5 columns × 3 rows = 15 products per block.
 */
const COLS = 5;
const ROWS_PER_BLOCK = 3;
const PRODUCTS_PER_BLOCK = COLS * ROWS_PER_BLOCK;

interface HomeProductGridProps {
  /** 'top' = first 3 rows, 'bottom' = next 3 rows */
  position: 'top' | 'bottom';
}

export default function HomeProductGrid({ position }: HomeProductGridProps) {
  const { data: products, loading, error } = useFetch<CatalogProduct[]>('GET', '/catalog');

  if (error) {
    return (
      <section className="w-full px-4 sm:px-6 md:px-8 py-8 bg-[#f6f8f9]">
        <div
          className="bg-zinc-50 text-zinc-900 p-8 border border-zinc-200 text-center max-w-md mx-auto"
          style={{ borderRadius: '0px' }}
        >
          <p className="font-bold text-xs uppercase tracking-wider">Error al cargar productos</p>
        </div>
      </section>
    );
  }

  if (loading || !products) {
    return (
      <section className="w-full px-4 sm:px-6 md:px-8 py-4 bg-[#f6f8f9]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {Array.from({ length: PRODUCTS_PER_BLOCK }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-100 aspect-[3/4] animate-pulse"
              style={{ borderRadius: '0px' }}
            />
          ))}
        </div>
      </section>
    );
  }

  // Split products into two blocks
  const startIndex = position === 'top' ? 0 : PRODUCTS_PER_BLOCK;
  const slice = products.slice(startIndex, startIndex + PRODUCTS_PER_BLOCK);

  if (slice.length === 0) return null;

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 py-4 bg-[#f6f8f9]">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
        {slice.map((product) => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>
    </section>
  );
}
