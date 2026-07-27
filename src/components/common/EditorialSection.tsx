'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function EditorialSection() {
  return (
    <section className="py-24 bg-[#f6f8f9] text-[#17191c] overflow-hidden border-b border-[#b6b2a7]/40">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image Composition */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 border border-white/10"
              style={{ borderRadius: '0px' }}
            >
              <Image
                src="/img/col-1.png"
                alt="Manifiesto SANTS CLOTHES — Moda Atemporal"
                fill
                className="object-cover object-center grayscale contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Accent badge */}
            <div
              className="absolute -bottom-6 -right-6 hidden sm:block bg-white border border-black p-6 max-w-xs z-10 shadow-xl"
              style={{ borderRadius: '0px' }}
            >
              <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#50524a] uppercase block mb-1">
                SANTS ATELIER PARAGUAY
              </span>
              <p className="text-[11px] text-black font-bold tracking-wider uppercase leading-snug">
                ESTÉTICA PURA / 100% ALGODÓN HEAVYWEIGHT 240G & 400G
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#ef4444]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#8a8a82]">
                MANIFIESTO SANTS CLOTHES
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] tracking-wider text-black leading-[0.95] uppercase">
              PRENDAS PENSADAS PARA DURAR, NO PARA PASAR DE MODA
            </h2>

            <p className="text-xs sm:text-sm text-black font-medium tracking-wide uppercase leading-relaxed font-mono">
              EN SANTS CLOTHES CREEMOS EN LA FUERZA DE LO SIMPLE. ELIMINAMOS ADORNOS INNECESARIOS PARA ENFOCAR TODA LA ATENCIÓN EN SILUETAS, VOLUMEN Y TEXTURA DE MATERIAS PRIMAS HEAVYWEIGHT.
            </p>

            <p className="text-xs text-zinc-600 font-medium tracking-wide uppercase leading-relaxed">
              NUESTROS DISEÑOS HABITAN EN EL EQUILIBRIO ENTRE LA COMODIDAD COTIDIANA Y LA SOFISTICACIÓN CONTEMPORÁNEA. ROPA VERSÁTIL CON IDENTIDAD PROPIA FABRICADA EN PARAGUAY.
            </p>

            {/* Pillar Badges Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white/[0.04] border border-white/10 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-black block">400G</span>
                <span className="text-[9px] font-mono uppercase text-zinc-500">FRISO HEAVY</span>
              </div>
              <div className="p-3 bg-white/[0.04] border border-white/10 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-black block">BOXY FIT</span>
                <span className="text-[9px] font-mono uppercase text-zinc-500">CORTE ATELIER</span>
              </div>
              <div className="p-3 bg-white/[0.04] border border-white/10 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-black block">0PX RAD</span>
                <span className="text-[9px] font-mono uppercase text-zinc-500">GEOMETRÍA PURA</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-3 bg-black hover:bg-zinc-800 text-white text-[11px] font-extrabold tracking-[0.2em] uppercase px-8 py-4 border border-black transition-colors"
                style={{ borderRadius: '0px' }}
              >
                <span>EXPLORAR CATÁLOGO ATELIER</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
