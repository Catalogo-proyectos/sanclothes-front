'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RefreshCw, Home, MessageCircle, ArrowUpRight } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('SANT CLOTHES — Error:', error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-50 bg-white text-[#17191c] flex flex-col justify-between p-6 sm:p-12 text-center select-none overflow-y-auto">
      <div className="my-auto space-y-6 max-w-xl mx-auto flex flex-col items-center py-12">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 aspect-square">
          <Image
            src="/img/logo/logo-iso-negro.png"
            alt="SANT CLOTHES®"
            fill
            priority
            className="object-contain"
          />
        </div>

        <div className="space-y-3">
          <h1 className="font-[family-name:var(--font-bebas)] text-4xl sm:text-6xl lg:text-7xl uppercase tracking-[0.1em] text-[#17191c] leading-none">
            OCURRIÓ UN ERROR INESPERADO
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[#50524a] uppercase tracking-[0.18em] leading-relaxed max-w-md mx-auto">
            Se ha producido una interrupción en el sistema. Hacé click abajo para reintentar o volver al inicio.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-lg">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#17191c] hover:bg-[#50524a] text-white text-[11px] font-mono font-bold tracking-[0.18em] uppercase px-6 py-3.5 border border-[#17191c] transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>REINTENTAR AHORA</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f6f8f9] hover:bg-[#17191c] hover:text-white text-[#17191c] text-[11px] font-mono font-bold tracking-[0.18em] uppercase px-6 py-3.5 border border-[#b6b2a7]/60 transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>VOLVER AL INICIO</span>
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
            <span>SOPORTE CASA MATRIZ (+595 983 950945)</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
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
