import { Suspense } from 'react';
import CatalogHero from '@/components/catalog/CatalogHero';
import ProductGrid from '@/components/catalog/ProductGrid';
import { isStyleId } from '@/lib/catalogFilters';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  // Read here rather than with useSearchParams inside CatalogHero: the hero is the
  // first paint of the route, and a client-side read would render the default
  // artwork for a frame before swapping to the style's.
  const { category } = await searchParams;
  const styleId = isStyleId(category) ? category : null;

  return (
    /* The header is fixed and solid white on this route, so the hero starts just
       below it — its own white field then runs straight into the header's. */
    <div className="bg-[#f6f8f9] pt-16 sm:pt-[72px]">
      <CatalogHero styleId={styleId} />

      {/* z-10 + opaque background keeps the grid sliding over the fixed hero (Hero Cover),
          matching the home page. The cover gap itself is rendered by <CatalogHero /> so it
          always matches the hero's real height. */}
      <div className="relative z-10 bg-[#f6f8f9] shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.25)]">
        <Suspense fallback={<div className="py-12 text-center text-xs font-semibold text-zinc-400 uppercase tracking-widest">Cargando catálogo...</div>}>
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  );
}
