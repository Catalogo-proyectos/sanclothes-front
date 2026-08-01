'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface TopColCategory {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  imageSrc: string;
  alt: string;
}

const TOP_CATEGORIES: TopColCategory[] = [
  {
    id: 'casual',
    title: 'CASUAL',
    subtitle: 'CONFORT DIARIO',
    href: '/catalog?category=casual',
    imageSrc: '/img/hero/IMG_3202.webp',
    alt: 'SANTS — Moda Casual',
  },
  {
    id: 'streetwear',
    title: 'STREETWEAR',
    subtitle: 'EXPRESÁ TU ESTILO',
    href: '/catalog?category=streetwear',
    imageSrc: '/img/hero/IMG_3148.webp',
    alt: 'SANTS — Streetwear Drop',
  },
  {
    id: 'sports',
    title: 'SPORTS',
    subtitle: 'RENDÍ AL MÁXIMO',
    href: '/catalog?category=performance',
    imageSrc: '/img/hero/IMG_2334.webp',
    alt: 'SANTS — Performance Sports',
  },
];

const BOTTOM_CATEGORY = {
  id: 'old-money',
  title: 'OLD MONEY',
  subtitle: 'ELEGANCIA ATEMPORAL',
  href: '/catalog?category=old-money',
  imageSrc: '/img/hero/IMG_1460.webp',
  alt: 'SANTS — Old Money Collection',
};

export default function Hero() {
  return (
    <section className="relative w-full bg-[#17191c] text-[#f6f8f9] overflow-hidden select-none">
      {/* ── DESKTOP LAYOUT (3 Equal Top Columns + 1 Full Width Bottom Banner) ── */}
      <div className="hidden md:flex flex-col w-full h-[calc(100vh-72px)] min-h-[660px] max-h-[960px] bg-[#17191c]">
        {/* Top 3 Columns Row (65% Height) */}
        <div className="flex flex-row w-full h-[65%] border-b border-white/20">
          {TOP_CATEGORIES.map((cat, index) => (
            <Link
              key={cat.id}
              href={cat.href}
              aria-label={`Explorar ${cat.title}`}
              className="group relative flex-1 h-full block overflow-hidden border-r border-white/20 last:border-r-0"
            >
              {/* Background Photo */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <Image
                  src={cat.imageSrc}
                  alt={cat.alt}
                  fill
                  priority={index === 0}
                  quality={85}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover object-center scale-100 group-hover:scale-105 group-hover:brightness-110 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
                {/* Contrast Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15 group-hover:from-black/70 transition-colors duration-500" />
              </div>

              {/* Text & Action Arrow */}
              <div className="absolute bottom-6 left-8 lg:bottom-10 lg:left-12 z-20 flex flex-col items-start gap-1">
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-[family-name:var(--font-bebas)] tracking-[0.06em] uppercase text-white leading-none drop-shadow-md group-hover:translate-x-1 transition-transform duration-300">
                  {cat.title}
                </h2>
                <p className="text-[10px] lg:text-xs font-semibold tracking-[0.22em] uppercase text-white/80 drop-shadow mb-1">
                  {cat.subtitle}
                </p>
                <div className="flex items-center text-white mt-1 group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 stroke-[2]" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Full-Width Banner Row (35% Height) */}
        <div className="relative w-full h-[35%]">
          <Link
            href={BOTTOM_CATEGORY.href}
            aria-label={`Explorar ${BOTTOM_CATEGORY.title}`}
            className="group relative w-full h-full block overflow-hidden"
          >
            {/* Background Photo */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <Image
                src={BOTTOM_CATEGORY.imageSrc}
                alt={BOTTOM_CATEGORY.alt}
                fill
                quality={85}
                sizes="(min-width: 768px) 100vw, 100vw"
                className="object-cover object-center scale-100 group-hover:scale-105 group-hover:brightness-110 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
              {/* Contrast Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15 group-hover:from-black/70 transition-colors duration-500" />
            </div>

            {/* Text & Action Arrow */}
            <div className="absolute bottom-6 left-8 lg:bottom-10 lg:left-12 z-20 flex flex-col items-start gap-1">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-[family-name:var(--font-bebas)] tracking-[0.06em] uppercase text-white leading-none drop-shadow-md group-hover:translate-x-1 transition-transform duration-300">
                {BOTTOM_CATEGORY.title}
              </h2>
              <p className="text-[10px] lg:text-xs font-semibold tracking-[0.22em] uppercase text-white/80 drop-shadow mb-1">
                {BOTTOM_CATEGORY.subtitle}
              </p>
              <div className="flex items-center text-white mt-1 group-hover:translate-x-2 transition-transform duration-300">
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 stroke-[2]" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── MOBILE RESPONSIVE LAYOUT ── */}
      <div className="flex md:hidden flex-col w-full bg-[#17191c]">
        {[...TOP_CATEGORIES, BOTTOM_CATEGORY].map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            aria-label={`Explorar ${cat.title}`}
            className="group relative w-full h-[23vh] min-h-[160px] overflow-hidden block border-b border-white/20 last:border-b-0"
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
