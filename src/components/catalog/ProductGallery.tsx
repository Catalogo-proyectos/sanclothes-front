'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Maximize2 } from 'lucide-react';
import { GalleryImage } from './productGallery.types';

interface ProductGalleryProps {
  images: GalleryImage[];
  onOpenZoom: (index: number) => void;
}

/**
 * Editorial stacked gallery with a deliberate vertical rhythm:
 *
 *   ┌──────────────────────┐
 *   │   1. HERO (wide)     │   ← aspect-[4/3] landscape
 *   └──────────────────────┘
 *   ┌──────────┐ ┌──────────┐
 *   │ 2. SMALL │ │ 3. SMALL │   ← aspect-[3/4] portrait, side-by-side
 *   └──────────┘ └──────────┘
 *   ┌──────────────────────┐
 *   │   4. LARGE (wide)    │   ← aspect-[4/3] landscape
 *   └──────────────────────┘
 *
 * Any extra images beyond the 4th are paired in a 2-col grid at the bottom.
 */
function ProductGallery({ images, onOpenZoom }: ProductGalleryProps) {
  const hero = images[0];
  const smallPair = images.slice(1, 3);
  const bottomHero = images[3];
  const extras = images.slice(4);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* ── 1. TOP HERO: large landscape ── */}
      <button
        type="button"
        onClick={() => onOpenZoom(0)}
        aria-label={`Ampliar imagen principal: ${hero.alt}`}
        className="group relative block aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden border border-zinc-200/80 bg-[#eceff1] cursor-zoom-in transition-colors duration-300 hover:border-[#17191c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
      >
        <Image
          src={hero.url}
          alt={hero.alt}
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 58vw, 830px"
          quality={85}
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <span className="absolute top-4 left-4 bg-white/90 text-[#17191c] border border-black/5 text-[9px] font-mono font-bold px-3 py-1.5 uppercase tracking-widest shadow-sm">
          EDICIÓN SANT SS26
        </span>
        <span className="absolute bottom-4 right-4 p-2.5 bg-white/90 text-black border border-black/5 shadow-sm transition-colors duration-200 group-hover:bg-black group-hover:text-white">
          <Maximize2 className="w-4 h-4" />
        </span>
      </button>

      {/* ── 2. MIDDLE: 2 small portraits side-by-side ── */}
      {smallPair.length > 0 && (
        <div className={smallPair.length === 1 ? '' : 'grid grid-cols-2 gap-3 sm:gap-4'}>
          {smallPair.map((image, i) => {
            const index = i + 1;
            return (
              <button
                key={image.url + index}
                type="button"
                onClick={() => onOpenZoom(index)}
                aria-label={`Ampliar imagen ${index + 1} de ${images.length}: ${image.alt}`}
                className="group relative block aspect-[3/4] w-full overflow-hidden border border-zinc-200/80 bg-[#eceff1] cursor-zoom-in transition-colors duration-300 hover:border-[#17191c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1440px) 29vw, 410px"
                  quality={80}
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-3 right-3 p-2 bg-white/90 text-black border border-black/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── 3. BOTTOM HERO: large landscape ── */}
      {bottomHero && (
        <button
          type="button"
          onClick={() => onOpenZoom(3)}
          aria-label={`Ampliar imagen 4 de ${images.length}: ${bottomHero.alt}`}
          className="group relative block aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden border border-zinc-200/80 bg-[#eceff1] cursor-zoom-in transition-colors duration-300 hover:border-[#17191c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
        >
          <Image
            src={bottomHero.url}
            alt={bottomHero.alt}
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 58vw, 830px"
            quality={85}
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-4 right-4 p-2.5 bg-white/90 text-black border border-black/5 shadow-sm transition-colors duration-200 group-hover:bg-black group-hover:text-white">
            <Maximize2 className="w-4 h-4" />
          </span>
        </button>
      )}

      {/* ── 4. EXTRAS: any images beyond the first 4, paired in 2-col grid ── */}
      {extras.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {extras.map((image, i) => {
            const index = i + 4;
            return (
              <button
                key={image.url + index}
                type="button"
                onClick={() => onOpenZoom(index)}
                aria-label={`Ampliar imagen ${index + 1} de ${images.length}: ${image.alt}`}
                className="group relative block aspect-[3/4] w-full overflow-hidden border border-zinc-200/80 bg-[#eceff1] cursor-zoom-in transition-colors duration-300 hover:border-[#17191c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1440px) 29vw, 410px"
                  quality={80}
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-3 right-3 p-2 bg-white/90 text-black border border-black/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(ProductGallery);

