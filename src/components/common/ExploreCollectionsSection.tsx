'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function ExploreCollectionsSection() {
  const collectionData = {
    outerwear: {
      items: '124 ITEMS',
      title: 'OUTERWEAR',
      image: '/img/hero-1.jpg',
      href: '/catalog?category=streetwear',
    },
    sneakers: {
      items: '86 ITEMS',
      title: 'SNEAKERS',
      image: '/img/col-2.png',
      href: '/catalog?category=performance',
    },
    essentials: {
      items: '215 ITEMS',
      title: 'ESSENTIALS',
      image: '/img/col-3.png',
      href: '/catalog?category=remeras',
    },
    accessories: {
      items: '92 ITEMS',
      title: 'ACCESSORIES',
      image: '/img/col-4.png',
      href: '/catalog?category=casual',
    },
  };

  return (
    <section className="w-full bg-[#f6f8f9] text-[#17191c] py-20 px-6 sm:px-12 border-b border-[#b6b2a7]/40">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#50524a] block mb-2">
              SHOP BY CATEGORY
            </span>
            <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-none">
              <span className="text-[#17191c] font-black">EXPLORE OUR </span>
              <span className="text-[#50524a] font-normal">COLLECTIONS</span>
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#17191c] hover:text-[#50524a] transition-colors inline-flex items-center gap-2 border-b-2 border-[#17191c] pb-1 self-start md:self-end"
          >
            <span>VIEW ALL</span>
            <span className="text-xs">—</span>
          </Link>
        </div>

        {/* 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Column 1: Wide Feature (Outerwear) - 5 Cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-5"
          >
            <Link
              href={collectionData.outerwear.href}
              className="group relative block w-full h-full min-h-[480px] bg-[#17191c] overflow-hidden border border-[#b6b2a7]"
              style={{ borderRadius: '0px' }}
            >
              <Image
                src={collectionData.outerwear.image}
                alt={collectionData.outerwear.title}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17191c]/85 via-[#17191c]/30 to-transparent pointer-events-none" />

              {/* Bottom Content & Action */}
              <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between z-10">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#b6b2a7] uppercase block mb-1">
                    {collectionData.outerwear.items}
                  </span>
                  <h3 className="text-4xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wider uppercase text-[#f6f8f9] leading-none">
                    {collectionData.outerwear.title}
                  </h3>
                </div>

                {/* Dark Slate Button */}
                <div
                  className="w-12 h-12 bg-[#50524a] text-[#f6f8f9] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 ml-4 border border-[#50524a]"
                  style={{ borderRadius: '0px' }}
                >
                  <ArrowRight className="w-5 h-5 text-[#f6f8f9]" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Column 2: Tall Vertical (Sneakers) - 3 Cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-3"
          >
            <Link
              href={collectionData.sneakers.href}
              className="group relative block w-full h-full min-h-[480px] bg-[#17191c] overflow-hidden border border-[#b6b2a7]"
              style={{ borderRadius: '0px' }}
            >
              <Image
                src={collectionData.sneakers.image}
                alt={collectionData.sneakers.title}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17191c]/85 via-[#17191c]/30 to-transparent pointer-events-none" />

              {/* Bottom Content & Action */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between z-10">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#b6b2a7] uppercase block mb-1">
                    {collectionData.sneakers.items}
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wider uppercase text-[#f6f8f9] leading-none">
                    {collectionData.sneakers.title}
                  </h3>
                </div>

                {/* Dark Circle Button */}
                <div
                  className="w-10 h-10 bg-[#17191c]/80 border border-[#b6b2a7]/40 text-[#f6f8f9] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 ml-2"
                  style={{ borderRadius: '0px' }}
                >
                  <ArrowUpRight className="w-4 h-4 text-[#f6f8f9]" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Column 3: Two Stacked Cards (Essentials & Accessories) - 4 Cols */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Top Card: Essentials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1"
            >
              <Link
                href={collectionData.essentials.href}
                className="group relative block w-full h-[228px] bg-[#17191c] overflow-hidden border border-[#b6b2a7]"
                style={{ borderRadius: '0px' }}
              >
                <Image
                  src={collectionData.essentials.image}
                  alt={collectionData.essentials.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17191c]/85 via-[#17191c]/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between z-10">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#b6b2a7] uppercase block mb-1">
                      {collectionData.essentials.items}
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wider uppercase text-[#f6f8f9] leading-none">
                      {collectionData.essentials.title}
                    </h3>
                  </div>

                  <div
                    className="w-10 h-10 bg-[#17191c]/80 border border-[#b6b2a7]/40 text-[#f6f8f9] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 ml-2"
                    style={{ borderRadius: '0px' }}
                  >
                    <ArrowUpRight className="w-4 h-4 text-[#f6f8f9]" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Bottom Card: Accessories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-1"
            >
              <Link
                href={collectionData.accessories.href}
                className="group relative block w-full h-[228px] bg-[#17191c] overflow-hidden border border-[#b6b2a7]"
                style={{ borderRadius: '0px' }}
              >
                <Image
                  src={collectionData.accessories.image}
                  alt={collectionData.accessories.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17191c]/85 via-[#17191c]/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between z-10">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#b6b2a7] uppercase block mb-1">
                      {collectionData.accessories.items}
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wider uppercase text-[#f6f8f9] leading-none">
                      {collectionData.accessories.title}
                    </h3>
                  </div>

                  <div
                    className="w-10 h-10 bg-[#17191c]/80 border border-[#b6b2a7]/40 text-[#f6f8f9] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 ml-2"
                    style={{ borderRadius: '0px' }}
                  >
                    <ArrowUpRight className="w-4 h-4 text-[#f6f8f9]" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
