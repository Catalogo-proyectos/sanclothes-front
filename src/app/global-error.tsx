'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('SANT CLOTHES — Global Error:', error);
  }, [error]);

  return (
    <html lang="es">
      <body className="fixed inset-0 z-50 bg-white text-[#17191c] flex flex-col justify-between p-6 sm:p-12 text-center select-none overflow-y-auto font-sans antialiased">
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
            <h1 className="text-4xl sm:text-6xl uppercase tracking-[0.1em] text-[#17191c] leading-none font-black">
              ERROR EN EL SISTEMA
            </h1>
            <p className="text-xs sm:text-sm font-mono text-[#50524a] uppercase tracking-[0.18em] leading-relaxed max-w-md mx-auto">
              Ocurrió una incidencia inesperada. Hacé click abajo para reiniciar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-[#17191c] hover:bg-[#50524a] text-white text-[11px] font-mono font-bold tracking-[0.18em] uppercase px-8 py-4 border border-[#17191c] transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>REINICIAR EXPERIENCIA</span>
          </button>
        </div>

        <div className="w-full text-center text-xs text-[#50524a] font-medium tracking-wide pt-4 border-t border-[#b6b2a7]/20">
          <span>© 2026 Todos los derechos reservados. · Desarrollado por VectraPY</span>
        </div>
      </body>
    </html>
  );
}
