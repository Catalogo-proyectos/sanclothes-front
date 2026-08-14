'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ShieldCheck, ExternalLink } from 'lucide-react';

interface StoreLocation {
  id: string;
  city: string;
  tabLabel: string;
  badge: string;
  name: string;
  address: string;
  hours: string;
  mapsUrl: string;
}

const STORES: StoreLocation[] = [
  {
    id: 'matriz',
    city: 'CIUDAD DEL ESTE',
    tabLabel: 'CDE (CASA MATRIZ)',
    badge: 'CASA MATRIZ',
    name: 'SANT B. OBRERO MATRIZ',
    address: 'B. OBRERO, CIUDAD DEL ESTE, PARAGUAY',
    hours: 'LUNES A SÁBADOS: 09:00 A 18:00 HS',
    mapsUrl: 'https://maps.app.goo.gl/S3xY7CYL5RiJ2DAy6',
  },
  {
    id: 'boqueron',
    city: 'CIUDAD DEL ESTE',
    tabLabel: 'BOQUERÓN',
    badge: 'SUCURSAL BOQUERÓN',
    name: 'SANT BOQUERÓN',
    address: 'BOQUERÓN, CIUDAD DEL ESTE, PARAGUAY',
    hours: 'LUNES A SÁBADOS: 09:00 A 18:00 HS',
    mapsUrl: 'https://www.google.com/maps/place/Sant+Boquer%C3%B3n/@-25.5249877,-54.6229725,16.29z/data=!4m6!3m5!1s0x94f68f365d684f4b:0x904bbfb5b342490!8m2!3d-25.5249068!4d-54.6228907!16s%2Fg%2F11tx25q9l2',
  },
];

export default function ShowroomExperience() {
  const [activeStoreIdx, setActiveStoreIdx] = useState(0);
  const currentStore = STORES[activeStoreIdx];

  const handleOpenMaps = () => {
    window.open(currentStore.mapsUrl, '_blank');
  };

  return (
    <section id="showroom" className="w-full scroll-mt-24 bg-[#17191c] text-[#f6f8f9] relative overflow-hidden border-b border-[#b6b2a7]/30">
      <div className="relative w-full min-h-[640px] lg:min-h-[720px] overflow-hidden group flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        
        {/* Background Image - Showroom Atelier Design Table */}
        <Image
          src="/img/secciones/showroom-atelier.jpg"
          alt="SANT CLOTHES — Showroom & Tiendas"
          fill
          quality={90}
          sizes="100vw"
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Dark Vignette Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 pointer-events-none" />

        {/* ── TOP CONTENT ── */}
        <div className="relative z-10 max-w-5xl space-y-6 my-auto pt-6">
          
          {/* Main Headline */}
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-[family-name:var(--font-bebas)] tracking-wider uppercase leading-none text-white drop-shadow-lg max-w-4xl">
            SANT CLOTHES — SHOWROOM & TIENDAS
          </h2>

          {/* Subtitle Description */}
          <p className="text-xs sm:text-sm font-mono tracking-wide text-zinc-300 uppercase leading-relaxed max-w-3xl">
            CIUDAD DEL ESTE, PARAGUAY · ESPACIO EXCLUSIVO DE PRUEBA Y ASESORAMIENTO DIRECTO. VIVÍ LA EXPERIENCIA DE NUESTRAS COLECCIONES HEAVYWEIGHT EN PERSONA.
          </p>

          {/* Store Switcher Tabs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {STORES.map((store, idx) => {
              const isActive = idx === activeStoreIdx;
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => setActiveStoreIdx(idx)}
                  className={`text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.18em] uppercase px-5 py-3 border transition-all duration-300 cursor-pointer flex items-center gap-2 backdrop-blur-md ${
                    isActive
                      ? 'bg-white text-black border-white shadow-2xl scale-[1.02]'
                      : 'bg-black/50 text-white/90 border-white/30 hover:border-white hover:bg-black/70 hover:text-white'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                  <span>{store.tabLabel}</span>
                </button>
              );
            })}
          </div>

          {/* 3 Info Cards Row */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStore.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4"
            >
              {/* Card 1: Ubicación */}
              <div className="p-4 bg-black/35 backdrop-blur-md border border-white/20 hover:border-white/40 transition-colors space-y-1">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-4 h-4 text-zinc-300" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em]">
                    UBICACIÓN SUCURSAL
                  </span>
                </div>
                <p className="text-xs font-mono font-bold uppercase text-white tracking-wide pt-1">
                  {currentStore.name}
                </p>
                <p className="text-[10px] font-mono text-zinc-300 uppercase tracking-wide">
                  {currentStore.address}
                </p>
              </div>

              {/* Card 2: Horarios */}
              <div className="p-4 bg-black/35 backdrop-blur-md border border-white/20 hover:border-white/40 transition-colors space-y-1">
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-4 h-4 text-zinc-300" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em]">
                    HORARIOS DE ATENCIÓN
                  </span>
                </div>
                <p className="text-xs font-mono font-bold uppercase text-white tracking-wide pt-1">
                  {currentStore.hours}
                </p>
                <p className="text-[10px] font-mono text-zinc-300 uppercase tracking-wide">
                  ATENCIÓN CONTINUA DE LUNES A SÁBADOS
                </p>
              </div>

              {/* Card 3: Experiencia SANT */}
              <div className="p-4 bg-black/35 backdrop-blur-md border border-white/20 hover:border-white/40 transition-colors space-y-1">
                <div className="flex items-center gap-2 text-white">
                  <ShieldCheck className="w-4 h-4 text-zinc-300" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em]">
                    CALIDAD & ASESORÍA
                  </span>
                </div>
                <p className="text-xs font-mono font-bold uppercase text-white tracking-wide pt-1">
                  PRUEBA DE TALLES S A XL
                </p>
                <p className="text-[10px] font-mono text-zinc-300 uppercase tracking-wide">
                  CONFECCIÓN PROPIA & ASESORÍA DIRECTA
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action CTA Buttons */}
          <div className="pt-4 flex items-center">
            <button
              type="button"
              onClick={handleOpenMaps}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold tracking-[0.2em] uppercase px-8 py-4 border border-white transition-all shadow-xl cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              <ExternalLink className="w-4 h-4 text-black" />
              <span>ABRIR EN GOOGLE MAPS</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
