'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Gift,
  Ticket,
  MessageSquare,
  Sparkles,
  Camera,
  ShoppingBag,
} from 'lucide-react';

export default function ComunidadContent() {
  const communityPosts = [
    {
      id: 'post-1',
      username: '@marcos_streetfit',
      location: 'Ciudad del Este, Paraguay',
      image: '/img/hero/IMG_3202.webp',
      taggedProduct: 'Hoodie Acid Wash Drop #01 400G',
      productId: 'prod_trece_02',
    },
    {
      id: 'post-2',
      username: '@valeria.ss26',
      location: 'Asunción, Paraguay',
      image: '/img/hero/IMG_2996.webp',
      taggedProduct: 'Remera Heavyweight Acid Wash',
      productId: 'prod_trece_03',
    },
    {
      id: 'post-3',
      username: '@lucas_oversized',
      location: 'Encarnación, Paraguay',
      image: '/img/secciones/IMG_4279.webp',
      taggedProduct: 'Le Sant Club Suede Tracksuit',
      productId: 'prod_trece_01',
    },
    {
      id: 'post-4',
      username: '@mateo.cde',
      location: 'Ciudad del Este, Paraguay',
      image: '/img/products/camisa-oversized-beige/IMG_5382.webp',
      taggedProduct: 'Camisa Oversized Beige Heavy Cotton',
      productId: 'prod_trece_04',
    },
    {
      id: 'post-5',
      username: '@bruno_urbanlab',
      location: 'Asunción, Paraguay',
      image: '/img/hero/IMG_1460.webp',
      taggedProduct: 'Buzo Crewneck Oversized Boxy Fit',
      productId: 'prod_trece_05',
    },
    {
      id: 'post-6',
      username: '@camila.street',
      location: 'Foz do Iguaçu, Brasil',
      image: '/img/hero/IMG_4390.webp',
      taggedProduct: 'SANT Essential Heavy Tee',
      productId: 'prod_trece_06',
    },
  ];

  const clubBenefits = [
    {
      icon: Zap,
      code: 'FASE 01 · ACCESO',
      title: 'EARLY ACCESS A DROPS',
      description:
        'Reserva tus prendas 24 horas antes de los lanzamientos oficiales al público. Asegurá tu talle en piezas de producción limitada.',
    },
    {
      icon: Ticket,
      code: 'FASE 02 · EVENTOS',
      title: 'INVITACIONES A POP-UP STORES',
      description:
        'Pases VIP para aperturas de tienda, encuentros en nuestra fábrica de CDE y eventos de cultura urbana en todo Paraguay.',
    },
    {
      icon: Gift,
      code: 'FASE 03 · MERCH',
      title: 'REGALOS DE LA COMUNIDAD',
      description:
        'Recibí kits de stickers, insignias metálicas y regalos exclusivos incluidos en los pedidos de miembros activos.',
    },
    {
      icon: MessageSquare,
      code: 'FASE 04 · MOLDERÍA',
      title: 'VOZ Y VOTO EN PROTOTIPOS',
      description:
        'Participá en encuestas secretas para elegir colores, gramajes y estampados antes de que entren a la línea de corte.',
    },
  ];

  const uploadSteps = [
    {
      number: '01',
      title: 'VESTÍ TU SANT',
      description: 'Combiná tus piezas heavyweight con tu estilo diario.',
    },
    {
      number: '02',
      title: 'FOTOGRAFIÁ & ETIQUETÁ',
      description: 'Publicá tu foto etiquetando a @SANCLOTHES.STUDIO o usa #SANTCLUB.',
    },
    {
      number: '03',
      title: 'APARECÉ EN EL SITE',
      description: 'Seleccionamos semanalmente los mejores outfits para el muro oficial.',
    },
  ];

  return (
    <div className="bg-[#f6f8f9] text-[#17191c] min-h-screen">
      <section id="sant-club" className="relative w-full bg-[#17191c] border-b border-[#b6b2a7]/40 overflow-hidden">
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[380px] max-h-[75vh]">
          <Image
            src="/img/hero/IMG_2022.jpg"
            alt="Le Sant Club — Nova Collection"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center sm:hidden"
          />
          <Image
            src="/img/hero/IMG_2022_horizontal_16x9.png"
            alt="Le Sant Club — Nova Collection"
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-center hidden sm:block"
          />

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
                  href="https://www.instagram.com/santclothespy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-[#17191c] text-white hover:bg-[#50524a] text-xs font-mono font-bold tracking-[0.2em] uppercase px-7 py-4 border border-[#17191c] transition-all shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  <span>UNIRSE EN INSTAGRAM</span>
                </a>
                <Link
                  href="#street-style"
                  className="inline-flex items-center gap-2 border border-[#17191c] text-[#17191c] hover:bg-[#17191c] hover:text-white text-xs font-mono font-bold tracking-[0.2em] uppercase px-7 py-4 transition-all"
                >
                  <span>VER LOOKS DE LA COMUNIDAD</span>
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
                    100%
                  </span>
                  <span className="text-[10px] font-mono text-[#50524a] uppercase tracking-wider">
                    CULTURA URBANA
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">#02</span>
              </div>

              <div className="bg-[#f6f8f9] border border-[#b6b2a7]/50 p-5 flex items-center justify-between">
                <div>
                  <span className="block font-[family-name:var(--font-bebas)] text-4xl text-[#17191c] tracking-wider leading-none">
                    2
                  </span>
                  <span className="text-[10px] font-mono text-[#50524a] uppercase tracking-wider">
                    TIENDAS EN CDE
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">#03</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="street-style" className="py-20 sm:py-28 scroll-mt-24 bg-[#f6f8f9] text-[#17191c] border-b border-[#b6b2a7]/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-[#17191c] leading-none">
                LA COMUNIDAD EN LAS CALLES
              </h2>
              <p className="text-xs sm:text-sm font-mono text-[#50524a] uppercase tracking-wide leading-relaxed">
                Fotos reales enviadas y etiquetadas por miembros de la comunidad en redes sociales. Hacé click en cualquier imagen para explorar la prenda.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest bg-white px-4 py-2 border border-[#b6b2a7]/40 shadow-sm">
              <Camera className="w-4 h-4 text-black" />
              <span>ETIQUETÁ @SANTCLOTHESPY</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {communityPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group relative bg-white border border-[#b6b2a7]/40 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[3/4] w-full bg-zinc-900 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={`${post.username} — Fit Sant Clothes`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white bg-black/70 backdrop-blur-md px-3 py-1 border border-white/20">
                      {post.username}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/10 uppercase">
                      {post.location}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
                    <div className="bg-white/95 backdrop-blur-md p-3 border border-black/10 shadow-lg flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                          PRENDA ETIQUETADA
                        </span>
                        <span className="block text-xs font-bold text-[#17191c] truncate uppercase">
                          {post.taggedProduct}
                        </span>
                      </div>
                      <Link
                        href={`/products/${post.productId}`}
                        className="shrink-0 p-2 bg-[#17191c] text-white hover:bg-black transition-colors"
                        aria-label={`Ver producto ${post.taggedProduct}`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="py-20 sm:py-28 scroll-mt-24 bg-[#f6f8f9] text-[#17191c] border-b border-[#b6b2a7]/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a] block">
              PRIVILEGIOS EXCLUSIVOS · SANT CLUB
            </span>
            <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-[#17191c] leading-none">
              BENEFICIOS DE SER PARTE DEL CLUB
            </h2>
            <p className="text-xs sm:text-sm font-mono text-[#50524a] uppercase tracking-wide leading-relaxed">
              No es un programa de puntos genérico. Es un pase directo a la cultura interna de nuestra fábrica.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubBenefits.map((benefit, index) => {
              const IconComp = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white border border-[#b6b2a7] p-6 sm:p-8 space-y-5 hover:border-[#17191c] transition-all duration-300 shadow-sm relative group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#b6b2a7]/30 pb-3">
                      <div className="w-12 h-12 bg-[#f6f8f9] border border-[#b6b2a7]/60 flex items-center justify-center shrink-0 group-hover:border-[#17191c] group-hover:bg-[#17191c] transition-colors">
                        <IconComp className="w-5 h-5 text-[#17191c] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-[#17191c] bg-zinc-100 px-3 py-1 border border-[#b6b2a7]/50">
                        {benefit.code}
                      </span>
                    </div>

                    <h3 className="font-[family-name:var(--font-bebas)] text-xl sm:text-2xl tracking-wider text-[#17191c] uppercase leading-tight">
                      {benefit.title}
                    </h3>

                    <p className="text-xs font-mono text-[#50524a] uppercase leading-relaxed tracking-wide">
                      {benefit.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[9px] font-mono font-bold text-[#50524a] uppercase tracking-widest">
                    <span>SANT CLUB ACCESS</span>
                    <span className="text-[#17191c]">PASS #{String(index + 1).padStart(2, '0')}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="manifiesto" className="py-20 sm:py-28 scroll-mt-24 bg-[#f6f8f9] text-[#17191c] border-b border-[#b6b2a7]/40">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 text-center space-y-8">
          <div className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#50524a]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a]">
              MANIFIESTO DE COMUNIDAD
            </span>
          </div>

          <blockquote className="text-3xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-[#17191c] leading-[0.95]">
            "NO DISEÑAMOS ROPA PARA SEGUIR TENDENCIAS PASAJERAS. CREAMOS PIEZAS PESADAS Y DURADERAS PARA QUIENES TIENEN LA AGALLA DE CONSTRUIR SU PROPIO CAMINO DESDE CERO."
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

      <section id="participar" className="py-20 sm:py-28 scroll-mt-24 bg-white text-[#17191c] border-b border-[#b6b2a7]/40">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a]">
              ¿CÓMO SUMARTE AL MURO OFICIAL?
            </span>
            <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-[#17191c] leading-none">
              3 PASOS PARA APARECER EN EL SITE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {uploadSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-8 bg-[#f6f8f9] border border-[#b6b2a7]/30 space-y-4 relative"
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
                ¿TENÉS TU OUTFIT LISTO?
              </h3>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wide">
                Etiquetá a @santclothespy en Instagram o TikTok para ser destacado.
              </p>
            </div>

            <a
              href="https://www.instagram.com/santclothespy/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-white text-[#17191c] hover:bg-zinc-200 text-xs font-mono font-bold tracking-[0.2em] uppercase px-6 py-3.5 transition-all shadow-lg shrink-0"
            >
              <Camera className="w-4 h-4" />
              <span>IR A INSTAGRAM</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
