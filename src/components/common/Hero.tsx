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
    alt: 'SANTS — Streetwear',
    desktopClipPath: 'polygon(0 0, 100% 0, 100% 22%, 0 48%)',
    contentPosition: 'top-14 left-10 lg:top-24 lg:left-16',
  },
  {
    id: 'casual',
    title: 'CASUAL',
    subtitle: 'CONFORT DIARIO',
    href: '/catalog?category=casual',
    imageSrc: '/img/hero/IMG_3202.webp',
    alt: 'SANTS — Moda Casual',
    desktopClipPath: 'polygon(0 48%, 50% 35%, 50% 72%, 0 72%)',
    contentPosition: 'bottom-6 left-8 lg:bottom-10 lg:left-12',
  },
  {
    id: 'old-money',
    title: 'OLD MONEY',
    subtitle: 'ELEGANCIA ATEMPORAL',
    href: '/catalog?category=old-money',
    imageSrc: '/img/hero/IMG_2334.webp',
    alt: 'SANTS — Old Money',
    desktopClipPath: 'polygon(50% 35%, 100% 22%, 100% 72%, 50% 72%)',
    contentPosition: 'bottom-6 left-8 lg:bottom-10 lg:left-12',
  },
  {
    id: 'sports',
    title: 'SPORTS',
    subtitle: 'RENDÍ AL MÁXIMO',
    href: '/catalog?category=performance',
    imageSrc: '/img/hero/IMG_1460.webp',
    alt: 'SANTS — Sports',
    desktopClipPath: 'polygon(0 72%, 100% 72%, 100% 100%, 0 100%)',
    contentPosition: 'bottom-6 left-8 lg:bottom-10 lg:left-12',
  },
];

export default function Hero() {
  return (
    <section className="relative w-full bg-[#17191c] text-[#f6f8f9] overflow-hidden select-none">
      {/* ── DESKTOP LAYOUT (Exact 3-Tier Geometry Match to Reference Image) ── */}
      <div className="hidden md:block relative w-full h-[calc(100vh-72px)] min-h-[660px] max-h-[960px] bg-[#17191c]">
        {HERO_CATEGORIES.map((cat, index) => (
          <Link
            key={cat.id}
            href={cat.href}
            aria-label={`Explorar ${cat.title}`}
            className="group absolute inset-0 w-full h-full block overflow-hidden transition-all duration-300 hover:z-20"
            style={{
              clipPath: cat.desktopClipPath,
              WebkitClipPath: cat.desktopClipPath,
            }}
          >
            {/* Photography Background */}
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

              {/* Contrast Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15 group-hover:from-black/70 transition-colors duration-500" />
            </div>

            {/* Category Text & Action Arrow */}
            <div className={`absolute ${cat.contentPosition} z-20 flex flex-col items-start gap-1`}>
              <h2 className="text-4xl lg:text-6xl xl:text-7xl font-[family-name:var(--font-bebas)] tracking-[0.06em] uppercase text-white leading-none drop-shadow-md group-hover:translate-x-1 transition-transform duration-300">
                {cat.title}
              </h2>

              <p className="text-[10px] lg:text-xs font-semibold tracking-[0.22em] uppercase text-white/80 drop-shadow mb-1">
                {cat.subtitle}
              </p>

              {/* Minimal Arrow */}
              <div className="flex items-center text-white mt-1 group-hover:translate-x-2 transition-transform duration-300">
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 stroke-[2]" />
              </div>
            </div>
          </Link>
        ))}

        {/* Precise SVG Vector Divider Seams */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1000"
        >
          {/* Seam 1: Top diagonal line (from 0,48% to 100%,22%) */}
          <line
            x1="0"
            y1="480"
            x2="1000"
            y2="220"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          {/* Seam 2: Middle vertical line (from 50%,35% to 50%,72%) */}
          <line
            x1="500"
            y1="350"
            x2="500"
            y2="720"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          {/* Seam 3: Bottom horizontal line (from 0,72% to 100%,72%) */}
          <line
            x1="0"
            y1="720"
            x2="1000"
            y2="720"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* ── MOBILE RESPONSIVE LAYOUT ── */}
      <div className="flex md:hidden flex-col w-full bg-[#17191c]">
        {HERO_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            aria-label={`Explorar ${cat.title}`}
            className="group relative w-full h-[23vh] min-h-[160px] overflow-hidden block border-b border-white/40 last:border-b-0"
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

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10" />

            {/* Content */}
            <div className="absolute inset-0 p-6 z-20 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-[family-name:var(--font-bebas)] tracking-[0.08em] uppercase text-white leading-none mb-1">
                  {cat.title}
                </h2>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/80">
                  {cat.subtitle}
                </p>
              </div>

              <div className="w-9 h-9 border border-white/80 bg-black/40 flex items-center justify-center text-white shrink-0 ml-4">
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
