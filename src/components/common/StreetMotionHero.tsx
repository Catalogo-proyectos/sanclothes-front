'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';

export default function StreetMotionHero() {
  return (
    <section className="w-full bg-[#f6f8f9] text-[#17191c] py-16 sm:py-24 px-6 sm:px-12 border-b border-[#b6b2a7]/40 overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Atelier Photoshoot Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 relative"
          >
            <div
              className="relative aspect-[3/4] w-full bg-zinc-900 overflow-hidden border border-zinc-800 shadow-2xl group"
              style={{ borderRadius: '0px' }}
            >
              <Image
                src="/img/secciones/IMG_4279.webp"
                alt="SANTS CLOTHES — Atelier de Diseño y Confección"
                fill
                quality={80}
                // 7 de 12 columnas dentro de max-w-7xl (1280px) => ~745px.
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Image Badge */}
              <div className="absolute bottom-6 left-6 z-10">
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-black bg-white px-3 py-1.5 uppercase border border-white">
                  ATELIER SANTS · PROCESO & CREACIÓN
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Brand Story Editorial Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#50524a]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a]">
                NUESTRA HISTORIA & ATELIER
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-[0.95] text-[#17191c]">
              SANTS CLOTHES — EL ARTE DEL STREETWEAR ELEVADO
            </h2>

            <p className="text-xs sm:text-sm font-mono text-[#17191c] uppercase tracking-wide leading-relaxed">
              Nacido en Asunción, SANTS CLOTHES redefine la intersección entre la cultura urbana, la sastrería moderna y el diseño arquitectónico. Cada prenda es concebida en nuestro atelier con un enfoque obsesivo en el calce, los textiles de gramaje pesado y los acabados de alta durabilidad.
            </p>

            <p className="text-xs font-mono text-[#50524a] uppercase tracking-wider leading-relaxed">
              Desde hoodies heavyweight de 400g hasta siluetas atelier, creamos piezas con identidad propia fabricadas con orgullo en Paraguay para quienes viven con determinación y actitud.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-[#f6f8f9] border border-[#b6b2a7]">
                <span className="text-[10px] font-mono font-bold text-[#17191c] uppercase block">
                  ATELIER PROPIO
                </span>
                <span className="text-[9px] font-mono text-[#50524a] uppercase">
                  DISEÑO & CONFECCIÓN PARAGUAYA
                </span>
              </div>
              <div className="p-3.5 bg-[#f6f8f9] border border-[#b6b2a7]">
                <span className="text-[10px] font-mono font-bold text-[#17191c] uppercase block">
                  GRAMAJE PREMIUM
                </span>
                <span className="text-[9px] font-mono text-[#50524a] uppercase">
                  COTTON 400G & SILUETAS OVERSIZED
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/journal"
                className="inline-flex items-center gap-3 bg-[#17191c] text-[#f6f8f9] hover:bg-[#50524a] text-[11px] font-mono font-bold tracking-[0.2em] uppercase px-8 py-4 border border-[#17191c] transition-all shadow-xl"
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
