'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function BrandManifestoModal() {
  return (
    <Dialog.Root>
      {/* Discreet Trigger Button */}
      <Dialog.Trigger className="group inline-flex items-center gap-2 px-6 py-3 border border-[#000000] bg-white text-black text-[12px] font-bold tracking-[0.05em] uppercase hover:bg-black hover:text-white transition-colors cursor-pointer" style={{ borderRadius: '0px' }}>
        <span>CONOCE NUESTRO MANIFIESTO (+)</span>
        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Backdrop className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs transition-opacity" />

        {/* Modal Content */}
        <Dialog.Popup
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl bg-white border border-[#000000] p-6 sm:p-8 z-50 focus:outline-none shadow-none"
          style={{ borderRadius: '0px' }}
        >
          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#767676] uppercase block">
                SANTS ATELIER PARAGUAY
              </span>
              <Dialog.Title className="text-xl sm:text-2xl font-bold uppercase tracking-[0.03em] text-black">
                PRENDAS PENSADAS PARA DURAR
              </Dialog.Title>
            </div>
            <Dialog.Close className="p-2 border border-[#e5e5e5] hover:border-black text-black hover:bg-black hover:text-white transition-colors cursor-pointer" style={{ borderRadius: '0px' }}>
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="space-y-4 text-[12px] uppercase tracking-[0.03em] text-[#767676] leading-relaxed mb-6">
            <span className="text-black font-semibold block">
              EN SANTS CLOTHES CREEMOS EN LA FUERZA DE LO SIMPLE. ELIMINAMOS ADORNOS INNECESARIOS PARA ENFOCAR TODA LA ATENCIÓN EN SILUETAS, VOLUMEN Y TEXTURA DE MATERIAS PRIMAS HEAVYWEIGHT.
            </span>
            <span className="block">
              NUESTROS DISEÑOS HABITAN EN EL EQUILIBRIO ENTRE LA COMODIDAD COTIDIANA Y LA SOFISTICACIÓN CONTEMPORÁNEA. ROPA VERSÁTIL CON IDENTIDAD PROPIA FABRICADA EN PARAGUAY.
            </span>
          </Dialog.Description>

          {/* Pillars Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-[#f6f6f6] border border-[#e5e5e5] text-center" style={{ borderRadius: '0px' }}>
              <span className="text-[11px] font-mono font-bold uppercase text-black block">240G - 400G</span>
              <span className="text-[10px] uppercase text-[#767676]">HEAVY COTTON</span>
            </div>
            <div className="p-3 bg-[#f6f6f6] border border-[#e5e5e5] text-center" style={{ borderRadius: '0px' }}>
              <span className="text-[11px] font-mono font-bold uppercase text-black block">BOXY FIT</span>
              <span className="text-[10px] uppercase text-[#767676]">CORTE ATELIER</span>
            </div>
            <div className="p-3 bg-[#f6f6f6] border border-[#e5e5e5] text-center" style={{ borderRadius: '0px' }}>
              <span className="text-[11px] font-mono font-bold uppercase text-black block">0PX GEOMETRY</span>
              <span className="text-[10px] uppercase text-[#767676]">DISEÑO PLANO</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#e5e5e5]">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 bg-black text-white text-[12px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-[#333333] transition-colors"
              style={{ borderRadius: '0px' }}
            >
              <span>EXPLORAR CATÁLOGO</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <Dialog.Close className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#767676] hover:text-black cursor-pointer">
              CERRAR
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
