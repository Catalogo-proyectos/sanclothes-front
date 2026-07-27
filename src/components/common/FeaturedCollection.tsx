'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Flame } from 'lucide-react';

export default function FeaturedCollection() {
  const collectionItems = [
    {
      tag: 'LINO & ALGODÓN',
      title: 'CAMISA OVERSIZED BEIGE',
      desc: 'Textura liviana, corte relajado y estilo casual atemporal.',
      img: '/img/col-4.png',
      href: '/catalog?category=casual',
    },
    {
      tag: 'FRISO 400G',
      title: 'HOODIE ESTRUCTURADO BLACK',
      desc: 'Capucha de doble capa sin cordones innecesarios. Estructura firme e interior suave.',
      img: '/img/col-1.png',
      href: '/catalog?category=streetwear',
    },
    {
      tag: 'ALGODÓN PREMIUM',
      title: 'POLO CANALÉ OLD MONEY',
      desc: 'Confeccionado en algodón de calidad superior con caída sutil y elegante.',
      img: '/img/col-2.png',
      href: '/catalog?category=old-money',
    },
  ];

  return (
    <section className="py-24 bg-[#f6f8f9] text-[#17191c] border-b border-[#b6b2a7]/40">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-[#17191c]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a]">
              CÁPSULA ESPECIAL SS26
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wider text-[#17191c] uppercase mb-3 leading-none">
            SILUETAS MONOCROMÁTICAS — CORE DROP
          </h2>
          <p className="text-xs sm:text-sm text-[#50524a] font-mono font-bold tracking-wide uppercase leading-relaxed">
            UNA SELECCIÓN CURADA DE PRENDAS ESENCIALES EN TONOS NEUTROS Y TIERRA DISEÑADAS PARA COMBINARSE SIN ESFUERZO.
          </p>
        </div>

        {/* Collection Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {collectionItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-[#17191c] text-[#f6f8f9] border border-[#50524a] p-6 flex flex-col justify-between hover:border-[#b6b2a7] transition-colors shadow-none"
              style={{ borderRadius: '0px' }}
            >
              <div>
                <div className="relative aspect-[3/4] w-full mb-6 overflow-hidden bg-[#17191c]">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover object-center grayscale hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <span className="absolute top-3 left-3 text-[9px] font-mono font-bold tracking-widest text-[#f6f8f9] bg-[#50524a] px-2.5 py-1 uppercase">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-2xl font-[family-name:var(--font-bebas)] tracking-wider uppercase mb-2 text-[#f6f8f9] leading-none">
                  {item.title}
                </h3>
                <p className="text-xs text-[#b6b2a7] font-medium tracking-wide uppercase leading-relaxed mb-6 font-mono">
                  {item.desc}
                </p>
              </div>

              <Link
                href={item.href}
                className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-[#f6f8f9] hover:text-[#b6b2a7] border-b border-[#50524a] pb-1 self-start transition-colors"
              >
                <span>VER DETALLES DE PRENDA</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

