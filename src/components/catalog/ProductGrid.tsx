'use client';

import { useSearchParams } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import { CatalogProduct } from '@/types/api';
import ProductCard from './ProductCard';
import FilterBar from './FilterBar';

/**
 * Scuffers-inspired Dense Product Grid:
 * 5 columns on desktop (grid-cols-2 md:grid-cols-5), 8px tight gap (gap-2), 100vw layout.
 */
export default function ProductGrid() {
  const searchParams = useSearchParams();
  const cut = searchParams.get('cut');
  const category = searchParams.get('category');

  // Build request query
  const queryParams = new URLSearchParams();
  if (cut) queryParams.set('cut', cut);
  if (category) queryParams.set('category', category);

  const path = queryParams.toString() ? `/catalog?${queryParams.toString()}` : '/catalog';
  const { data: products, loading, error } = useFetch<CatalogProduct[]>('GET', path);

  return (
    <section className="py-12 bg-white">
      <div className="w-full px-4 sm:px-6 md:px-8">
        {/* Category Ticker & Filter Tabs */}
        <FilterBar />

        {/* Dense 5-Column Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div key={n} className="bg-zinc-100 aspect-[3/4] animate-pulse" style={{ borderRadius: '0px' }} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-zinc-50 text-zinc-900 p-8 border border-zinc-200 text-center max-w-md mx-auto my-12" style={{ borderRadius: '0px' }}>
            <p className="font-bold text-xs uppercase tracking-wider">Error al cargar el catálogo</p>
            <p className="text-[11px] text-zinc-500 mt-1">{error.message}</p>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 border border-zinc-200 my-12" style={{ borderRadius: '0px' }}>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">No hay productos en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
