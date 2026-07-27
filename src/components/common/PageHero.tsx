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
  image = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=85',
  align = 'center',
  compact = false,
}: PageHeroProps) {
  return (
    <section className={`relative w-full bg-zinc-950 text-white overflow-hidden border-b border-zinc-900 ${compact ? 'py-12 sm:py-16' : 'py-20 sm:py-28'}`}>
      {/* Background Image with Dark Vignette Overlay */}
      {image && (
        <div className="absolute inset-0 z-0 opacity-25">
          <Image
            src={image}
            alt={title}
            fill
            priority
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
