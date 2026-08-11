'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Compass, Shield, Flame } from 'lucide-react';

/* ── 3D Interactive WebGL Canvas Divider Component ── */
interface Canvas3DDividerProps {
  label: string;
  tag: string;
  accentColor?: string;
}

function Canvas3DDivider({ label, tag, accentColor = '#ffffff' }: Canvas3DDividerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = 160);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = 160;
    };
    window.addEventListener('resize', handleResize);

    // 3D Floating Particle System with Wave Motion
    const particleCount = Math.min(60, Math.floor(width / 20));
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 300 + 50,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.4,
      angle: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Deep dark 3D background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0a0b0c');
      bgGrad.addColorStop(0.5, '#17191c');
      bgGrad.addColorStop(1, '#08090a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 3D Sinusoidal Energy Lines
      ctx.lineWidth = 1;
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 - j * 0.02})`;
        for (let x = 0; x < width; x += 10) {
          const y =
            height / 2 +
            Math.sin(x * 0.008 + time + j) * 25 +
            Math.cos(x * 0.004 - time * 0.5) * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Render 3D Particles with Perspective Projection
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += Math.sin(time + p.angle) * 0.5;
        p.angle += 0.02;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const scale = 300 / p.z;
        const alpha = Math.min(1, Math.max(0.1, (1 - p.z / 350) * 0.8));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = accentColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [accentColor]);

  return (
    <div className="relative w-full h-[160px] overflow-hidden border-y border-white/15 select-none my-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Kinetic Animated Marquee Text Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-between px-6 sm:px-12 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] uppercase text-zinc-300">
            {tag}
          </span>
        </div>

        <motion.div
          animate={{ x: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="text-right"
        >
          <span className="font-[family-name:var(--font-bebas)] text-2xl sm:text-4xl lg:text-5xl tracking-[0.15em] text-white uppercase drop-shadow-md">
            {label}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Main Category Showcase Component ── */
export default function CategoryShowcaseGrid() {
  return (
    <div className="w-full bg-[#17191c] text-white">
      {/* ── 1. CASUAL SHOWCASE ── */}
      <section className="relative w-full h-[580px] sm:h-[680px] lg:h-[750px] overflow-hidden group flex flex-col justify-between border-b border-white/10">
        <Image
          src="/img/hero/Sants Casual.jpeg"
          alt="SANT CLOTHES — Línea Casual"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out hidden sm:block"
        />
        <Image
          src="/img/hero/Hero Movil Casual.jpeg"
          alt="SANT CLOTHES — Línea Casual Móvil"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out sm:hidden"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.25em] text-white bg-black/85 backdrop-blur-md px-4 py-2 uppercase border border-white/20">
            <Compass className="w-3.5 h-3.5 text-white" />
            <span>SANT CLOTHES · LÍNEA CASUAL</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 p-6 sm:p-12 lg:p-16 space-y-4 max-w-4xl text-white"
        >
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-[family-name:var(--font-bebas)] tracking-wider uppercase leading-none text-white drop-shadow-lg">
            CASUAL — ESSENTIALS & DAILY WEAR
          </h2>
          <p className="text-xs sm:text-sm font-mono tracking-wide uppercase text-zinc-300 leading-relaxed max-w-xl">
            BASE DEL GUARDARROPA. REMERAS Y PANTALONES EN ALGODÓN PEINADO DE ALTO GRAMAJE PARA USO DIARIO.
          </p>
          <div className="pt-3">
            <Link
              href="/catalog?category=casual"
              className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 text-[11px] font-mono font-extrabold tracking-[0.2em] uppercase px-8 py-4 border border-white transition-all duration-300 shadow-2xl group/btn"
              style={{ borderRadius: '0px' }}
            >
              <span>EXPLORAR CASUAL</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 3D INTERACTIVE DIVIDER 1 (CASUAL → STREETWEAR) ── */}
      <Canvas3DDivider
        label="STREETWEAR SS26 · OVERSIZED FIT"
        tag="01 // CASUAL → STREETWEAR"
        accentColor="#ffffff"
      />

      {/* ── 2. STREETWEAR SHOWCASE ── */}
      <section className="relative w-full h-[580px] sm:h-[680px] lg:h-[750px] overflow-hidden group flex flex-col justify-between border-b border-white/10">
        <Image
          src="/img/hero/Hero-Catalogo2.jpeg"
          alt="SANT CLOTHES — Colección Streetwear"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out hidden sm:block"
        />
        <Image
          src="/img/hero/Hero Movil Streetweater.jpeg"
          alt="SANT CLOTHES — Colección Streetwear Móvil"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out sm:hidden"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.25em] text-white bg-black/85 backdrop-blur-md px-4 py-2 uppercase border border-white/20">
            <Flame className="w-3.5 h-3.5 text-white" />
            <span>SANT CLOTHES · STREETWEAR DIVISION</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 p-6 sm:p-12 lg:p-16 space-y-4 max-w-4xl text-white"
        >
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-[family-name:var(--font-bebas)] tracking-wider uppercase leading-none text-white drop-shadow-lg">
            STREETWEAR — HEAVYWEIGHT 400G & HOODIES
          </h2>
          <p className="text-xs sm:text-sm font-mono tracking-wide uppercase text-zinc-300 leading-relaxed max-w-xl">
            CÁPSULA ESPECIAL SS26. HOODIES DE FRISO HEAVYWEIGHT, SILUETAS OVERSIZED Y PRINTS EXCLUSIVOS.
          </p>
          <div className="pt-3">
            <Link
              href="/catalog?category=streetwear"
              className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 text-[11px] font-mono font-extrabold tracking-[0.2em] uppercase px-8 py-4 border border-white transition-all duration-300 shadow-2xl group/btn"
              style={{ borderRadius: '0px' }}
            >
              <span>EXPLORAR STREETWEAR</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 3D INTERACTIVE DIVIDER 2 (STREETWEAR → OLD MONEY) ── */}
      <Canvas3DDivider
        label="SILENT LUXURY · TEJIDOS NOBLES"
        tag="02 // STREETWEAR → OLD MONEY"
        accentColor="#d4af37"
      />

      {/* ── 3. OLD MONEY SHOWCASE ── */}
      <section className="relative w-full h-[580px] sm:h-[680px] lg:h-[750px] overflow-hidden group flex flex-col justify-between border-b border-white/10">
        <Image
          src="/img/hero/Sants Hero Old Money.jpeg"
          alt="SANT CLOTHES — Línea Old Money"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out hidden sm:block"
        />
        <Image
          src="/img/hero/Hero Movil Old Money.jpeg"
          alt="SANT CLOTHES — Línea Old Money Móvil"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out sm:hidden"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.25em] text-white bg-black/85 backdrop-blur-md px-4 py-2 uppercase border border-white/20">
            <Shield className="w-3.5 h-3.5 text-white" />
            <span>SANT CLOTHES · OLD MONEY COLLECTION</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 p-6 sm:p-12 lg:p-16 space-y-4 max-w-4xl text-white"
        >
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-[family-name:var(--font-bebas)] tracking-wider uppercase leading-none text-white drop-shadow-lg">
            OLD MONEY — SILENT LUXURY & SASTRERÍA
          </h2>
          <p className="text-xs sm:text-sm font-mono tracking-wide uppercase text-zinc-300 leading-relaxed max-w-xl">
            LUJO SILENCIOSO. POLOS MEDIO CIERRE, ALGODÓN PERCHADO Y CORTES LIMPIOS CON BORDADO MONOGRAM.
          </p>
          <div className="pt-3">
            <Link
              href="/catalog?category=old-money"
              className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 text-[11px] font-mono font-extrabold tracking-[0.2em] uppercase px-8 py-4 border border-white transition-all duration-300 shadow-2xl group/btn"
              style={{ borderRadius: '0px' }}
            >
              <span>EXPLORAR OLD MONEY</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 3D INTERACTIVE DIVIDER 3 (OLD MONEY → SPORTS) ── */}
      <Canvas3DDivider
        label="PERFORMANCE DIVISION · TRACKSUITS"
        tag="03 // OLD MONEY → DEPORTIVO"
        accentColor="#38bdf8"
      />

      {/* ── 4. DEPORTIVO / SPORTS SHOWCASE ── */}
      <section className="relative w-full h-[580px] sm:h-[680px] lg:h-[750px] overflow-hidden group flex flex-col justify-between border-b border-white/10">
        <Image
          src="/img/hero/Sants Hero Sport.jpeg"
          alt="SANT CLOTHES — Línea Sports"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out hidden sm:block"
        />
        <Image
          src="/img/hero/Hero Movil Sport.jpeg"
          alt="SANT CLOTHES — Línea Sports Móvil"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out sm:hidden"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.25em] text-white bg-black/85 backdrop-blur-md px-4 py-2 uppercase border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>SANT CLOTHES · SPORT DIVISION</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 p-6 sm:p-12 lg:p-16 space-y-4 max-w-4xl text-white"
        >
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-[family-name:var(--font-bebas)] tracking-wider uppercase leading-none text-white drop-shadow-lg">
            DEPORTIVO — PERFORMANCE & TRACKSUITS
          </h2>
          <p className="text-xs sm:text-sm font-mono tracking-wide uppercase text-zinc-300 leading-relaxed max-w-xl">
            PRENDAS TÉCNICAS Y CONJUNTOS SUEDE DIVISION. ALTA MOVILIDAD Y DISEÑO DEPORTIVO DE VANGUARDIA.
          </p>
          <div className="pt-3">
            <Link
              href="/catalog?category=sports"
              className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 text-[11px] font-mono font-extrabold tracking-[0.2em] uppercase px-8 py-4 border border-white transition-all duration-300 shadow-2xl group/btn"
              style={{ borderRadius: '0px' }}
            >
              <span>EXPLORAR DEPORTIVO</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
