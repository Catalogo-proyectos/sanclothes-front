'use client';

import Image from 'next/image';

interface PageHeroProps {
  category?: string;
  title: string;
  subtitle?: string;
  image?: string;
  mobileImage?: string;
  align?: 'left' | 'center';
  compact?: boolean;
  tall?: boolean;
  preserveColor?: boolean;
}

export default function PageHero({
  category = 'SANCLOTHES / COLECCIÓN CONTEMPORÁNEA',
  title,
  subtitle,
  image = '/img/web/hero/hero-catalogo-2.webp',
  mobileImage,
  align = 'center',
  compact = false,
  tall = false,
  preserveColor = false,
}: PageHeroProps) {
  const heightClasses = tall
    ? 'min-h-[380px] sm:min-h-[420px] lg:min-h-[480px] pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20 flex flex-col justify-end'
    : compact
      ? 'pt-28 pb-12 sm:pt-32 sm:pb-16'
      : 'pt-32 pb-20 sm:pt-40 sm:pb-28';

  const imageOpacity = preserveColor ? 'opacity-85' : 'opacity-25';
  const imageFilter = preserveColor ? 'contrast-105 brightness-95' : 'grayscale contrast-125 brightness-75';
  const overlayGradient = preserveColor
    ? 'bg-gradient-to-t from-black/85 via-black/30 to-black/10'
    : 'bg-gradient-to-t from-black via-black/80 to-black/40';

  return (
    <section className={`relative w-full bg-zinc-950 text-white overflow-hidden border-b border-zinc-900 ${heightClasses}`}>
      
      {mobileImage && (
        <div className={`sm:hidden absolute inset-0 z-0 ${imageOpacity}`}>
          <Image
            src={mobileImage}
            alt={title}
            fill
            priority
            quality={90}
            sizes="(max-width: 639px) 100vw, 0px"
            className={`object-cover object-center ${imageFilter}`}
          />
        </div>
      )}

{image && (
        <div className={`${mobileImage ? 'hidden sm:block' : ''} absolute inset-0 z-0 ${imageOpacity}`}>
          <Image
            src={image}
            alt={title}
            fill
            priority
            quality={90}
            sizes={mobileImage ? '(min-width: 640px) 100vw, 0px' : '100vw'}
            className={`object-cover object-center ${imageFilter}`}
          />
        </div>
      )}

<div className={`absolute inset-0 z-10 ${overlayGradient}`} />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-8">
        <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}>
          <span className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-300 mb-3 bg-black/50 border border-white/15 px-3.5 py-1 backdrop-blur-sm">
            {category}
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-[family-name:var(--font-bebas)] tracking-wider text-white uppercase leading-none mb-3 drop-shadow-md">
            {title}
          </h1>

          {subtitle && (
            <p className={`max-w-2xl font-mono text-xs leading-relaxed tracking-wide text-zinc-200 drop-shadow-sm sm:text-sm ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
