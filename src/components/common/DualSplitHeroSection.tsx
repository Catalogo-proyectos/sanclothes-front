'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function DualSplitHeroSection() {
  const dualBanners = [
    {
      id: 'sant-customs-ferrari',
      tag: 'CÁPSULA SPECIAL — SANT CUSTOMS',
      title: 'SANT CUSTOMS',
      subtitle: 'EDICIÓN EXCLUSIVA MOTORSPORT & STREETWEAR EN PARAGUAY',
      ctaText: 'VER CÁPSULA CUSTOMS',
      href: '/catalog?category=streetwear',
      image: '/img/dual-hero-1.jpg',
      alt: 'SANT CUSTOMS — Red Ferrari Edition',
    },
    {
      id: 'sant-varsity-supra',
      tag: 'LIMITED DROP — VARSITY & DENIM',
      title: 'VARSITY JACKET & DENIM',
      subtitle: 'CHAQUETAS EMBROIDERED 400G & JEANS RELAJADOS',
      ctaText: 'VER CÁPSULA VARSITY',
      href: '/catalog?category=old-money',
      image: '/img/dual-hero-2.jpg',
      alt: 'SANT CLOTHES — Varsity Jacket & Denim Supra Edition',
    },
  ];

  return (
    <section className="w-full bg-[#f6f8f9] text-[#17191c] py-4 px-4 sm:px-8 border-b border-[#b6b2a7]/40">
      <div className="max-w-[1440px] mx-auto">
        {/* 50/50 Split Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dualBanners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Link
                href={banner.href}
                className="group relative block w-full h-[650px] sm:h-[720px] bg-[#f6f8f9] overflow-hidden border border-[#b6b2a7]"
                style={{ borderRadius: '0px' }}
              >
                {/* Crisp Studio Photography (Unobstructed per GEMINI.md rule) */}
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  priority={index === 0}
                  quality={95}
                  className="object-cover object-center scale-100 group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
                />

                {/* Subtle Gradient for Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                {/* Top Minimal Tag */}
                <div className="absolute top-6 left-6 z-10">
                  <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-white bg-black/80 backdrop-blur-sm px-3 py-1.5 uppercase">
                    {banner.tag}
                  </span>
                </div>

                {/* Bottom Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10 flex flex-col justify-end text-white">
                  <h3 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] tracking-wider uppercase mb-2 leading-none drop-shadow-md">
                    {banner.title}
                  </h3>
                  <p className="text-xs font-mono font-medium tracking-wide uppercase text-zinc-200 mb-6 max-w-md">
                    {banner.subtitle}
                  </p>

                  <div className="overflow-hidden">
                    <span
                      className="inline-flex items-center gap-3 bg-white text-black text-[11px] font-extrabold tracking-[0.2em] uppercase px-7 py-4 border border-white group-hover:bg-zinc-200 transition-all duration-300 shadow-xl"
                      style={{ borderRadius: '0px' }}
                    >
                      <span>{banner.ctaText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
