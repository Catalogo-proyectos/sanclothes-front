'use client';

import Image from 'next/image';
import { Camera, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SocialStudioGrid() {
  const images = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
      alt: 'SANCLOTHES Studio — Detalle Remera',
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
      alt: 'SANCLOTHES Studio — Sudadera Heavyweight',
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
      alt: 'SANCLOTHES Studio — Pantalón Gabardina',
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80',
      alt: 'SANCLOTHES Studio — Estilo Neutro',
    },
  ];

  return (
    <section className="py-20 bg-[#f6f8f9] border-b border-[#b6b2a7]/40">
      <div className="w-full px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-zinc-100 pb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 block mb-1">
              COMUNIDAD & COMUNIDAD CREATIVA
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase font-sans">
              @SANCLOTHES.STUDIO
            </h2>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold tracking-[0.2em] uppercase text-black border-b border-black pb-0.5 inline-flex items-center gap-1.5 hover:opacity-60 transition-opacity"
          >
            <Camera className="w-4 h-4" />
            <span>SÍGUENOS EN INSTAGRAM</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 4 Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative aspect-square overflow-hidden bg-zinc-100 border border-white/10 group"
              style={{ borderRadius: '0px' }}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <span
                  className="text-[10px] font-black tracking-[0.25em] uppercase text-white bg-black px-4 py-2 border border-white"
                  style={{ borderRadius: '0px' }}
                >
                  VER EN STUDIO
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
