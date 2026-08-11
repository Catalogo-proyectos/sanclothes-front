'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Flame,
  Sparkles,
  Play,
  ArrowUpRight,
  MapPin,
  Scissors,
  ShieldCheck,
  Award,
  HeartHandshake,
  Compass,
  Tv,
} from 'lucide-react';

export default function NosotrosPage() {
  const timelineEvents = [
    {
      year: '2020',
      timestamp: '02:56',
      title: 'EL ORIGEN EN PLENA PANDEMIA',
      subtitle: 'Taller familiar de alta costura',
      description:
        'SANT CLOTHES nació en los meses más inciertos de la pandemia de COVID-19. Aprovechando el taller de confección de su madre en Ciudad del Este, los hermanos Matías y Lucas Santos comenzaron fabricando artículos personalizados (tapabocas, vasos grabados y regalos) para sostener el hogar y dar el primer paso emprendedor.',
      tag: 'FASE 01 · CHISPA INICIAL',
    },
    {
      year: '2021',
      timestamp: '11:09',
      title: 'LA REVOLUCIÓN DEL OVERSIZE',
      subtitle: 'Apostar por un nicho sin explorar',
      description:
        'Decidieron dar un giro rotundo hacia la ropa urbana de alto gramaje. En ese momento, el estilo oversize y la silueta boxy fit casi no existían en Paraguay. Pese a la resistencia inicial y dudas del entorno, mantuvieron la determinación de profesionalizar el streetwear nacional.',
      tag: 'FASE 02 · IDENTIDAD URBANA',
    },
    {
      year: '2023',
      timestamp: 'INFRAESTRUCTURA',
      title: 'FÁBRICA PROPIA EN CIUDAD DEL ESTE',
      subtitle: 'Control total de calidad y confección',
      description:
        'Para garantizar la máxima durabilidad (friso 400g y algodón peinado 240g), instalaron su propia planta de confección y estampado. Desde la moldería hasta el último bordado, cada prenda se produce bajo estándares rigurosos sin depender de terceros.',
      tag: 'FASE 03 · PRODUCCIÓN PROPIA',
    },
    {
      year: '2024 - PRESENTE',
      timestamp: 'EXPANSIÓN',
      title: 'CULTURA, VALORES & SUCURSALES',
      subtitle: 'Casa Matriz & Boquerón',
      description:
        'Hoy la marca cuenta con dos tiendas en Ciudad del Este (Casa Matriz en Barrio Obrero y Sucursal Boquerón) y envíos a todo el país. SANT CLOTHES no es solo ropa; es un recordatorio tangible para quienes empiezan desde cero de que los sueños se construyen con trabajo diario.',
      tag: 'FASE 04 · IMPERIO STREETWEAR',
    },
  ];

  const brandPillars = [
    {
      icon: Scissors,
      title: 'HERENCIA DE ALTA COSTURA',
      description:
        'Aprendimos la precisión del patronaje y las costuras reforzadas en el taller de nuestra madre. Llevamos el rigor de la sastrería a la silueta callejera.',
    },
    {
      icon: ShieldCheck,
      title: 'ALGODÓN HEAVYWEIGHT 400G',
      description:
        'No escatimamos en materia prima. Nuestras telas mantienen su estructura, caída pesada y suavidad lavado tras lavado.',
    },
    {
      icon: HeartHandshake,
      title: 'PROPÓSITO & VALORES',
      description:
        'Cada drop incluye frases motivacionales y reflexiones en etiquetas y estampados. Diseñamos para inspirar a quienes superan obstáculos.',
    },
    {
      icon: Award,
      title: '100% PARAGUAYO',
      description:
        'Orgullosos de demostrar que en Paraguay se produce streetwear con estándar internacional, moldería propia y terminaciones de lujo.',
    },
  ];

  return (
    <div className="bg-[#f6f8f9] text-[#17191c] min-h-screen">
      {/* ── HERO SECTION: DRAMATIC OVERSIZED IMPACT ── */}
      <section className="relative w-full min-h-[75vh] lg:min-h-[85vh] bg-[#17191c] text-[#f6f8f9] flex flex-col justify-end overflow-hidden border-b border-[#b6b2a7]/30 pt-24 pb-16 px-6 sm:px-12 lg:px-20">
        {/* Hero Background Image */}
        <Image
          src="/img/hero/IMG_4390.webp"
          alt="SANT CLOTHES — Historia de Marca"
          fill
          priority
          quality={90}
          className="object-cover object-center opacity-40 scale-100 transition-transform duration-1000"
        />

        {/* Gradient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#17191c] via-[#17191c]/70 to-transparent pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto w-full space-y-6">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] uppercase text-zinc-300 bg-black/60 backdrop-blur-md px-4 py-2 border border-white/20"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>SANT CLOTHES · LA HISTORIA DETRÁS DE LA MARCA</span>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-[family-name:var(--font-bebas)] tracking-wider text-white uppercase leading-[0.9] max-w-5xl"
          >
            DEL TALLER DE MAMÁ A PIONEROS DEL STREETWEAR EN PARAGUAY
          </motion.h1>

          {/* Subtitle / Lead Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base font-mono text-zinc-300 uppercase tracking-wide leading-relaxed max-w-3xl"
          >
            Fundada por los hermanos <strong className="text-white font-bold">Matías y Lucas Santos</strong> durante la pandemia de 2020. Transformamos una crisis en la marca urbana de mayor proyección del país, construyendo fábrica propia y defendiendo el valor de soñar en grande.
          </motion.p>

          {/* Quick Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/15 max-w-4xl"
          >
            <div>
              <span className="block font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl text-white tracking-wider">2020</span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">AÑO DE FUNDACIÓN</span>
            </div>
            <div>
              <span className="block font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl text-white tracking-wider">400G</span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">GRAMAJE HEAVYWEIGHT</span>
            </div>
            <div>
              <span className="block font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl text-white tracking-wider">100%</span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">CONFECCIÓN PROPIA</span>
            </div>
            <div>
              <span className="block font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl text-white tracking-wider">2</span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">SUCURSALES EN CDE</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PODCAST & VIDEO BANNER HIGHLIGHT ── */}
      <section className="py-16 sm:py-20 bg-[#17191c] text-white border-b border-[#b6b2a7]/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Col: Podcast Context */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-amber-400 bg-amber-400/10 px-3 py-1 border border-amber-400/20">
                <Tv className="w-3.5 h-3.5" />
                <span>EPISODIO #01 · SANT CLOTHES PODCAST</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-none text-white">
                "NO BUSCÁBAMOS SEGUIR TENDENCIAS, CREAMOS LO QUE NOSOTROS QUERÍAMOS USAR"
              </h2>

              <p className="text-xs sm:text-sm font-mono text-zinc-300 uppercase leading-relaxed tracking-wide">
                En el primer episodio oficial de nuestro podcast, Matías y Lucas Santos revelan los detalles inéditos sobre cómo iniciaron sin capital, las noches de desvelo en el taller y cómo convirtieron las dudas del principio en la motivación para construir su propia fábrica.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="https://www.youtube.com/watch?v=1MwP_h2_38M&t=1346s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold tracking-[0.2em] uppercase px-6 py-3.5 transition-all shadow-lg"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>VER PODCAST EN YOUTUBE</span>
                </a>

                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
                  DURACIÓN: ~45 MIN · MINUTO CLAVE 02:56
                </span>
              </div>
            </div>

            {/* Right Col: Video Preview Frame */}
            <div className="lg:col-span-6">
              <div className="relative aspect-video w-full bg-zinc-900 border border-white/20 overflow-hidden group shadow-2xl">
                <Image
                  src="/img/secciones/IMG_4279.webp"
                  alt="Matías y Lucas Santos - Podcast Sant Clothes"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center p-6 text-center">
                  <a
                    href="https://www.youtube.com/watch?v=1MwP_h2_38M&t=1346s"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer mb-3"
                    aria-label="Reproducir Video Podcast"
                  >
                    <Play className="w-7 h-7 fill-white translate-x-0.5" />
                  </a>
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-[0.2em] bg-black/80 px-4 py-1.5 border border-white/20">
                    REPRODUCIR EPISODIO EN YOUTUBE
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TIMELINE SECTION: LA EVOLUCIÓN DETALLADA ── */}
      <section className="py-20 sm:py-28 bg-[#f6f8f9] text-[#17191c] border-b border-[#b6b2a7]/40">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#50524a]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a]">
                CRONOLOGÍA & HITOS CLAVE
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-[#17191c] leading-none">
              EL CAMINO DE MATÍAS & LUCAS SANTOS
            </h2>
            <p className="text-xs sm:text-sm font-mono text-[#50524a] uppercase tracking-wide leading-relaxed">
              De los primeros tapabocas en el taller de alta costura a dominar el segmento de ropa urbana heavyweight en Paraguay.
            </p>
          </div>

          {/* Timeline Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            {timelineEvents.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white border border-[#b6b2a7] p-8 space-y-4 hover:border-[#17191c] transition-all duration-300 shadow-sm relative group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#b6b2a7]/30 pb-3">
                    <span className="font-[family-name:var(--font-bebas)] text-3xl sm:text-4xl text-[#17191c] tracking-widest">
                      {item.year}
                    </span>
                    <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-[#17191c] bg-zinc-100 px-3 py-1 border border-[#b6b2a7]/50">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-[family-name:var(--font-bebas)] uppercase tracking-wide text-[#17191c] leading-tight">
                    {item.title}
                  </h3>

                  <h4 className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest">
                    {item.subtitle}
                  </h4>

                  <p className="text-xs font-mono text-[#50524a] uppercase leading-relaxed tracking-wide pt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase border-t border-zinc-100">
                  <span>REFERENCIA PODCAST</span>
                  <span className="font-bold text-[#17191c]">{item.timestamp}</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── BRAND PILLARS / NUESTROS VALORES ── */}
      <section className="py-20 sm:py-24 bg-[#17191c] text-white border-b border-[#b6b2a7]/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-zinc-400 block">
              LOS PILARES DE SANT CLOTHES
            </span>
            <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-white leading-none">
              LO QUE NOS HACE DIFERENTES
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brandPillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-black/60 border border-white/15 p-6 sm:p-8 space-y-4 hover:border-white/40 transition-colors"
                >
                  <div className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-[family-name:var(--font-bebas)] text-xl sm:text-2xl tracking-wider text-white uppercase leading-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 uppercase leading-relaxed tracking-wide">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── FOUNDERS STATEMENT / MANIFIESTO FINAL ── */}
      <section className="py-20 sm:py-28 bg-[#f6f8f9] text-[#17191c] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 text-center space-y-8 relative z-10">
          
          <div className="w-16 h-16 bg-[#17191c] text-white mx-auto flex items-center justify-center rounded-none shadow-xl">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-[0.95] text-[#17191c]">
            "CREAMOS PARA QUIENES TIENEN EL VALOR DE EMPEZAR DESDE CERO"
          </h2>

          <p className="text-xs sm:text-sm font-mono text-[#50524a] uppercase tracking-wide leading-relaxed max-w-3xl mx-auto">
            Detrás de cada corte boxy fit, de cada gramaje 400g y de cada bordado, está la convicción de dos hermanos paraguayos que convirtieron la adversidad en creatividad. Gracias por formar parte de la familia SANT CLOTHES®.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-3 bg-[#17191c] hover:bg-[#50524a] text-white text-xs font-mono font-bold tracking-[0.2em] uppercase px-10 py-4 border border-[#17191c] transition-all shadow-xl w-full sm:w-auto"
            >
              <span>EXPLORAR EL CATÁLOGO</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href="/#showroom"
              className="inline-flex items-center justify-center gap-3 bg-transparent hover:bg-[#17191c] text-[#17191c] hover:text-white text-xs font-mono font-bold tracking-[0.2em] uppercase px-10 py-4 border border-[#17191c] transition-all w-full sm:w-auto"
            >
              <MapPin className="w-4 h-4" />
              <span>VISITAR SUCURSALES EN CDE</span>
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
