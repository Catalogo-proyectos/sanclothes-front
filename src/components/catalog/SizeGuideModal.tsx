'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Ruler, X } from 'lucide-react';
import { fetchSizeGuide } from '@/lib/services/catalog';

interface SizeGuideModalProps {
  activeSize: string;
  category?: string;
  onClose: () => void;
}

const FALLBACK_CHART = [
  { size: 'XS', chest: 98, length: 68, shoulder: 48 },
  { size: 'S', chest: 104, length: 70, shoulder: 50 },
  { size: 'M', chest: 110, length: 72, shoulder: 52 },
  { size: 'L', chest: 116, length: 74, shoulder: 54 },
  { size: 'XL', chest: 122, length: 76, shoulder: 56 },
] as const;

export default function SizeGuideModal({ activeSize, category, onClose }: SizeGuideModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const titleId = useId();

  // §4: fetch from /api/v1/catalog/size-guide/:category (never 404)
  const [apiChart, setApiChart] = useState<Record<string, Record<string, string>> | null>(null);

  useEffect(() => {
    if (!category) return;
    fetchSizeGuide(category).then((data) => {
      if (data.chart && Object.keys(data.chart).length > 0) {
        setApiChart(data.chart);
      }
    }).catch(() => { /* fallback to hardcoded */ });
  }, [category]);

  useEffect(() => {
    const { body } = document;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }, []);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    closeButtonRef.current?.focus();
    return () => {
      (previouslyFocused.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Derive columns and rows from API chart or fallback
  const apiSizes = apiChart ? Object.keys(apiChart) : [];
  const apiColumns = apiChart && apiSizes.length > 0
    ? Object.keys(apiChart[apiSizes[0]])
    : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-zinc-200 shadow-2xl relative"
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Cerrar guía de tallaje"
          className="absolute top-3 right-3 p-2 text-zinc-500 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Ruler className="w-5 h-5 text-black shrink-0" aria-hidden="true" />
          <h2 id={titleId} className="text-base sm:text-lg font-black uppercase tracking-wider pr-8">
            Guía de Tallaje (Centímetros)
          </h2>
        </div>

        <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
          Nuestras prendas poseen un calce oversize atelier contemporáneo. Te recomendamos tu talle
          habitual para calce holgado o un talle menos para calce al cuerpo.
        </p>

        <div className="overflow-x-auto">
          {apiChart && apiSizes.length > 0 ? (
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Medidas en centímetros por talle</caption>
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-bold uppercase tracking-wider">
                  <th scope="col" className="py-2.5 px-3">Talle</th>
                  {apiColumns.map((col) => (
                    <th key={col} scope="col" className="py-2.5 px-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono">
                {apiSizes.map((size) => {
                  const isActive = activeSize === size;
                  return (
                    <tr key={size} className={isActive ? 'bg-zinc-100 font-bold' : ''}>
                      <th scope="row" className="py-2.5 px-3 font-sans font-bold text-left">
                        {size}
                        {isActive && <span className="sr-only"> (talle seleccionado)</span>}
                      </th>
                      {apiColumns.map((col) => (
                        <td key={col} className="py-2.5 px-3">{apiChart[size][col]}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Medidas en centímetros por talle</caption>
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-bold uppercase tracking-wider">
                  <th scope="col" className="py-2.5 px-3">Talle</th>
                  <th scope="col" className="py-2.5 px-3">Pecho</th>
                  <th scope="col" className="py-2.5 px-3">Largo</th>
                  <th scope="col" className="py-2.5 px-3">Hombro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono">
                {FALLBACK_CHART.map((row) => {
                  const isActive = activeSize === row.size;
                  return (
                    <tr key={row.size} className={isActive ? 'bg-zinc-100 font-bold' : ''}>
                      <th scope="row" className="py-2.5 px-3 font-sans font-bold text-left">
                        {row.size}
                        {isActive && <span className="sr-only"> (talle seleccionado)</span>}
                      </th>
                      <td className="py-2.5 px-3">{row.chest} cm</td>
                      <td className="py-2.5 px-3">{row.length} cm</td>
                      <td className="py-2.5 px-3">{row.shoulder} cm</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#17191c] text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
        >
          Cerrar Guía
        </button>
      </div>
    </div>
  );
}
