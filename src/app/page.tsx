import ScrollLogoHero from '@/components/common/ScrollLogoHero';
import Hero from '@/components/common/Hero';
import BrandStoryHero from '@/components/common/BrandStoryHero';
import BrandVideoBanner from '@/components/common/BrandVideoBanner';
import StudioRackHero from '@/components/common/StudioRackHero';
import FeaturedProductsGrid from '@/components/common/FeaturedProductsGrid';
import StreetMotionHero from '@/components/common/StreetMotionHero';
import ShowroomExperience from '@/components/common/ShowroomExperience';
import FinalVideoBanner from '@/components/common/FinalVideoBanner';

export default function HomePage() {
  return (
    <div className="bg-[#f6f8f9] text-[#17191c]">
      {/* 0. Scroll-Driven Logo Animation (frame-by-frame con scroll) */}
      <div id="inicio" className="scroll-mt-24">
        <ScrollLogoHero />
      </div>

      {/* 1. Hero Editorial (4 columnas: Casual, Streetwear, Sports, Old Money) */}
      <div id="colecciones" className="scroll-mt-24">
        <Hero />
      </div>

      {/* 2. Brand Story Hero (Camperas & Chaquetas — SANT CLOTHES) */}
      <div id="historia" className="scroll-mt-24">
        <BrandStoryHero />
      </div>

      {/* 3. Brand Campaign Video Banner (Full Width Edge-to-Edge) */}
      <BrandVideoBanner />

      {/* 4. Studio Experience Hero (IMG_4390.jpg) */}
      <StudioRackHero />

      {/* 5. Featured Products Grid (Atelier Drop) */}
      <div id="destacados" className="scroll-mt-24">
        <FeaturedProductsGrid />
      </div>

      {/* 6. Atelier Brand Story Section */}
      <StreetMotionHero />

      {/* 7. Video Banner Final de Campaña (/img/video/video2.mp4) */}
      <FinalVideoBanner />

      {/* 8. Showroom & Studio Experience */}
      <ShowroomExperience />
    </div>
  );
}
