'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function RackStudioHero() {
  return (
    <section className="w-full bg-[#f6f8f9] text-[#17191c] py-16 sm:py-24 px-6 sm:px-12 border-b border-[#b6b2a7]/40 relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">

        {/* Top Header Row */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono font-extrabold uppercase tracking-[0.25em] text-[#50524a] mb-8 border-b border-[#b6b2a7]/40 pb-4">
          <span>LIMITED RELEASE</span>
          <div className="flex items-center gap-1 text-[#17191c]">
            <span>✦✦✦</span>
          </div>
          <span>JULY 2026</span>
        </div>

        {/* Main Hero Headline */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-3 mb-10"
        >
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-none text-[#17191c]">
            THE NEW ERA
          </h2>
          <p className="text-xs sm:text-sm font-mono font-medium tracking-wide uppercase text-[#50524a] max-w-lg mx-auto">
            A NEW CHAPTER OF ELEVATED ESSENTIALS AND STATEMENT SILHOUETTES BY SANT CLOTHES.
          </p>
        </motion.div>

        {/* Center Studio Rack Presentation Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative w-full max-w-4xl aspect-[16/10] bg-[#e6e6e6] border border-[#b6b2a7]/40 overflow-hidden shadow-2xl mb-8"
          style={{ borderRadius: '0px' }}
        >
          <Image
            src="/img/editorial/rack-outfits-4.jpg"
            alt="SANT CLOTHES — The New Era 4 Outfits Rack Collection"
            fill
            priority
            quality={95}
            className="object-cover object-center scale-100 hover:scale-[1.02] transition-transform duration-700 ease-out"
          />
        </motion.div>

        {/* 4 Outfits Pillars Badges Bar */}
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 text-center">
          <div className="p-3 bg-[#f6f8f9] border border-[#b6b2a7]">
            <span className="text-[10px] font-mono font-bold uppercase text-[#17191c] block tracking-widest">
              01 — STREETWEAR
            </span>
            <span className="text-[9px] font-mono text-[#50524a] uppercase">HOODIE & WIDE DENIM</span>
          </div>
          <div className="p-3 bg-[#f6f8f9] border border-[#b6b2a7]">
            <span className="text-[10px] font-mono font-bold uppercase text-[#17191c] block tracking-widest">
              02 — OLD MONEY
            </span>
            <span className="text-[9px] font-mono text-[#50524a] uppercase">KNIT & PLEATED TROUSERS</span>
          </div>
          <div className="p-3 bg-[#f6f8f9] border border-[#b6b2a7]">
            <span className="text-[10px] font-mono font-bold uppercase text-[#17191c] block tracking-widest">
              03 — MODA CASUAL
            </span>
            <span className="text-[9px] font-mono text-[#50524a] uppercase">OVERSHIRT & STRAIGHT FIT</span>
          </div>
          <div className="p-3 bg-[#f6f8f9] border border-[#b6b2a7]">
            <span className="text-[10px] font-mono font-bold uppercase text-[#17191c] block tracking-widest">
              04 — SPORTS
            </span>
            <span className="text-[9px] font-mono text-[#50524a] uppercase">ACTIVE TRACK SET</span>
          </div>
        </div>

        {/* Bottom Poster Row */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-left pt-6 border-t border-[#b6b2a7]/40">
          <div>
            <span className="text-lg font-[family-name:var(--font-bebas)] tracking-wider uppercase text-[#17191c] block leading-none">
              NEVER BASIC
            </span>
            <span className="text-[10px] font-mono text-[#50524a] uppercase tracking-widest">
              PARAGUAY SANT CLOTHES
            </span>
          </div>

          <div className="text-center md:text-left">
            <p className="text-[11px] font-mono font-medium text-[#50524a] uppercase tracking-wider leading-snug">
              DESIGNED FOR THOSE WHO NEVER FOLLOW THE CROWD.
            </p>
          </div>

          <div className="flex justify-end">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-3 bg-[#17191c] text-[#f6f8f9] hover:bg-[#50524a] text-[11px] font-mono font-bold tracking-[0.2em] uppercase px-8 py-4 border border-[#17191c] transition-all shadow-xl"
              style={{ borderRadius: '0px' }}
            >
              <span>SHOP NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
