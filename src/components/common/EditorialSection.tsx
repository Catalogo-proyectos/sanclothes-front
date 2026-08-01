'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Compass } from 'lucide-react';

export default function EditorialSection() {
  return (
    <section className="py-20 sm:py-24 bg-[#f6f8f9] text-[#17191c] overflow-hidden border-b border-[#b6b2a7]/40">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12">
        {/* 50/50 Dual Editorial Split Grid (Clean Unboxed Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* ── LEFT COLUMN (50%): PRENDAS PENSADAS PARA DURAR ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col space-y-6"
          >
            {/* Editorial Garments Rack Image */}
            <div
              className="relative aspect-[16/9] w-full bg-zinc-100 overflow-hidden border border-[#b6b2a7] group mb-2"
              style={{ borderRadius: '0px' }}
            >
              <Image
                src="/img/secciones/rack-outfits-4.webp"
                alt="SANTS CLOTHES — Colección de Siluetas Atemporales"
                fill
                quality={95}
                className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-3 left-3 z-10">
                <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-black bg-white px-2.5 py-1 uppercase border border-white">
                  SANTS ATELIER · 400G & SILUETAS ATEMPORALES
                </span>
              </div>
            </div>

            {/* Eyebrow Tag */}
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-[#17191c] rounded-full" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a]">
                MANIFIESTO SANTS CLOTHES
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-bebas)] tracking-wider text-[#17191c] leading-[0.95] uppercase">
              PRENDAS PENSADAS PARA DURAR, NO PARA PASAR DE MODA
            </h2>

            {/* Body Paragraphs */}
            <p className="text-xs sm:text-sm text-[#17191c] font-mono font-medium tracking-wide uppercase leading-relaxed">
              EN SANTS CLOTHES CREEMOS EN LA FUERZA DE LO SIMPLE. ELIMINAMOS ADORNOS INNECESARIOS PARA ENFOCAR TODA LA ATENCIÓN EN SILUETAS, VOLUMEN Y TEXTURA DE MATERIAS PRIMAS HEAVYWEIGHT.
            </p>

            <p className="text-xs text-[#50524a] font-mono tracking-wide uppercase leading-relaxed">
              NUESTROS DISEÑOS HABITAN EN EL EQUILIBRIO ENTRE LA COMODIDAD COTIDIANA Y LA SOFISTICACIÓN CONTEMPORÁNEA. ROPA VERSÁTIL CON IDENTIDAD PROPIA FABRICADA EN PARAGUAY.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#f6f8f9] border border-[#b6b2a7] text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-[#17191c] block">400G</span>
                <span className="text-[9px] font-mono uppercase text-[#50524a]">FRISO HEAVY</span>
              </div>
              <div className="p-3 bg-[#f6f8f9] border border-[#b6b2a7] text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-[#17191c] block">BOXY FIT</span>
                <span className="text-[9px] font-mono uppercase text-[#50524a]">CORTE ATELIER</span>
              </div>
              <div className="p-3 bg-[#f6f8f9] border border-[#b6b2a7] text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-[#17191c] block">PARAGUAY</span>
                <span className="text-[9px] font-mono uppercase text-[#50524a]">ORIGEN PROPIO</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-[#17191c] hover:bg-[#50524a] text-white text-[11px] font-mono font-bold tracking-[0.2em] uppercase px-8 py-4 border border-[#17191c] transition-all shadow-lg"
                style={{ borderRadius: '0px' }}
              >
                <span>EXPLORAR CATÁLOGO ATELIER</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN (50%): SANTS CLOTHES — EL ARTE DEL STREETWEAR ELEVADO ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col space-y-6"
          >
            {/* Atelier Photo */}
            <div
              className="relative aspect-[16/9] w-full bg-zinc-900 overflow-hidden border border-[#b6b2a7] group mb-2"
              style={{ borderRadius: '0px' }}
            >
              <Image
                src="/img/secciones/IMG_4279.webp"
                alt="SANTS CLOTHES — Atelier de Diseño y Confección"
                fill
                quality={95}
                className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-3 left-3 z-10">
                <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-black bg-white px-2.5 py-1 uppercase border border-white">
                  ATELIER SANTS · PROCESO & CREACIÓN
                </span>
              </div>
            </div>

            {/* Eyebrow Tag */}
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#50524a]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a]">
                NUESTRA HISTORIA & ATELIER
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-bebas)] tracking-wider text-[#17191c] leading-[0.95] uppercase">
              SANTS CLOTHES — EL ARTE DEL STREETWEAR ELEVADO
            </h2>

            {/* Body Paragraphs */}
            <p className="text-xs sm:text-sm text-[#17191c] font-mono font-medium tracking-wide uppercase leading-relaxed">
              NACIDO EN ASUNCIÓN, SANTS CLOTHES REDEFINE LA INTERSECCIÓN ENTRE LA CULTURA URBANA, LA SASTRERÍA MODERNA Y EL DISEÑO ARQUITECTÓNICO.
            </p>

            <p className="text-xs text-[#50524a] font-mono tracking-wide uppercase leading-relaxed">
              DESDE HOODIES HEAVYWEIGHT DE 400G HASTA SILUETAS ATELIER, CREAMOS PIEZAS CON IDENTIDAD PROPIA FABRICADAS CON ORGULLO EN PARAGUAY.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#f6f8f9] border border-[#b6b2a7]">
                <span className="text-[10px] font-mono font-bold text-[#17191c] uppercase block">
                  ATELIER PROPIO
                </span>
                <span className="text-[9px] font-mono text-[#50524a] uppercase">
                  DISEÑO & CONFECCIÓN
                </span>
              </div>
              <div className="p-3 bg-[#f6f8f9] border border-[#b6b2a7]">
                <span className="text-[10px] font-mono font-bold text-[#17191c] uppercase block">
                  GRAMAJE PREMIUM
                </span>
                <span className="text-[9px] font-mono text-[#50524a] uppercase">
                  COTTON 400G OVERSIZED
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/journal"
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-[#17191c] hover:bg-[#50524a] text-white text-[11px] font-mono font-bold tracking-[0.2em] uppercase px-8 py-4 border border-[#17191c] transition-all shadow-lg"
                style={{ borderRadius: '0px' }}
              >
                <span>CONOCÉ SOBRE NOSOTROS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
