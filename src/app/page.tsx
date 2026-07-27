import Hero from '@/components/common/Hero';
import RackStudioHero from '@/components/common/RackStudioHero';
import AnimatedProductsCarousel from '@/components/common/AnimatedProductsCarousel';
import StreetMotionHero from '@/components/common/StreetMotionHero';
import ExploreCollectionsSection from '@/components/common/ExploreCollectionsSection';
import DualSplitHeroSection from '@/components/common/DualSplitHeroSection';
import CategoryGrid from '@/components/common/CategoryGrid';
import ValuePropsSection from '@/components/common/ValuePropsSection';
import EditorialSection from '@/components/common/EditorialSection';
import FeaturedCollection from '@/components/common/FeaturedCollection';
import NewsletterSection from '@/components/common/NewsletterSection';

export default function HomePage() {
  return (
    <div className="bg-[#f6f8f9] text-[#17191c]">
      {/* 1. Hero Editorial (4 Column Split Portal) */}
      <Hero />

      {/* 2. Poster Hero: THE NEW ERA (Studio Rack Poster Layout) */}
      <RackStudioHero />

      {/* 3. Animated Products Showcase Carousel (Studio Presentation Mode) */}
      <AnimatedProductsCarousel />

      {/* 4. Street Motion Hero (Skate Longboard & Flowers Editorial) */}
      <StreetMotionHero />

      {/* 5. Explore Collections (Reference Layout) */}
      <ExploreCollectionsSection />

      {/* 6. Dual Split Hero 50/50 (Colección Customs / Varsity Supra) */}
      <DualSplitHeroSection />

      {/* 7. Selection by Category */}
      <CategoryGrid />

      {/* 8. Quality & Brand Pillars */}
      <ValuePropsSection />

      {/* 9. Editorial Manifesto Section */}
      <EditorialSection />

      {/* 10. Capsule & Collection Highlight */}
      <FeaturedCollection />

      {/* 12. Newsletter & Final CTA */}
      <NewsletterSection />
    </div>
  );
}



