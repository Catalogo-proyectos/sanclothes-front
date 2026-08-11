'use client';

import Image from 'next/image';
import { ArrowDown } from 'lucide-react';

interface CatalogSplitHeroProps {
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export default function CatalogSplitHero({
  imageSrc = '/img/hero/IMG_4390.webp',
  imageAlt = 'SANT CLOTHES® — Nueva Colección Atelier',
  title = 'NUEVA COLECCIÓN',
  subtitle = 'Descubre las prendas Sant',
  buttonText = 'Ver catálogo',
}: CatalogSplitHeroProps) {
  const handleScrollToGrid = () => {
    const grid = document.getElementById('catalog-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-[#17191c] text-[#f6f8f9] overflow-hidden select-none border-b border-white/10">
      <div className="w-full min-h-[460px] lg:min-h-[560px] grid grid-cols-1 md:grid-cols-2 items-stretch">
        {/* ── LEFT COLUMN: Imagen Grande ── */}
        <div className="group relative w-full min-h-[380px] md:min-h-[500px] lg:min-h-[580px] overflow-hidden border-b md:border-b-0 md:border-r border-white/15">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            quality={85}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center scale-100 group-hover:scale-105 group-hover:brightness-105 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          />
          {/* Subtle contrast gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/45 transition-colors duration-500" />

          {/* Micro tag badge in bottom left of image */}
          <div className="absolute bottom-6 left-6 z-10">
            <span className="bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10px] font-mono font-bold px-3.5 py-1.5 uppercase tracking-[0.2em]">
              SANT CLOTHES
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Content (Title, Subtitle & CTA Button) ── */}
        <div className="flex flex-col justify-center items-start p-8 sm:p-12 lg:p-16 bg-[#17191c] text-white relative z-10">
          <div className="max-w-xl">
            {/* Tagline eyebrow */}
            <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-white/60 mb-4 border-l-2 border-white pl-3">
              DROP #01 · 2026
            </span>

            {/* Title: NUEVA COLECCIÓN */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-[family-name:var(--font-bebas)] uppercase tracking-[0.06em] text-white leading-none mb-4 drop-shadow-md">
              {title}
            </h1>

            {/* Subtitle: Descubre las prendas Sant */}
            <p className="text-base sm:text-lg lg:text-xl text-zinc-300 font-light tracking-wide leading-relaxed mb-8">
              {subtitle}
            </p>

            {/* CTA Button: [ Ver catálogo ] */}
            <button
              type="button"
              onClick={handleScrollToGrid}
              className="group h-13 sm:h-14 px-8 border-2 border-white bg-transparent text-white font-[family-name:var(--font-bebas)] text-xl sm:text-2xl tracking-[0.12em] uppercase cursor-pointer hover:bg-white hover:text-[#17191c] transition-all duration-300 flex items-center gap-3 shadow-lg active:scale-[0.98]"
            >
              <span>{buttonText}</span>
              <ArrowDown className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
