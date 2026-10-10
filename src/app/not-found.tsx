import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Compass, MessageCircle, ArrowUpRight, Camera } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[100] bg-white text-[#17191c] flex flex-col justify-between p-6 sm:p-12 text-center select-none overflow-y-auto">
      <div className="my-auto space-y-6 max-w-xl mx-auto flex flex-col items-center py-12">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 aspect-square">
          <Image
            src="/img/web/logo/logo-iso-negro.webp"
            alt="SANT CLOTHES®"
            fill
            priority
            className="object-contain"
          />
        </div>

        <div className="space-y-3">
          <h1 className="font-[family-name:var(--font-bebas)] text-4xl sm:text-6xl lg:text-7xl uppercase tracking-[0.1em] text-[#17191c] leading-none">
            PÁGINA NO ENCONTRADA
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[#50524a] uppercase tracking-[0.18em] leading-relaxed max-w-md mx-auto">
            La prenda, sección o enlace que estás buscando no existe o fue retirada del catálogo oficial.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#17191c] hover:bg-[#50524a] text-white text-[11px] font-mono font-bold tracking-[0.18em] uppercase px-6 py-3.5 border border-[#17191c] transition-all shadow-sm group"
          >
            <Home className="w-4 h-4" />
            <span>VOLVER AL INICIO</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <Link
            href="/catalog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f6f8f9] hover:bg-[#17191c] hover:text-white text-[#17191c] text-[11px] font-mono font-bold tracking-[0.18em] uppercase px-6 py-3.5 border border-[#b6b2a7]/60 transition-all shadow-sm group"
          >
            <Compass className="w-4 h-4" />
            <span>EXPLORAR CATÁLOGO</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-[#50524a] uppercase tracking-wider">
          <a
            href="https://wa.me/595983950945"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-[#17191c] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WHATSAPP CASA MATRIZ (+595 983 950945)</span>
          </a>
          <span className="text-zinc-300">·</span>
          <a
            href="https://www.instagram.com/santclothespy/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-[#17191c] transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>INSTAGRAM</span>
          </a>
        </div>
      </div>

      <div className="w-full text-center text-xs text-[#50524a] font-medium tracking-wide pt-4 border-t border-[#b6b2a7]/20">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <span>© 2026 Todos los derechos reservados.</span>
          <span className="hidden sm:inline">·</span>
          <span>
            Desarrollado por{' '}
            <a
              href="https://www.instagram.com/vectrapy/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#17191c] hover:underline transition-all cursor-pointer"
            >
              VectraPY
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
