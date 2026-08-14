'use client';

import Image from 'next/image';

interface PageHeroProps {
  category?: string;
  title: string;
  subtitle?: string;
  image?: string;
  align?: 'left' | 'center';
  compact?: boolean;
}

export default function PageHero({
  category = 'SANCLOTHES / COLECCIÓN CONTEMPORÁNEA',
  title,
  subtitle,
  image = '/img/hero/Hero-Catalogo2.jpeg',
  align = 'center',
  compact = false,
}: PageHeroProps) {
  return (
    // Top padding clears the fixed header, which is now two rows tall (bar +
    // category chip rail) — 116px at sm and up.
    <section className={`relative w-full bg-zinc-950 text-white overflow-hidden border-b border-zinc-900 ${compact ? 'pt-28 pb-12 sm:pt-32 sm:pb-16' : 'pt-32 pb-20 sm:pt-40 sm:pb-28'}`}>
      {/* Background Image with Dark Vignette Overlay */}
      {image && (
        <div className="absolute inset-0 z-0 opacity-25">
          <Image
            src={image}
            alt={title}
            fill
            priority
            quality={70}
            // Fondo a sangre completa que además va al 25% de opacidad, en
            // escala de grises y desenfocado por contraste: no necesita detalle.
            sizes="100vw"
            className="object-cover object-center grayscale contrast-125 brightness-75"
          />
        </div>
      )}

      {/* Gradient Vignette Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-black/40" />

      {/* Hero Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8">
        <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}>
          {/* Eyebrow Tag */}
          <span className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400 mb-3 bg-black/40 border border-white/10 px-3.5 py-1">
            {category}
          </span>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase font-sans leading-tight mb-4">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-base text-zinc-300 font-light leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
