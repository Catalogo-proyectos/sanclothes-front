'use client';

import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';

export default function BrandManifestoBar() {
  return (
    <section className="w-full bg-[#0d0e10] text-white py-16 sm:py-24 px-6 sm:px-12 border-y border-[#b6b2a7]/30 relative overflow-hidden select-none">
      <div className="max-w-[1440px] mx-auto text-center space-y-6 relative z-10">
        
        {/* Top Tag Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] uppercase text-zinc-400 bg-black/80 backdrop-blur-md px-4 py-2 border border-white/15"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>SANT CLOTHES · MANIFIESTO</span>
        </motion.div>

        {/* Giant Quote Quote Icon Accent */}
        <div className="flex justify-center pt-2">
          <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-white/30 rotate-180" />
        </div>

        {/* Main Manifesto Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-5xl lg:text-7xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-white leading-[1.05] max-w-5xl mx-auto drop-shadow-xl"
        >
          “NO SEGUIMOS TENDENCIAS. REDEFINIMOS LA CULTURA URBANA EN PARAGUAY A TRAVÉS DEL DISEÑO ARQUITECTÓNICO Y MATERIALES DE ALTO GRAMAJE.”
        </motion.h2>

        {/* Sub-manifesto Mono Copy */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs sm:text-sm font-mono tracking-[0.2em] text-zinc-400 uppercase max-w-2xl mx-auto leading-relaxed pt-2"
        >
          CADA PRENDA REFLEJA LA IDENTIDAD DE NUESTRA MARCA · ESTÉTICA HEAVYWEIGHT 400G · CONFECCIÓN DE PRECISIÓN EN CIUDAD DEL ESTE
        </motion.p>
      </div>

      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/[0.02] blur-[120px] pointer-events-none rounded-full" />
    </section>
  );
}
