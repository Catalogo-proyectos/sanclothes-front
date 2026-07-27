'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface PortalColumn {
  id: string;
  num: string;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  imageSrc: string;
  alt: string;
}

const PORTAL_COLUMNS: PortalColumn[] = [
  {
    id: 'casual',
    num: '01',
    tag: 'DAILY ESSENTIALS',
    title: 'MODA CASUAL',
    subtitle: 'CAMISAS Y BÁSICOS · ESTILO RELAJADO',
    ctaText: 'EXPLORAR CASUAL',
    ctaHref: '/catalog?category=casual',
    imageSrc: '/img/col-4.png',
    alt: 'SANTS — Moda Casual',
  },
  {
    id: 'streetwear',
    num: '02',
    tag: 'CORE STREET DROP',
    title: 'STREETWEAR',
    subtitle: 'HOODIES & REMERAS · HEAVYWEIGHT 400G',
    ctaText: 'EXPLORAR STREETWEAR',
    ctaHref: '/catalog?category=streetwear',
    imageSrc: '/img/hero-1.jpg',
    alt: 'SANTS — Streetwear',
  },
  {
    id: 'old-money',
    num: '03',
    tag: 'SILENT LUXURY',
    title: 'OLD MONEY',
    subtitle: 'POLOS & CANALÉ · CORTE CLÁSICO',
    ctaText: 'EXPLORAR OLD MONEY',
    ctaHref: '/catalog?category=old-money',
    imageSrc: '/img/col-2.png',
    alt: 'SANTS — Old Money',
  },
  {
    id: 'performance',
    num: '04',
    tag: 'ACTIVE PERFORMANCE',
    title: 'MODA DEPORTIVA',
    subtitle: 'PRENDAS TÉCNICAS · ALTO RENDIMIENTO',
    ctaText: 'EXPLORAR SPORTS',
    ctaHref: '/catalog?category=performance',
    imageSrc: '/img/col-3.png',
    alt: 'SANTS — Moda Deportiva',
  },
];

export default function Hero() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative w-full bg-[#17191c] text-[#f6f8f9] selection:bg-[#f6f8f9] selection:text-[#17191c] overflow-hidden">
      {/* ── DESKTOP LAYOUT (4 Vertical Split Portal Columns with Smooth Accordion Expansion) ── */}
      <div className="hidden md:flex flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-[#17191c]">
        {PORTAL_COLUMNS.map((col, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <Link
              key={col.id}
              href={col.ctaHref}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative h-full flex-1 hover:flex-[2.2] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] border-r border-[#50524a] last:border-r-0 group overflow-hidden select-none`}
              style={{ borderRadius: '0px' }}
            >
              {/* Photography Background */}
              <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                <Image
                  src={col.imageSrc}
                  alt={col.alt}
                  fill
                  priority={index === 0}
                  quality={95}
                  className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out grayscale group-hover:grayscale-0"
                />

                {/* Dark Contrast Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#17191c]/90 via-[#17191c]/40 to-[#17191c]/20 z-10 group-hover:from-[#17191c]/80 transition-colors duration-500" />
                <div className="absolute inset-0 bg-[#17191c]/25 group-hover:bg-transparent transition-colors duration-500 z-10" />
              </div>



              {/* Bottom Content Area */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col justify-end">
                {/* Style Title */}
                <h2 className="text-4xl lg:text-6xl font-[family-name:var(--font-bebas)] tracking-wider uppercase text-[#f6f8f9] leading-none mb-2 drop-shadow-md group-hover:translate-y-0 transition-transform duration-300">
                  {col.title}
                </h2>



                {/* Call to Action Button */}
                <div className="overflow-hidden">
                  <div
                    className="inline-flex items-center gap-3 bg-[#f6f8f9] text-[#17191c] hover:bg-[#b6b2a7] text-[11px] font-extrabold tracking-[0.2em] uppercase px-6 py-3.5 border border-[#f6f8f9] transition-all duration-300 shadow-none group-hover:translate-y-0"
                    style={{ borderRadius: '0px' }}
                  >
                    <span>{col.ctaText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── MOBILE LAYOUT (Stacked 4 Full-Width Hero Franjas) ── */}
      <div className="flex md:hidden flex-col w-full min-h-[calc(100vh-64px)] bg-[#17191c]">
        {PORTAL_COLUMNS.map((col, index) => (
          <Link
            key={col.id}
            href={col.ctaHref}
            className="relative w-full h-[22vh] min-h-[160px] border-b border-[#50524a] last:border-b-0 overflow-hidden group block"
            style={{ borderRadius: '0px' }}
          >
            {/* Background Photo */}
            <Image
              src={col.imageSrc}
              alt={col.alt}
              fill
              quality={90}
              className="object-cover object-center group-active:scale-105 transition-transform duration-500"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10" />

            {/* Row Content */}
            <div className="absolute inset-0 p-6 z-20 flex items-center justify-between">
              <div>

                <h2 className="text-3xl font-[family-name:var(--font-bebas)] tracking-wider uppercase text-white leading-none mb-1">
                  {col.title}
                </h2>

              </div>

              {/* Action Circle */}
              <div
                className="w-10 h-10 bg-white text-black flex items-center justify-center shrink-0 ml-4 border border-white"
                style={{ borderRadius: '0px' }}
              >
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}


