'use client';

import { useEffect, useState } from 'react';
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
    alt: 'SANT - Moda Casual',
  },
  {
    id: 'streetwear',
    title: 'STREETWEAR',
    subtitle: 'EXPRESA TU ESTILO',
    href: '/catalog?category=streetwear',
    imageSrc: '/img/hero/IMG_3148.webp',
    alt: 'SANT - Streetwear Drop',
  },
  {
    id: 'old-money',
    title: 'OLD MONEY',
    subtitle: 'ELEGANCIA ATEMPORAL',
    href: '/catalog?category=old-money',
    imageSrc: '/img/hero/IMG_2334.webp',
    alt: 'SANT - Old Money Collection',
  },
  {
    id: 'sports',
    title: 'SPORTS',
    subtitle: 'RENDI AL MAXIMO',
    href: '/catalog?category=sports',
    imageSrc: '/img/hero/IMG_1460.webp',
    alt: 'SANT - Performance Sports',
  },
];

export default function Hero() {
  const [activeMobileSlide, setActiveMobileSlide] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      setActiveMobileSlide((current) => (current + 1) % CATEGORIES.length);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section
      id="hero-cover-zone"
      className="relative w-full bg-[#17191c] text-[#f6f8f9] overflow-hidden select-none"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-14 md:h-28 lg:h-36 bg-gradient-to-b from-[#17191c] via-[#17191c]/55 to-transparent" />

      <div className="hidden md:flex flex-row w-full h-[calc(100vh-72px)] min-h-[600px] max-h-[900px] bg-[#17191c]">
        {CATEGORIES.map((cat, index) => (
          <Link
            key={cat.id}
            href={cat.href}
            aria-label={`Explorar ${cat.title}`}
            className="group relative h-full flex-1 hover:flex-[2.2] transition-[flex] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] block overflow-hidden border-r border-white/20 last:border-r-0"
          >
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent group-hover:from-black/75 transition-colors duration-500" />
            </div>

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

      <div className="md:hidden relative h-[calc(100svh-64px)] min-h-[520px] w-full overflow-hidden bg-[#17191c]">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${activeMobileSlide * 100}%)` }}
        >
          {CATEGORIES.map((cat, index) => (
            <Link
              key={cat.id}
              href={cat.href}
              aria-label={`Explorar ${cat.title}`}
              className="group relative block h-full w-full shrink-0 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
            >
              <Image
                src={cat.imageSrc}
                alt={cat.alt}
                fill
                priority={index === 0}
                quality={82}
                sizes="100vw"
                className="scale-100 object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-active:scale-105"
              />
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/30 to-black/20" />
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 via-transparent to-black/15" />

              <div className="absolute inset-0 z-20 flex items-end justify-between gap-5 p-5 pb-10">
                <div>
                  <span className="mb-3 block font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-white/60">
                    0{index + 1} / 04
                  </span>
                  <h2 className="mb-2 font-[family-name:var(--font-bebas)] text-6xl uppercase leading-[0.9] tracking-[0.055em] text-white">
                    {cat.title}
                  </h2>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center border border-white/70 bg-black/25 text-white transition-colors duration-300 group-active:bg-white group-active:text-[#17191c]">
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="absolute bottom-4 left-5 right-5 z-30 grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat, index) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveMobileSlide(index)}
              aria-label={`Ver ${cat.title}`}
              aria-current={index === activeMobileSlide ? 'true' : undefined}
              className={`h-[2px] transition-colors duration-300 ${index === activeMobileSlide ? 'bg-white' : 'bg-white/25'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
