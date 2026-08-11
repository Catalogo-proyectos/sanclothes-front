'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { NavCategory } from './navData';

interface MegaMenuPanelProps {
  cat: NavCategory;
  isActive: boolean;
  onNavigate: () => void;
}

/**
 * All four panels stay mounted so switching categories is a class toggle rather
 * than a remount — no element churn, no image refetch, no blank frame.
 */
function MegaMenuPanel({ cat, isActive, onNavigate }: MegaMenuPanelProps) {
  return (
    <motion.div
      initial={false}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className={`${isActive ? 'flex' : 'hidden'
        } items-stretch justify-between gap-8 lg:gap-12`}
    >
      {/* 1. LEFT: Big Display Title */}
      <div className="w-48 sm:w-56 shrink-0 pt-1">
        <h2 className="font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-[0.05em] text-[#17191c] uppercase leading-none">
          {cat.displayTitle}
        </h2>
        <p className="mt-3 text-[10px] font-bold tracking-[0.25em] uppercase text-[#17191c]/40">
          SANT CLOTHES
        </p>
      </div>

      {/* 2. MIDDLE: 2 Columns of Category Links */}
      <div className="flex-1 grid grid-cols-2 gap-8 lg:gap-12 max-w-xl">
        {/* Column 1 */}
        <div>
          <p className="text-[11px] font-black tracking-[0.2em] uppercase text-[#17191c] mb-4">
            {cat.col1Title}
          </p>
          <ul className="space-y-2.5">
            {cat.col1Links.map((link, idx) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  className={`text-[13px] tracking-wide block transition-colors duration-150 ${idx === 0
                      ? 'font-bold text-[#17191c] hover:underline'
                      : 'font-medium text-[#17191c]/75 hover:text-[#17191c]'
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2 */}
        <div className="pt-[26px]">
          <ul className="space-y-2.5">
            {cat.col2Links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  className="text-[13px] font-medium tracking-wide text-[#17191c]/75 hover:text-[#17191c] transition-colors duration-150 block"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. RIGHT: Featured Campaign Image */}
      <div className="w-[320px] xl:w-[380px] shrink-0 self-stretch -my-8 ml-auto relative overflow-hidden bg-zinc-100 group/card">
        <Link
          href={cat.href}
          onClick={onNavigate}
          className="block w-full h-full relative"
        >
          {/* El panel mide 320-380px, no 800: dejamos que next/image sirva la
              variante justa. Sigue siendo eager con prioridad baja para que el
              menú se sienta instantáneo sin competir con el LCP de la página. */}
          <Image
            src={cat.featuredImage}
            alt={cat.displayTitle}
            width={380}
            height={320}
            quality={75}
            sizes="(min-width: 1280px) 380px, 320px"
            className="w-full h-[320px] object-cover object-center transition-transform duration-500 ease-out group-hover/card:scale-105"
            loading="eager"
            fetchPriority="low"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <span className="inline-block px-2 py-0.5 mb-2 bg-white text-black text-[9px] font-black tracking-[0.2em] uppercase">
              {cat.featuredTag}
            </span>
            <p className="text-sm font-black tracking-wider uppercase drop-shadow-sm flex items-center gap-1">
              VER LOOKBOOK <span className="transition-transform duration-300 group-hover/card:translate-x-1">→</span>
            </p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export default memo(MegaMenuPanel);
