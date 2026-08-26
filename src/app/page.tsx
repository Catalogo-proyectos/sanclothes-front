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
        <FeaturedProductsGrid />
      </div>


      <StreetMotionHero />


      <FinalVideoBanner />


      <ShowroomExperience />
    </div>
  );
}
