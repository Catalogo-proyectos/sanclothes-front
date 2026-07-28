import Hero from '@/components/common/Hero';
import AnimatedProductsCarousel from '@/components/common/AnimatedProductsCarousel';
import BrandStoryHero from '@/components/common/BrandStoryHero';
import StudioRackHero from '@/components/common/StudioRackHero';
import FeaturedProductsGrid from '@/components/common/FeaturedProductsGrid';
import StreetMotionHero from '@/components/common/StreetMotionHero';

export default function HomePage() {
  return (
    <div className="bg-[#f6f8f9] text-[#17191c]">
      {/* 1. Hero Editorial */}
      <Hero />

      {/* 2. Animated Products Showcase Carousel */}
      <AnimatedProductsCarousel />

      {/* 3. Brand Story Hero (Camperas & Chaquetas + 2x2 Product Grid) */}
      <BrandStoryHero />

      {/* 5. Studio Experience Hero (IMG_4390.jpg) */}
      <StudioRackHero />

      {/* 6. Featured Products Grid (Atelier Drop) */}
      <FeaturedProductsGrid />

      {/* 7. Atelier Brand Story Section */}
      <StreetMotionHero />
    </div>
  );
}





