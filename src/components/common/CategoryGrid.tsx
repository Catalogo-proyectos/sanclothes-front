'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface CategoryItem {
  id: string;
  tag: string;
  tagBg: string;
  title: string;
  subtitle: string;
  material: string;
  image: string;
  href: string;
}

const categories: CategoryItem[] = [
  {
    id: 'streetwear',
    tag: 'CÁPSULA #01',
    tagBg: 'bg-[#50524a]',
    title: 'STREETWEAR & HOODIES',
    subtitle: 'ALGODÓN PESADO 400G · EDICIÓN URBANA',
    material: 'FRISO HEAVYWEIGHT 400G',
    image: '/img/col-1.png',
    href: '/catalog?category=streetwear',
  },
  {
    id: 'old-money',
    tag: 'SILUETA ATEMPORAL',
    tagBg: 'bg-[#50524a]',
    title: 'OLD MONEY & ELEVATED',
    subtitle: 'POLOS Y SACOS · SILUETAS ATEMPORALES',
    material: 'ALGODÓN PEINADO 240G',
    image: '/img/col-2.png',
    href: '/catalog?category=old-money',
  },
  {
    id: 'performance',
    tag: 'HIGH PERFORMANCE',
    tagBg: 'bg-[#50524a]',
    title: 'SPORT PERFORMANCE',
    subtitle: 'TEXTILES TÉCNICOS · MOVIMIENTO',
    material: 'MICROFIBRA ELASTIZADA',
    image: '/img/col-3.png',
    href: '/catalog?category=performance',
  },
  {
    id: 'casual',
    tag: 'DAILY WEAR',
    tagBg: 'bg-[#50524a]',
    title: 'DAILY ESSENTIALS',
    subtitle: 'CAMISAS Y BÁSICOS · ESTILO CASUAL',
    material: 'LINO & ALGODÓN ORGÁNICO',
    image: '/img/col-4.png',
    href: '/catalog?category=casual',
  },
];

export default function CategoryGrid() {
  return (
    <section id="category-grid-section" className="py-24 bg-[#f6f8f9] text-[#17191c] border-b border-[#b6b2a7]/40">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12">
        {/* Section Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#b6b2a7]/40 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 bg-[#50524a]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a]">
                CATEGORÍAS DE CATÁLOGO — SS26
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wider text-[#17191c] uppercase leading-none">
              SELECCIÓN DE PRENDAS SANT CLOTHES
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#17191c] hover:text-[#50524a] transition-colors inline-flex items-center gap-2 border-b border-[#17191c] pb-1"
          >
            <span>VER CATÁLOGO COMPLETO</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={cat.href}
                className="group relative block bg-[#50524a]/20 overflow-hidden border border-[#50524a] hover:border-[#b6b2a7] transition-all duration-300 shadow-none"
                style={{ borderRadius: '0px' }}
              >
                {/* Image Container 3:4 aspect */}
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17191c] via-[#17191c]/40 to-transparent pointer-events-none" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#f6f8f9] bg-[#50524a] px-2.5 py-1">
                      {cat.tag}
                    </span>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-[#f6f8f9] flex flex-col justify-end">
                    <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#b6b2a7] uppercase mb-1">
                      0{index + 1} — {cat.material}
                    </span>
                    <h3 className="text-2xl font-[family-name:var(--font-bebas)] tracking-wider uppercase mb-1 text-[#f6f8f9] leading-none">
                      {cat.title}
                    </h3>
                    <p className="text-[10px] text-[#b6b2a7] uppercase tracking-wider font-mono font-medium mb-4">
                      {cat.subtitle}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f6f8f9] group-hover:text-[#b6b2a7] group-hover:translate-x-1 transition-all duration-300">
                      <span>VER COLECCIÓN</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
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
