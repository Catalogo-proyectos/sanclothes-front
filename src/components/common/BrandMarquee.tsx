'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function BrandMarquee() {
  const phrases = [
    'MODA CONTEMPORÁNEA & STREETWEAR',
    'SILUETAS ATEMPORALES 0PX GEOMETRY',
    '100% ALGODÓN HEAVYWEIGHT 240G',
    'DISEÑO SOBRIO & EDICIONES LIMITADAS',
    'ENVÍOS A TODO EL PAÍS / SANCLOTHES',
    'AUTUMN / WINTER DROPS',
  ];

  const marqueeContent = [...phrases, ...phrases, ...phrases, ...phrases];

  return (
    <section className="w-full bg-black text-white py-3.5 overflow-hidden border-y border-white/10 select-none">
      <div className="flex whitespace-nowrap overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            ease: 'linear',
            duration: 25,
            repeat: Infinity,
          }}
        >
          {marqueeContent.map((phrase, i) => (
            <span
              key={i}
              className="text-[11px] font-bold tracking-[0.25em] uppercase text-zinc-300 px-6 flex items-center gap-6"
            >
              <Flame className="w-3.5 h-3.5 text-zinc-500 inline-block" />
              <span>{phrase}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
