'use client';

import { useSearchParams } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import { CatalogProduct } from '@/types/api';
import { MOCK_PRODUCTS } from '@/mocks/catalog';
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
  const { data: products, loading } = useFetch<CatalogProduct[]>('GET', path);

  const displayedProducts = (products && products.length > 0) ? products : MOCK_PRODUCTS;

  return (
    <section className="py-12 bg-[#f6f8f9]">
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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {displayedProducts.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
