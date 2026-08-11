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
}

const CATEGORIES: HeroCategory[] = [
  {
    id: 'casual',
    title: 'CASUAL',
    subtitle: 'CONFORT DIARIO',
    href: '/catalog?category=casual',
    imageSrc: '/img/hero/IMG_3202.webp',
    alt: 'SANT — Moda Casual',
  },
  {
    id: 'streetwear',
    title: 'STREETWEAR',
    subtitle: 'EXPRESÁ TU ESTILO',
    href: '/catalog?category=streetwear',
    imageSrc: '/img/hero/IMG_3148.webp',
    alt: 'SANT — Streetwear Drop',
  },
  {
    id: 'old-money',
    title: 'OLD MONEY',
    subtitle: 'ELEGANCIA ATEMPORAL',
    href: '/catalog?category=old-money',
    imageSrc: '/img/hero/IMG_2334.webp',
    alt: 'SANT — Old Money Collection',
  },
  {
    id: 'sports',
    title: 'SPORTS',
    subtitle: 'RENDÍ AL MÁXIMO',
    href: '/catalog?category=sports',
    imageSrc: '/img/hero/IMG_1460.webp',
    alt: 'SANT — Performance Sports',
  },
];

export default function Hero() {
  return (
    <section
      id="hero-cover-zone"
      className="relative w-full bg-[#17191c] text-[#f6f8f9] overflow-hidden select-none"
    >
      {/*
        Empalme con el video hero: las fotos emergen desde #17191c en lugar de
        aparecer con un corte horizontal duro contra la sección anterior.
      */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-14 md:h-28 lg:h-36 bg-gradient-to-b from-[#17191c] via-[#17191c]/55 to-transparent" />

      {/* ── DESKTOP LAYOUT (4 side-by-side columns, hovered one expands) ── */}
      <div className="hidden md:flex flex-row w-full h-[calc(100vh-72px)] min-h-[600px] max-h-[900px] bg-[#17191c]">
        {CATEGORIES.map((cat, index) => (
          <Link
            key={cat.id}
            href={cat.href}
            aria-label={`Explorar ${cat.title}`}
            className="group relative h-full flex-1 hover:flex-[2.2] transition-[flex] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] block overflow-hidden border-r border-white/20 last:border-r-0"
          >
            {/* Background Photo */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <Image
                src={cat.imageSrc}
                alt={cat.alt}
                fill
                priority={index === 0}
                quality={85}
                sizes="(min-width: 768px) 25vw, 100vw"
                className="object-cover object-center scale-100 group-hover:scale-105 group-hover:brightness-110 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
              {/* Dark Gradient Overlay for Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent group-hover:from-black/75 transition-colors duration-500" />
            </div>

            {/* White Title & Subtitle Overlay at Bottom of Each Column */}
            <div className="absolute bottom-8 left-6 right-6 lg:bottom-12 lg:left-8 lg:right-8 z-20 flex flex-col items-start gap-1">
              <h2 className="text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-[family-name:var(--font-bebas)] tracking-wider uppercase text-white leading-none drop-shadow-md group-hover:translate-x-1 transition-transform duration-300">
                {cat.title}
              </h2>
              <p className="text-[10px] lg:text-xs font-mono font-semibold tracking-[0.2em] uppercase text-white/90 drop-shadow mt-1">
                {cat.subtitle}
              </p>
              <div className="pt-2 flex items-center gap-2 text-white group-hover:translate-x-2 transition-transform duration-300">
                <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 stroke-[2]" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── MOBILE RESPONSIVE LAYOUT ── */}
      <div className="flex md:hidden flex-col w-full bg-[#17191c]">
        {CATEGORIES.map((cat) => (
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
                <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-white/90">
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
