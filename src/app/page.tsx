import { Suspense } from 'react';
import ScrollLogoHero from '@/components/common/ScrollLogoHero';
import Hero from '@/components/common/Hero';
import BrandStoryHero from '@/components/common/BrandStoryHero';
import BrandVideoBanner from '@/components/common/BrandVideoBanner';
import StudioRackHero from '@/components/common/StudioRackHero';
import FeaturedProductsGrid from '@/components/common/FeaturedProductsGrid';
import StreetMotionHero from '@/components/common/StreetMotionHero';
import ShowroomExperience from '@/components/common/ShowroomExperience';
import FinalVideoBanner from '@/components/common/FinalVideoBanner';
import { fetchCatalog } from '@/lib/services/catalog';
import { selectFeaturedWithFallback } from '@/lib/catalog/featured';
import type { CatalogProduct } from '@/types/api';

async function FeaturedProductsSection() {
  let products: CatalogProduct[] = [];
  try {
    products = await fetchCatalog();
  } catch {
    // The rest of the home can stream even if the catalog API is unavailable.
  }

  return (
    <FeaturedProductsGrid products={selectFeaturedWithFallback(products, 8)} />
  );
}

function FeaturedProductsFallback() {
  return (
    <section className="w-full bg-[#f6f8f9] px-6 py-20 sm:px-12" aria-hidden>
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2.5">
            <div className="aspect-[3/4] w-full animate-pulse bg-zinc-200" />
            <div className="h-[105px] animate-pulse bg-zinc-100" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="bg-[#f6f8f9] text-[#17191c]">

      <div id="inicio" className="scroll-mt-24">
        <ScrollLogoHero />
      </div>


      <div id="colecciones" className="scroll-mt-24">
        <Hero />
      </div>


      <div id="historia" className="scroll-mt-24">
        <BrandStoryHero />
      </div>


      <BrandVideoBanner />


      <StudioRackHero />


      <div id="destacados" className="scroll-mt-24">
        <Suspense fallback={<FeaturedProductsFallback />}>
          <FeaturedProductsSection />
        </Suspense>
      </div>


      <StreetMotionHero />


      <FinalVideoBanner />


      <ShowroomExperience />
    </div>
  );
}
