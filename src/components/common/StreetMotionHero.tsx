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
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Image Badge */}
              <div className="absolute bottom-6 left-6 z-10">
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-black bg-white px-3 py-1.5 uppercase border border-white">
                  SANT CLOTHES · PROCESO & CREACIÓN
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
                NUESTRA HISTORIA & MARCA
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-[0.95] text-[#17191c]">
              SANT CLOTHES — PIONEROS DEL STREETWEAR EN PARAGUAY
            </h2>

            <p className="text-xs sm:text-sm font-mono text-[#17191c] uppercase tracking-wide leading-relaxed">
              SANT CLOTHES NACE EN PLENA PANDEMIA DESDE EL TALLER DE ALTA COSTURA DE NUESTRA MADRE. LOS HERMANOS MATÍAS Y LUCAS SANTOS TRANSFORMARON ESA HERENCIA ARTESANAL EN UNA MARCA URBANA PIONERA DEL STREETWEAR OVERSIZE EN PARAGUAY, CON FÁBRICA PROPIA Y VISIÓN INTERNACIONAL.
            </p>

            <p className="text-xs font-mono text-[#50524a] uppercase tracking-wider leading-relaxed">
              CADA DISEÑO LLEVA UN VALOR PERSONAL: FRASES QUE INSPIRAN Y MENSAJES QUE MOTIVAN. CREAMOS PARA LOS SOÑADORES QUE EMPIEZAN DESDE CERO. HOODIES HEAVYWEIGHT DE 400G, SILUETAS OVERSIZE Y PIEZAS CON IDENTIDAD PROPIA, FABRICADAS CON ORGULLO EN PARAGUAY.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-[#f6f8f9] border border-[#b6b2a7]">
                <span className="text-[10px] font-mono font-bold text-[#17191c] uppercase block">
                  FUNDADORES
                </span>
                <span className="text-[9px] font-mono text-[#50524a] uppercase">
                  MATÍAS & LUCAS SANTOS
                </span>
              </div>
              <div className="p-3.5 bg-[#f6f8f9] border border-[#b6b2a7]">
                <span className="text-[10px] font-mono font-bold text-[#17191c] uppercase block">
                  FÁBRICA PROPIA
                </span>
                <span className="text-[9px] font-mono text-[#50524a] uppercase">
                  HECHO EN PARAGUAY · VISIÓN GLOBAL
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/nosotros"
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
