'use client';

import { useEffect, useRef, useState } from 'react';
import { Package, ShieldCheck, CreditCard, Headphones } from 'lucide-react';

/** Fallback reveal height used until the footer has been measured (avoids layout shift on first paint). */
const FALLBACK_REVEAL_HEIGHT = 520;

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  /** Real border-box height of the footer. Drives the reveal zone so it always matches the footer. */
  const [revealHeight, setRevealHeight] = useState<number>(FALLBACK_REVEAL_HEIGHT);

  // The footer's height is viewport-dependent (23.5vw watermark, value props that rewrap on mobile),
  // so it has to be measured instead of hardcoded — otherwise the reveal zone is either too short
  // (part of the footer stays trapped behind the page) or too tall (an empty band below it).
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const measure = () => setRevealHeight(footer.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const valueProps = [
    {
      num: '01',
      icon: Package,
      title: 'ENVÍOS A TODO EL PAÍS',
      description: 'Entrega rápida a Asunción e Interior',
    },
    {
      num: '02',
      icon: ShieldCheck,
      title: 'PRODUCTOS AUTÉNTICOS',
      description: 'Calidad Atelier & 100% Algodón',
    },
    {
      num: '03',
      icon: CreditCard,
      title: 'PAGOS SEGUROS EN PY',
      description: 'SIPAP Transfer, PagoQR & Tarjetas',
    },
    {
      num: '04',
      icon: Headphones,
      title: 'ATENCIÓN PERSONALIZADA',
      description: 'Soporte vía WhatsApp & Direct',
    },
  ];

  return (
    /* Reveal zone: an in-flow block at the end of the document, exactly as tall as the footer.
       It replaces the old hardcoded margin-bottom on <main> — and its `clip-path` clips the fixed
       footer to this box. `clip-path` clips fixed descendants without becoming their containing
       block, so the footer still pins to the viewport bottom (the reveal), yet it is physically
       incapable of painting outside the reveal zone. That makes the effect scroll-synchronous by
       construction: no scroll listener, no direction tracking, and nothing that can lag behind and
       overlap the page content. */
    <div className="w-full" style={{ height: revealHeight, clipPath: 'inset(0)' }}>
      <footer
        ref={footerRef}
        className="fixed bottom-0 left-0 right-0 z-0 bg-[#f6f8f9] select-none border-t border-[#b6b2a7]/40 w-full overflow-hidden"
      >
        {/* 1. Value Propositions Grid - Flush against top footer line with full-width edge-to-edge bottom line */}
        <div className="w-full border-b border-[#b6b2a7]/40 py-8 px-6 sm:px-12 bg-[#f6f8f9]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {valueProps.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.num} className="flex items-center gap-4 py-2 group cursor-default">
                    <div
                      className="p-3 bg-zinc-100 border border-zinc-200 group-hover:border-[#17191c] group-hover:scale-105 transition-all duration-300 shrink-0"
                      style={{ borderRadius: '0px' }}
                    >
                      <Icon className="w-5 h-5 text-[#17191c]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-[#17191c] mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#50524a] font-medium tracking-wide uppercase">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Giant Watermark Typography "SANTS CLOTHES" */}
        <div className="w-full text-center pointer-events-none select-none py-6 overflow-hidden relative">
          <h2 className="font-[family-name:var(--font-bebas)] text-[23.5vw] leading-none tracking-tighter whitespace-nowrap text-[#17191c] opacity-[0.06] transition-opacity duration-500 hover:opacity-[0.12]">
            SANTS CLOTHES
          </h2>
        </div>
      </footer>
    </div>
  );
}
