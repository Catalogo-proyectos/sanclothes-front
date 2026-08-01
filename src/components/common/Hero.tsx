'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface HeroCategory {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  imageSrc: string;
  alt: string;
  desktopClipPath: string;
  contentPosition: string;
}

const HERO_CATEGORIES: HeroCategory[] = [
  {
    id: 'streetwear',
    title: 'STREETWEAR',
    subtitle: 'EXPRESÁ TU ESTILO',
    href: '/catalog?category=streetwear',
    imageSrc: '/img/hero/IMG_3148.webp',
    alt: 'SANTS — Streetwear Drop',
    desktopClipPath: 'polygon(0 0, 64% 0, 48% 62%, 0 54%)',
    contentPosition: 'top-12 left-8 lg:top-20 lg:left-14',
  },
  {
    id: 'old-money',
    title: 'OLD MONEY',
    subtitle: 'ELEGANCIA ATEMPORAL',
    href: '/catalog?category=old-money',
    imageSrc: '/img/hero/IMG_2334.webp',
    alt: 'SANTS — Old Money Collection',
    desktopClipPath: 'polygon(64% 0, 100% 0, 100% 70%, 48% 62%)',
    contentPosition: 'bottom-20 right-10 lg:bottom-28 lg:right-16 text-left',
  },
  {
    id: 'casual',
    title: 'CASUAL',
    subtitle: 'CONFORT DIARIO',
    href: '/catalog?category=casual',
    imageSrc: '/img/hero/IMG_3202.webp',
    alt: 'SANTS — Moda Casual',
    desktopClipPath: 'polygon(0 54%, 48% 62%, 49% 77%, 0 71%)',
    contentPosition: 'bottom-6 left-8 lg:bottom-8 lg:left-14',
  },
  {
    id: 'sports',
    title: 'SPORTS',
    subtitle: 'RENDÍ AL MÁXIMO',
    href: '/catalog?category=performance',
    imageSrc: '/img/hero/IMG_1460.webp',
    alt: 'SANTS — High Performance Sports',
    desktopClipPath: 'polygon(0 71%, 49% 77%, 100% 70%, 100% 100%, 0 100%)',
    contentPosition: 'bottom-6 left-8 lg:bottom-10 lg:left-14',
  },
];

export default function Hero() {
  return (
    <section className="relative w-full bg-[#17191c] text-[#f6f8f9] overflow-hidden select-none">
      {/* ── DESKTOP ASYMMETRIC DIAGONAL GRID (4 Slanted Dynamic Panels) ── */}
      <div className="hidden md:block relative w-full h-[calc(100vh-72px)] min-h-[640px] max-h-[920px] bg-[#17191c]">
        {HERO_CATEGORIES.map((cat, index) => (
          <Link
            key={cat.id}
            href={cat.href}
            aria-label={`Explorar categoría ${cat.title}`}
            className="group absolute inset-0 w-full h-full block overflow-hidden transition-opacity duration-300 hover:z-20"
            style={{
              clipPath: cat.desktopClipPath,
              WebkitClipPath: cat.desktopClipPath,
            }}
          >
            {/* Background Photography with Zoom Transition */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <Image
                src={cat.imageSrc}
                alt={cat.alt}
                fill
                priority={index === 0}
                quality={85}
                sizes="(min-width: 768px) 100vw, 100vw"
                className="object-cover object-center scale-100 group-hover:scale-105 group-hover:brightness-110 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />

              {/* High Contrast Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20 group-hover:from-black/75 transition-colors duration-500" />
            </div>

            {/* Panel Text & Action Overlay */}
            <div className={`absolute ${cat.contentPosition} z-20 flex flex-col items-start gap-1`}>
              <h2 className="text-4xl lg:text-6xl xl:text-7xl font-[family-name:var(--font-bebas)] tracking-[0.06em] uppercase text-white leading-none drop-shadow-lg group-hover:translate-x-1 transition-transform duration-300">
                {cat.title}
              </h2>

              <p className="text-[11px] lg:text-xs font-semibold tracking-[0.25em] uppercase text-white/80 drop-shadow mb-2">
                {cat.subtitle}
              </p>

              {/* Arrow Indicator */}
              <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 text-white group-hover:translate-x-2 transition-transform duration-300">
                <ArrowRight className="w-6 h-6 stroke-[2]" />
              </div>
            </div>
          </Link>
        ))}

        {/* Crisp Vector Border Lines Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1000"
        >
          {/* Seam 1: Streetwear & Old Money top diagonal */}
          <line
            x1="640"
            y1="0"
            x2="480"
            y2="620"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="3.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Seam 2: Streetwear & Casual horizontal slant */}
          <line
            x1="0"
            y1="540"
            x2="480"
            y2="620"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="3.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Seam 3: Casual & Sports vertical slant */}
          <line
            x1="0"
            y1="710"
            x2="490"
            y2="770"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="3.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Seam 4: Old Money & Sports bottom slant */}
          <line
            x1="480"
            y1="620"
            x2="1000"
            y2="700"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="3.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Seam 5: Casual right boundary */}
          <line
            x1="480"
            y1="620"
            x2="490"
            y2="770"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="3.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* ── MOBILE SLANTED CAROUSEL / CARDS LAYOUT ── */}
      <div className="flex md:hidden flex-col w-full bg-[#17191c]">
        {HERO_CATEGORIES.map((cat, idx) => (
          <Link
            key={cat.id}
            href={cat.href}
            aria-label={`Explorar ${cat.title}`}
            className="group relative w-full h-[24vh] min-h-[170px] overflow-hidden block -mt-2 first:mt-0"
            style={{
              clipPath:
                idx === 0
                  ? 'polygon(0 0, 100% 0, 100% 90%, 0 100%)'
                  : idx === HERO_CATEGORIES.length - 1
                  ? 'polygon(0 10%, 100% 0, 100% 100%, 0 100%)'
                  : 'polygon(0 8%, 100% 0, 100% 92%, 0 100%)',
            }}
          >
            {/* Background Photo */}
            <Image
              src={cat.imageSrc}
              alt={cat.alt}
              fill
              quality={80}
              sizes="100vw"
              className="object-cover object-center scale-100 group-active:scale-105 transition-transform duration-500"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10" />

            {/* Content Row */}
            <div className="absolute inset-0 p-6 z-20 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-[family-name:var(--font-bebas)] tracking-[0.08em] uppercase text-white leading-none mb-1">
                  {cat.title}
                </h2>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80">
                  {cat.subtitle}
                </p>
              </div>

              <div className="w-10 h-10 border border-white/80 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white shrink-0 ml-4">
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </div>
            </div>

            {/* Mobile Slanted Divider Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/70 z-30" />
          </Link>
        ))}
      </div>
    </section>
  );
}
