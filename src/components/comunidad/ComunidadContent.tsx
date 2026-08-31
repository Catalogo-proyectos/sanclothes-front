'use client';

import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  ShoppingBag,
  ArrowUpRight,
  Radio,
  Flame,
  Sparkles,
  MessageCircle,
  Users,
} from 'lucide-react';

const communityMobileSrcSet = getImageProps({
  src: '/img/hero/IMG_2022_mobile_1080x1920.webp',
  alt: 'Le Sant Club — Nova Collection',
  fill: true,
  quality: 85,
  sizes: '100vw',
  priority: true,
}).props.srcSet;

const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/KRdxCooXAlJF2mCZd2wBtx';

export default function ComunidadContent() {
  const whatsappFeatures = [
    {
      id: 'feature-1',
      code: 'FASE 01 · LANZAMIENTOS',
      title: 'ROPA LANZADA EN LA SEMANA',
      description:
        'Enterate al instante de cada nueva prenda producida en la semana, lanzamientos de colección y ediciones especiales recién salidas de fábrica.',
      tag: 'NOVEDADES SEMANALES',
      icon: Flame,
    },
    {
      id: 'feature-2',
      code: 'FASE 02 · REPOSICIONES',
      title: 'AVISOS DE RESTOCKS EN VIVO',
      description:
        'Recibí el aviso inmediato cuando volvemos a tener stock de piezas agotadas como tracksuits, hoodies pesados y remeras oversize.',
      tag: 'STOCK DISPONIBLE',
      icon: Zap,
    },
    {
      id: 'feature-3',
      code: 'FASE 03 · BENEFICIOS',
      title: 'DESCUENTOS & COMBOS EXCLUSIVOS',
      description:
        'Accedé a promociones relámpago, precios especiales de pre-compra y beneficios que únicamente se comparten para la gente del grupo.',
      tag: 'EXCLUSIVO WHATSAPP',
      icon: Sparkles,
    },
    {
      id: 'feature-4',
      code: 'FASE 04 · COMUNIDAD',
      title: 'CULTURA URBANA & NOVEDADES DE CDE',
      description:
        'Enterate de fotos exclusivas de producción en el taller, nuevos conceptos y todo lo que pasa en el movimiento urbano de SANT CLOTHES.',
      tag: 'CULTURA SANT',
      icon: Users,
    },
  ];

  const joinSteps = [
    {
      number: '01',
      title: 'HACÉ CLICK EN EL ENLACE',
      description: 'Accedé al link oficial de invitación del grupo de WhatsApp de SANT CLOTHES.',
    },
    {
      number: '02',
      title: 'ACEPTÁ LA INVITACIÓN',
      description: 'Unite al grupo de WhatsApp sin costo y presentate con la comunidad.',
    },
    {
      number: '03',
      title: 'ACTIVÁ LAS NOTIFICACIONES',
      description: 'Recibí los links de drops anticipados y las novedades semanales en tu celular.',
    },
  ];

  return (
    <div className="bg-[#f6f8f9] text-[#17191c] min-h-screen">
      <section id="sant-club" className="relative w-full bg-[#17191c] border-b border-[#b6b2a7]/40 overflow-hidden">
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[380px] max-h-[75vh]">
          <picture>
            <source media="(max-width: 639px)" srcSet={communityMobileSrcSet} />
            <Image
              src="/img/hero/IMG_2022_horizontal_16x9.webp"
              alt="Le Sant Club — Nova Collection"
              fill
              priority
              quality={88}
              sizes="100vw"
              className="object-cover object-center"
            />
          </picture>

          <div className="absolute top-20 left-6 sm:top-24 sm:left-12 lg:top-20 lg:left-16 z-10">
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-white bg-black/75 backdrop-blur-md px-4 py-2 border border-white/25 shadow-lg">
              SANT CLUB // PARAGUAY
            </span>
          </div>

          <div className="absolute bottom-4 right-4 sm:bottom-4 sm:right-12 z-10">
            <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-zinc-300 bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10">
              COMUNIDAD OFICIAL
            </span>
          </div>
        </div>

        <div className="bg-white border-t border-[#b6b2a7]/40 py-12 sm:py-16 px-6 sm:px-12 lg:px-20 text-[#17191c]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a] block">
                COMUNIDAD OFICIAL · SANT CLUB
              </span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-[family-name:var(--font-bebas)] tracking-wider text-[#17191c] uppercase leading-[0.92]"
              >
                MÁS QUE UNA MARCA DE ROPA, UN MOVIMIENTO URBANO
              </motion.h1>

              <p className="text-xs sm:text-sm font-mono text-[#50524a] uppercase tracking-wide leading-relaxed max-w-2xl">
                Una comunidad nacida en las calles de Paraguay. Creadores, artistas y apasionados del streetwear que eligen la alta densidad, el gramaje pesado y el valor de soñar en grande.
              </p>

              <div className="pt-3 flex flex-wrap gap-4 items-center">
                <a
                  href={WHATSAPP_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-[#17191c] text-white hover:bg-[#2e3136] text-xs font-mono font-bold tracking-[0.2em] uppercase px-7 py-4 border border-[#17191c] transition-all shadow-md group"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  <span>UNIRSE AL GRUPO DE WHATSAPP</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <Link
                  href="#unirse"
                  className="inline-flex items-center gap-2 border border-[#17191c] text-[#17191c] hover:bg-[#17191c] hover:text-white text-xs font-mono font-bold tracking-[0.2em] uppercase px-7 py-4 transition-all"
                >
                  <span>CÓMO UNIRTE</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              <div className="bg-[#f6f8f9] border border-[#b6b2a7]/50 p-5 flex items-center justify-between">
                <div>
                  <span className="block font-[family-name:var(--font-bebas)] text-4xl text-[#17191c] tracking-wider leading-none">
                    1K+
                  </span>
                  <span className="text-[10px] font-mono text-[#50524a] uppercase tracking-wider">
                    MIEMBROS ACTIVOS
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">#01</span>
              </div>

              <div className="bg-[#f6f8f9] border border-[#b6b2a7]/50 p-5 flex items-center justify-between">
                <div>
                  <span className="block font-[family-name:var(--font-bebas)] text-4xl text-[#17191c] tracking-wider leading-none">
                    24/7
                  </span>
                  <span className="text-[10px] font-mono text-[#50524a] uppercase tracking-wider">
                    CANAL DIRECTO WHATSAPP
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">#02</span>
              </div>

              <div className="bg-[#f6f8f9] border border-[#b6b2a7]/50 p-5 flex items-center justify-between">
                <div>
                  <span className="block font-[family-name:var(--font-bebas)] text-4xl text-[#17191c] tracking-wider leading-none">
                    100%
                  </span>
                  <span className="text-[10px] font-mono text-[#50524a] uppercase tracking-wider">
                    CULTURA STREETWEAR
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">#03</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="whatsapp-community" className="py-20 sm:py-28 scroll-mt-24 bg-[#f6f8f9] text-[#17191c] border-b border-[#b6b2a7]/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#50524a]">
                  GRUPO OFICIAL SANT CLUB
                </span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-[#17191c] leading-none">
                EL PUNTO DE ENCUENTRO EN WHATSAPP
              </h2>
              <p className="text-xs sm:text-sm font-mono text-[#50524a] uppercase tracking-wide leading-relaxed">
                Unite al grupo oficial de WhatsApp. Enterate de las prendas lanzadas en la semana, avisos inmediatos de restocks y promociones exclusivas para la comunidad.
              </p>
            </div>

            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#17191c] text-white hover:bg-black text-xs font-mono font-bold tracking-[0.2em] uppercase px-6 py-3.5 border border-[#17191c] shadow-sm transition-all shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>UNIRME AL GRUPO AHORA</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatsappFeatures.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white border border-[#b6b2a7]/50 p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-[#17191c] transition-all duration-300 shadow-xs group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#b6b2a7]/30 pb-3">
                      <div className="w-10 h-10 bg-[#f6f8f9] border border-[#b6b2a7]/60 flex items-center justify-center group-hover:bg-[#17191c] group-hover:border-[#17191c] transition-colors">
                        <IconComp className="w-4 h-4 text-[#17191c] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-[#17191c] bg-zinc-100 px-2.5 py-1 border border-[#b6b2a7]/40">
                        {item.code}
                      </span>
                    </div>

                    <h3 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wider text-[#17191c] uppercase leading-tight">
                      {item.title}
                    </h3>

                    <p className="text-xs font-mono text-[#50524a] uppercase leading-relaxed tracking-wide">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[9px] font-mono font-bold text-[#50524a] uppercase tracking-widest">
                    <span>{item.tag}</span>
                    <span className="text-[#17191c]">✓ ACTIVO</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-[#17191c] text-white p-8 sm:p-12 lg:p-14 border border-[#17191c] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>COMUNIDAD OFICIAL · ACCESO DIRECTO VÍA WHATSAPP</span>
              </div>

              <h3 className="text-3xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-[0.95]">
                ENTERATE DE CADA DROP ANTES DE QUE SE AGOTE
              </h3>

              <p className="text-xs sm:text-sm font-mono text-zinc-300 uppercase tracking-wide leading-relaxed max-w-2xl">
                Aquí te enterarás de los drops más nuevos antes que nadie, de las prendas lanzadas en la semana, reposiciones de stock y todo lo que pasa en nuestra comunidad urbana.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href={WHATSAPP_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white text-[#17191c] hover:bg-zinc-200 text-xs font-mono font-bold tracking-[0.2em] uppercase px-8 py-4 transition-all shadow-md group"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                  <span>ENTRAR AL GRUPO DE WHATSAPP</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Acceso 100% gratuito · Sin spam
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="manifiesto" className="py-14 sm:py-20 scroll-mt-24 bg-[#f6f8f9] text-[#17191c] border-b border-[#b6b2a7]/40">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 text-center space-y-6">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-16 sm:w-20 mx-auto">
              <Image
                src="/img/logo/logo-iso-negro.png"
                alt="SANT CLOTHES"
                width={96}
                height={96}
                className="h-auto w-full object-contain"
              />
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a]">
              MANIFIESTO DE COMUNIDAD
            </span>
          </div>

          <blockquote className="text-3xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-[#17191c] leading-[0.95]">
            &quot;NO DISEÑAMOS ROPA PARA SEGUIR TENDENCIAS PASAJERAS. CREAMOS PIEZAS PESADAS Y DURADERAS PARA QUIENES TIENEN LA AGALLA DE CONSTRUIR SU PROPIO CAMINO DESDE CERO.&quot;
          </blockquote>

          <div className="pt-2">
            <span className="block text-xs font-mono font-bold text-[#17191c] uppercase tracking-[0.2em]">
              MATÍAS & LUCAS SANTOS
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              FUNDADORES DE SANT CLOTHES
            </span>
          </div>
        </div>
      </section>

      <section id="unirse" className="py-20 sm:py-28 scroll-mt-24 bg-white text-[#17191c] border-b border-[#b6b2a7]/40">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a]">
              PASO A PASO
            </span>
            <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-[#17191c] leading-none">
              ¿CÓMO SUMARTE AL SANT CLUB?
            </h2>
            <p className="text-xs sm:text-sm font-mono text-[#50524a] uppercase tracking-wide">
              Tres pasos sencillos para formar parte del círculo exclusivo de la marca.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {joinSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-8 bg-[#f6f8f9] border border-[#b6b2a7]/30 space-y-4 relative hover:border-[#17191c] transition-colors"
              >
                <span className="font-[family-name:var(--font-bebas)] text-5xl text-zinc-300 block leading-none">
                  {step.number}
                </span>
                <h3 className="text-xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-[#17191c]">
                  {step.title}
                </h3>
                <p className="text-xs font-mono text-zinc-600 uppercase tracking-wide leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-[#17191c] text-white p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] uppercase tracking-wider">
                ¿LISTO PARA EL PRÓXIMO DROP?
              </h3>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wide">
                Ingresá ahora al grupo oficial de WhatsApp y asegurá tu lugar en el club.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-white text-[#17191c] hover:bg-zinc-200 text-xs font-mono font-bold tracking-[0.2em] uppercase px-6 py-3.5 transition-all shadow-lg shrink-0"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                <span>UNIRME AL WHATSAPP</span>
              </a>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 text-xs font-mono font-bold tracking-[0.2em] uppercase px-6 py-3.5 transition-all shrink-0"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>VER CATÁLOGO</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
