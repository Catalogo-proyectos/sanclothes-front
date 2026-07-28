'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface LookbookItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  categoryLink: string;
  items: string[];
}

const looks: LookbookItem[] = [
  {
    id: 'look-01',
    tag: 'LOOK 01 / STREET ARCHITECTS',
    title: 'SILUETAS ESTRUCTURADAS',
    description: 'Combinación de hoodie heavyweight en algodón 400g con pantalón cargo de ajuste holgado.',
    image: '/img/col-1.png',
    categoryLink: '/catalog?category=streetwear',
    items: ['HOODIE OVERSIZED BLACK', 'CARGO GABARDINA HEAVY'],
  },
  {
    id: 'look-02',
    tag: 'LOOK 02 / OLD MONEY STYLING',
    title: 'ELEVATED ESSENTIALS',
    description: 'Polo de tejido canalé con pantalón de vestir pinzado en tonos neutros atemporales.',
    image: '/img/col-2.png',
    categoryLink: '/catalog?category=old-money',
    items: ['KNIT POLO BEIGE', 'TAILORED TROUSERS BEIGE'],
  },
  {
    id: 'look-03',
    tag: 'LOOK 03 / SPORT PERFORMANCE',
    title: 'TECNOLOGÍA EN MOVIMIENTO',
    description: 'Prendas deportivas de secado rápido con ajuste anatómico para alto rendimiento.',
    image: '/img/col-3.png',
    categoryLink: '/catalog?category=performance',
    items: ['PERFORMANCE JACKET BLACK', 'RUNNING TIGHTS BLACK'],
  },
];

export default function LookbookGallery() {
  const [activeLook, setActiveLook] = useState<string>('look-01');

  const currentLook = looks.find((l) => l.id === activeLook) || looks[0];

  return (
    <section className="py-24 bg-[#f6f8f9] text-[#17191c] border-b border-[#b6b2a7]/40">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#50524a] pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-4 h-4 text-[#b6b2a7]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#b6b2a7]">
                LOOKBOOK EDITORIAL — SS26
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wider text-[#f6f8f9] uppercase leading-none">
              GALERÍA EDITORIAL & STYLING ATELIER
            </h2>
          </div>

          {/* Look Selector Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {looks.map((look) => (
              <button
                key={look.id}
                onClick={() => setActiveLook(look.id)}
                className={`px-5 py-2.5 text-[11px] font-mono font-bold tracking-[0.2em] uppercase transition-all border ${
                  activeLook === look.id
                    ? 'bg-[#50524a] text-[#f6f8f9] border-[#50524a]'
                    : 'bg-[#17191c] text-[#b6b2a7] border-[#50524a] hover:text-[#f6f8f9] hover:border-[#b6b2a7]'
                }`}
                style={{ borderRadius: '0px' }}
              >
                {look.id.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Display Image */}
          <div className="lg:col-span-8 relative min-h-[520px] md:min-h-[620px] bg-[#17191c] border border-[#50524a] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLook.id}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full h-full min-h-[520px] md:min-h-[620px]"
              >
                <Image
                  src={currentLook.image}
                  alt={currentLook.title}
                  fill
                  priority
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17191c] via-[#17191c]/30 to-transparent pointer-events-none" />

                {/* Overlay Text */}
                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-[#f6f8f9]">
                  <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-[#b6b2a7] uppercase block mb-2">
                    {currentLook.tag}
                  </span>
                  <h3 className="text-3xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wider uppercase mb-3 text-[#f6f8f9] leading-none">
                    {currentLook.title}
                  </h3>
                  <p className="text-xs text-[#b6b2a7] font-medium tracking-wide max-w-xl mb-6 uppercase font-mono">
                    {currentLook.description}
                  </p>
                  <Link
                    href={currentLook.categoryLink}
                    className="inline-flex items-center gap-2 bg-[#50524a] text-[#f6f8f9] hover:bg-[#b6b2a7] hover:text-[#17191c] text-[11px] font-extrabold tracking-[0.2em] uppercase px-7 py-3.5 border border-[#50524a] transition-all shadow-none"
                    style={{ borderRadius: '0px' }}
                  >
                    <span>COMPRAR ESTE LOOK</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Look Details Sidebar */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-[#50524a]/20 border border-[#50524a] p-8">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-[#b6b2a7] block mb-3">
                DETALLE DE PRENDAS DEL LOOK
              </span>
              <h4 className="text-2xl font-[family-name:var(--font-bebas)] tracking-wider uppercase text-[#f6f8f9] mb-6 border-b border-[#50524a] pb-4">
                COMPOSICIÓN DEL ATAVÍO
              </h4>

              <ul className="space-y-4 mb-8">
                {currentLook.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider text-[#f6f8f9]">
                    <span className="w-2 h-2 bg-[#b6b2a7] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-[#50524a]">
              <p className="text-[11px] text-[#b6b2a7] uppercase tracking-widest leading-relaxed mb-6 font-medium">
                TODAS LAS PRENDAS SON DISEÑADAS CON ALGODÓN 100% HEAVYWEIGHT Y CONFECCIONADAS BAJO ESTÁNDARES EDITORIALES SANTS CLOTHES.
              </p>
              <Link
                href="/catalog"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#17191c] hover:bg-[#50524a] text-[#f6f8f9] text-[11px] font-bold tracking-[0.2em] uppercase py-4 border border-[#50524a] transition-colors"
                style={{ borderRadius: '0px' }}
              >
                <span>EXPLORAR TODO EL LOOKBOOK</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

