'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function StudioRackHero() {
  return (
    <section className="w-full bg-[#17191c] text-[#f6f8f9] relative overflow-hidden border-b border-[#b6b2a7]/30">
      <div
        className="relative w-full h-[600px] sm:h-[700px] lg:h-[750px] overflow-hidden group flex flex-col justify-between"
        style={{ borderRadius: '0px' }}
      >
        {/* Background Studio Photoshoot Image (IMG_4390.jpg - Full Width Edge to Edge) */}
        <Image
          src="/img/hero/IMG_4390.webp"
          alt="SANT CLOTHES — Studio Experience & Design Atelier"
          fill
          quality={80}
          // Banner a sangre completa.
          sizes="100vw"
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Vignette Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15 pointer-events-none" />

        {/* Top Tag Badge */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.25em] text-white bg-black/85 backdrop-blur-md px-4 py-2 uppercase border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>SANT CLOTHES · COLECCIÓN STUDIO DROP</span>
          </span>
        </div>

        {/* Bottom Content Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 p-6 sm:p-12 lg:p-16 space-y-4 max-w-4xl text-white"
        >
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-[family-name:var(--font-bebas)] tracking-wider uppercase leading-none text-white drop-shadow-lg">
            SANT CLOTHES — FUNDADA POR MATÍAS & LUCAS SANTOS
          </h2>

          <p className="text-xs sm:text-sm font-mono tracking-wide uppercase text-zinc-300 leading-relaxed max-w-xl">
            FUNDADA POR LOS HERMANOS MATÍAS Y LUCAS SANTOS, SANT NACE DEL TALLER DE ALTA COSTURA FAMILIAR. HOY, CON FÁBRICA PROPIA EN PARAGUAY, CADA PRENDA ES CONCEBIDA, CORTADA Y CONFECCIONADA BAJO NUESTRO CONTROL TOTAL.
          </p>

          <div className="pt-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 text-[11px] font-mono font-extrabold tracking-[0.2em] uppercase px-8 py-4 border border-white transition-all duration-300 shadow-2xl group/btn"
              style={{ borderRadius: '0px' }}
            >
              <span>EXPLORAR COLECCIÓN STUDIO</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
