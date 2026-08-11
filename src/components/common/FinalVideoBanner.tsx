'use client';

import { motion } from 'framer-motion';
import { Film } from 'lucide-react';

export default function FinalVideoBanner() {
  return (
    <section className="w-full bg-[#17191c] text-[#f6f8f9] relative overflow-hidden border-b border-[#b6b2a7]/30">
      <div
        className="relative w-full h-[600px] sm:h-[700px] lg:h-[750px] overflow-hidden group flex flex-col justify-between"
        style={{ borderRadius: '0px' }}
      >
        {/* Video Player - Full Width Edge to Edge */}
        <video
          src="/img/video/video2.mp4"
          poster="/img/hero/IMG_4390.webp"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Dark Vignette Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15 pointer-events-none" />

        {/* Top Tag Badge */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.25em] text-white bg-black/85 backdrop-blur-md px-4 py-2 uppercase border border-white/20">
            <Film className="w-3.5 h-3.5 text-white" />
            <span>SANT CLOTHES · EDICIÓN FINAL</span>
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
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl lg:text-8xl font-[family-name:var(--font-bebas)] tracking-wider uppercase leading-none text-white drop-shadow-lg"
          >
            SANT CLOTHES — MOVEMENT & CULTURE
          </motion.h2>

          <p className="text-xs sm:text-sm font-mono tracking-wide uppercase text-zinc-300 leading-relaxed max-w-xl">
            CIUDAD DEL ESTE · PARAGUAY · CULTURA URBANA Y SASTRERIA EN MOVIMIENTO.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
