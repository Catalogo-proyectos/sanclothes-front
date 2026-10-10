'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, Check, X, RotateCcw } from 'lucide-react';
import { catalogHref, hasActiveFilters, type CatalogQuery, type GenderId, type SortId } from '@/lib/catalog/query';

export interface FilterTypeOption {
  code: string;
  name: string;
  count: number;
}

interface CatalogFiltersProps {
  query: CatalogQuery;
  types: FilterTypeOption[];
  sizes: string[];
  
  total: number;
}

const SORT_LABELS: Record<SortId, string> = {
  nuevos: 'Más nuevos',
  'precio-asc': 'Precio: menor a mayor',
  'precio-desc': 'Precio: mayor a menor',
};

const CONTROL_BASE =
  'h-9.5 border px-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c] sm:px-3.5 sm:text-[11px]';
const CONTROL_ACTIVE = 'border-[#17191c] bg-[#17191c] text-white shadow-sm';
const CONTROL_IDLE = 'border-[#17191c]/20 bg-white text-[#17191c]/70 hover:border-[#17191c]/50 hover:text-[#17191c]';

const toAmount = (v: string) => {
  const clean = v.trim();
  if (clean === '') return null;
  const num = Number(clean);
  return Number.isNaN(num) ? null : Math.max(0, Math.round(num));
};

export default function CatalogFilters({ query, types, sizes, total }: CatalogFiltersProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

const [open, setOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    if (!sortOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sortOpen]);

  const go = (next: Partial<CatalogQuery>) => {
    router.replace(catalogHref({ ...query, ...next }), { scroll: false });
  };

  const toggleSize = (size: string) => {
    go({
      sizes: query.sizes.includes(size)
        ? query.sizes.filter((s) => s !== size)
        : [...query.sizes, size],
    });
  };

  const clearAll = () => {
    go({
      tipo: null,
      sizes: [],
      gender: null,
      min: null,
      max: null,
      onlyAvailable: false,
      sort: 'nuevos',
    });
  };

  const extraFilters =
    query.sizes.length +
    (query.gender ? 1 : 0) +
    (query.min !== null || query.max !== null ? 1 : 0) +
    (query.onlyAvailable ? 1 : 0);

  return (
    <div className="mb-8 flex flex-col gap-3 sm:mb-12">
      
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">

<nav
          aria-label="Tipo de prenda"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            className={`group flex shrink-0 items-center gap-1.5 whitespace-nowrap ${CONTROL_BASE} ${
              query.tipo === null ? CONTROL_ACTIVE : CONTROL_IDLE
            }`}
            aria-pressed={query.tipo === null}
            onClick={() => go({ tipo: null })}
          >
            <span>Todo</span>
            <span
              className={`text-[9px] font-semibold tabular-nums sm:text-[10px] ${
                query.tipo === null ? 'text-white/70' : 'text-[#17191c]/45 group-hover:text-[#17191c]/70'
              }`}
            >
              ({total})
            </span>
          </button>
          {types.map((type) => {
            const isSelected = query.tipo === type.code;
            return (
              <button
                key={type.code}
                type="button"
                className={`group flex shrink-0 items-center gap-1.5 whitespace-nowrap ${CONTROL_BASE} ${
                  isSelected ? CONTROL_ACTIVE : CONTROL_IDLE
                }`}
                aria-pressed={isSelected}
                onClick={() => go({ tipo: isSelected ? null : type.code })}
              >
                <span>{type.name}</span>
                <span
                  className={`text-[9px] font-semibold tabular-nums sm:text-[10px] ${
                    isSelected ? 'text-white/70' : 'text-[#17191c]/45 group-hover:text-[#17191c]/70'
                  }`}
                >
                  ({type.count})
                </span>
              </button>
            );
          })}
        </nav>

<div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
          
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="catalog-filters-panel"
            className={`group relative flex w-full items-center justify-center gap-2 sm:w-auto ${CONTROL_BASE} ${
              open || extraFilters > 0 ? CONTROL_ACTIVE : CONTROL_IDLE
            }`}
          >
            <SlidersHorizontal
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                open ? 'rotate-90' : 'group-hover:scale-105'
              }`}
              aria-hidden
            />
            <span>Filtros</span>
            {extraFilters > 0 && (
              <span
                className={`ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center px-1 text-[9px] font-bold tabular-nums ${
                  open || extraFilters > 0
                    ? 'bg-white text-[#17191c]'
                    : 'bg-[#17191c] text-white'
                }`}
              >
                {extraFilters}
              </span>
            )}
          </button>

<div className="relative w-full sm:w-[235px]" ref={sortRef}>
            <button
              type="button"
              id="catalog-sort-button"
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              aria-label={`Ordenar catálogo: ${SORT_LABELS[query.sort]}`}
              onClick={() => setSortOpen((v) => !v)}
              className={`group flex w-full items-center justify-between ${CONTROL_BASE} ${
                sortOpen ? 'border-[#17191c] bg-white text-[#17191c] ring-1 ring-[#17191c]' : CONTROL_IDLE
              }`}
            >
              <div className="flex min-w-0 items-center gap-1.5 truncate">
                <span className="hidden font-normal text-[#17191c]/50 sm:inline">ORDEN:</span>
                <span className="truncate font-bold">{SORT_LABELS[query.sort]}</span>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-[#17191c]/60 transition-transform duration-200 group-hover:text-[#17191c] ${
                  sortOpen ? 'rotate-180 text-[#17191c]' : ''
                }`}
                aria-hidden
              />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4, scale: 0.98 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute left-0 right-0 top-full z-40 mt-1 w-full border border-[#17191c] bg-white p-1 shadow-[0_12px_32px_rgba(23,25,28,0.14)]"
                >
                  <ul role="listbox" aria-labelledby="catalog-sort-button" className="flex flex-col gap-0.5">
                    {(Object.keys(SORT_LABELS) as SortId[]).map((id) => {
                      const isSelected = query.sort === id;
                      return (
                        <li key={id} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            onClick={() => {
                              go({ sort: id });
                              setSortOpen(false);
                            }}
                            className={`flex w-full items-center justify-between px-2 py-2 text-left text-[9px] font-bold uppercase tracking-[0.10em] transition-colors xs:px-2.5 xs:text-[9.5px] sm:text-[10.5px] sm:tracking-[0.12em] ${
                              isSelected
                                ? 'bg-[#17191c] font-bold text-white'
                                : 'text-[#17191c]/80 hover:bg-[#17191c]/6 hover:text-[#17191c]'
                            }`}
                          >
                            <span className="truncate">{SORT_LABELS[id]}</span>
                            {isSelected && <Check className="ml-1 h-3 w-3 shrink-0 stroke-[2.5]" aria-hidden />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

<AnimatePresence>
        {hasActiveFilters(query) && (
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3 border-t border-[#17191c]/10 pt-2.5"
          >
            
            <div className="flex w-full sm:w-auto sm:flex-1 flex-wrap items-center gap-2 min-w-0">
              
              <div className="mr-0.5 flex shrink-0 select-none items-center gap-1.5 self-center">
                <span className="h-1.5 w-1.5 bg-[#17191c]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#17191c]/60 sm:text-[10px]">
                  Activos:
                </span>
              </div>

{query.tipo && (
                <button
                  type="button"
                  onClick={() => go({ tipo: null })}
                  className="group inline-flex items-center gap-2 border border-[#17191c] bg-[#17191c] px-2.5 py-1 text-white shadow-sm transition-all duration-150 hover:bg-neutral-800"
                >
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                    <span className="mr-1 text-white/50">Tipo:</span>
                    <span className="font-bold">{types.find((t) => t.code === query.tipo)?.name ?? query.tipo}</span>
                  </span>
                  <span className="flex h-3.5 w-3.5 items-center justify-center bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-[#17191c]">
                    <X className="h-2.5 w-2.5 stroke-[2.5]" aria-hidden />
                  </span>
                </button>
              )}

              {query.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className="group inline-flex items-center gap-2 border border-[#17191c] bg-[#17191c] px-2.5 py-1 text-white shadow-sm transition-all duration-150 hover:bg-neutral-800"
                >
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                    <span className="mr-1 text-white/50">Talle:</span>
                    <span className="font-bold">{s}</span>
                  </span>
                  <span className="flex h-3.5 w-3.5 items-center justify-center bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-[#17191c]">
                    <X className="h-2.5 w-2.5 stroke-[2.5]" aria-hidden />
                  </span>
                </button>
              ))}

              {query.gender && (
                <button
                  type="button"
                  onClick={() => go({ gender: null })}
                  className="group inline-flex items-center gap-2 border border-[#17191c] bg-[#17191c] px-2.5 py-1 text-white shadow-sm transition-all duration-150 hover:bg-neutral-800"
                >
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                    <span className="mr-1 text-white/50">Género:</span>
                    <span className="font-bold">{query.gender}</span>
                  </span>
                  <span className="flex h-3.5 w-3.5 items-center justify-center bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-[#17191c]">
                    <X className="h-2.5 w-2.5 stroke-[2.5]" aria-hidden />
                  </span>
                </button>
              )}

              {(query.min !== null || query.max !== null) && (
                <button
                  type="button"
                  onClick={() => go({ min: null, max: null })}
                  className="group inline-flex items-center gap-2 border border-[#17191c] bg-[#17191c] px-2.5 py-1 text-white shadow-sm transition-all duration-150 hover:bg-neutral-800"
                >
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                    <span className="mr-1 text-white/50">Precio:</span>
                    <span className="font-bold">
                      {query.min ? `${query.min.toLocaleString('es-PY')} Gs.` : '0'} –{' '}
                      {query.max ? `${query.max.toLocaleString('es-PY')} Gs.` : 'máx'}
                    </span>
                  </span>
                  <span className="flex h-3.5 w-3.5 items-center justify-center bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-[#17191c]">
                    <X className="h-2.5 w-2.5 stroke-[2.5]" aria-hidden />
                  </span>
                </button>
              )}

              {query.onlyAvailable && (
                <button
                  type="button"
                  onClick={() => go({ onlyAvailable: false })}
                  className="group inline-flex items-center gap-2 border border-[#17191c] bg-[#17191c] px-2.5 py-1 text-white shadow-sm transition-all duration-150 hover:bg-neutral-800"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                    Solo en stock
                  </span>
                  <span className="flex h-3.5 w-3.5 items-center justify-center bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-[#17191c]">
                    <X className="h-2.5 w-2.5 stroke-[2.5]" aria-hidden />
                  </span>
                </button>
              )}

              {query.sort !== 'nuevos' && (
                <button
                  type="button"
                  onClick={() => go({ sort: 'nuevos' })}
                  className="group inline-flex items-center gap-2 border border-[#17191c] bg-[#17191c] px-2.5 py-1 text-white shadow-sm transition-all duration-150 hover:bg-neutral-800"
                >
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em]">
                    <span className="mr-1 text-white/50">Orden:</span>
                    <span className="font-bold">{SORT_LABELS[query.sort]}</span>
                  </span>
                  <span className="flex h-3.5 w-3.5 items-center justify-center bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-[#17191c]">
                    <X className="h-2.5 w-2.5 stroke-[2.5]" aria-hidden />
                  </span>
                </button>
              )}
            </div>

<button
              type="button"
              onClick={clearAll}
              className="group inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 border border-[#17191c]/25 bg-white px-2.5 py-2 sm:py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#17191c] transition-all duration-150 hover:border-[#17191c] hover:bg-[#17191c] hover:text-white self-stretch sm:self-start"
            >
              <RotateCcw className="h-3 w-3 text-[#17191c]/60 transition-transform duration-300 group-hover:-rotate-90 group-hover:text-white" aria-hidden />
              <span className="font-semibold">Limpiar todo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

<AnimatePresence>
        {open && (
          <motion.div
            id="catalog-filters-panel"
            initial={reduceMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
            animate={reduceMotion ? { opacity: 1, height: 'auto' } : { opacity: 1, height: 'auto' }}
            exit={reduceMotion ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border border-[#17191c]/15 bg-white p-4 shadow-[0_8px_30px_rgba(23,25,28,0.03)] sm:p-6">
              
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#17191c]/10 pb-3.5 sm:mb-6 sm:pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 bg-[#17191c]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#17191c] sm:text-[11px]">
                    Filtros de Catálogo
                  </span>
                  {extraFilters > 0 && (
                    <span className="border border-[#17191c] bg-[#17191c]/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#17191c]">
                      {extraFilters} {extraFilters === 1 ? 'activo' : 'activos'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar panel de filtros"
                  className="flex h-7 w-7 items-center justify-center border border-[#17191c]/15 text-[#17191c]/60 transition-colors hover:border-[#17191c] hover:bg-[#17191c]/5 hover:text-[#17191c]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>

<div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                
                <fieldset>
                  <legend className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#17191c]/60 sm:mb-3">
                    Talle
                    {query.sizes.length > 0 && (
                      <span className="ml-1.5 font-bold text-[9px] text-[#17191c]">
                        ({query.sizes.length} selec.)
                      </span>
                    )}
                  </legend>
                  <div className="grid grid-cols-4 gap-1.5 xs:grid-cols-6 sm:flex sm:flex-wrap">
                    {sizes.length === 0 && (
                      <span className="col-span-full text-[10px] font-medium text-[#17191c]/40">Sin talles</span>
                    )}
                    {sizes.map((size) => {
                      const isSelected = query.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          className={`h-9 min-w-9 px-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-150 sm:px-2.5 sm:text-[11px] ${
                            isSelected
                              ? 'border border-[#17191c] bg-[#17191c] text-white shadow-sm'
                              : 'border border-[#17191c]/20 bg-white text-[#17191c]/80 hover:border-[#17191c] hover:bg-[#17191c]/5 hover:text-[#17191c]'
                          }`}
                          aria-pressed={isSelected}
                          onClick={() => toggleSize(size)}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

<fieldset>
                  <legend className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#17191c]/60 sm:mb-3">
                    Género
                  </legend>
                  <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap">
                    {([null, 'hombre', 'mujer'] as Array<GenderId | null>).map((g) => {
                      const isSelected = query.gender === g;
                      const label = g === null ? 'Todos' : g === 'hombre' ? 'Hombre' : 'Mujer';
                      return (
                        <button
                          key={g ?? 'todos'}
                          type="button"
                          className={`flex h-9 w-full items-center justify-center px-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-all duration-150 sm:w-auto sm:px-3.5 sm:text-[11px] ${
                            isSelected
                              ? 'border border-[#17191c] bg-[#17191c] text-white shadow-sm'
                              : 'border border-[#17191c]/20 bg-white text-[#17191c]/80 hover:border-[#17191c] hover:bg-[#17191c]/5 hover:text-[#17191c]'
                          }`}
                          aria-pressed={isSelected}
                          onClick={() => go({ gender: g })}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

<fieldset>
                  <legend className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#17191c]/60 sm:mb-3">
                    Precio (Gs.)
                  </legend>
                  <PriceRange
                    key={`${query.min ?? ''}-${query.max ?? ''}`}
                    min={query.min}
                    max={query.max}
                    onApply={(range) => go(range)}
                  />
                </fieldset>

<fieldset className="flex flex-col justify-start gap-4">
                  <div>
                    <legend className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#17191c]/60 sm:mb-3">
                      Disponibilidad
                    </legend>
                    <label className="group flex cursor-pointer select-none items-center gap-2.5 pt-1">
                      <span
                        className={`flex h-4.5 w-4.5 items-center justify-center border transition-all duration-150 ${
                          query.onlyAvailable
                            ? 'border-[#17191c] bg-[#17191c] text-white'
                            : 'border-[#17191c]/30 bg-white group-hover:border-[#17191c]'
                        }`}
                      >
                        {query.onlyAvailable && <Check className="h-3 w-3 stroke-[3]" aria-hidden />}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#17191c] group-hover:text-black sm:text-[11px]">
                        Solo disponibles
                      </span>
                      <input
                        type="checkbox"
                        checked={query.onlyAvailable}
                        onChange={(e) => go({ onlyAvailable: e.target.checked })}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PriceRange({
  min,
  max,
  onApply,
}: {
  min: number | null;
  max: number | null;
  onApply: (range: { min: number | null; max: number | null }) => void;
}) {
  const [from, setFrom] = useState(min?.toString() ?? '');
  const [to, setTo] = useState(max?.toString() ?? '');

  const apply = () => {
    const next = { min: toAmount(from), max: toAmount(to) };
    if (next.min !== min || next.max !== max) onApply(next);
  };

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider text-[#17191c]/40">
            Gs.
          </span>
          <input
            inputMode="numeric"
            aria-label="Precio mínimo"
            placeholder="Mín."
            value={from}
            onChange={(e) => setFrom(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={apply}
            className="h-9 w-full border border-[#17191c]/20 bg-white pl-8 pr-2 text-[11px] font-medium text-[#17191c] placeholder:text-[#17191c]/30 focus:border-[#17191c] focus:outline-none focus:ring-1 focus:ring-[#17191c]"
          />
        </div>
        <span className="text-xs font-medium text-[#17191c]/30">–</span>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider text-[#17191c]/40">
            Gs.
          </span>
          <input
            inputMode="numeric"
            aria-label="Precio máximo"
            placeholder="Máx."
            value={to}
            onChange={(e) => setTo(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={apply}
            className="h-9 w-full border border-[#17191c]/20 bg-white pl-8 pr-2 text-[11px] font-medium text-[#17191c] placeholder:text-[#17191c]/30 focus:border-[#17191c] focus:outline-none focus:ring-1 focus:ring-[#17191c]"
          />
        </div>
      </div>
      <button
        type="submit"
        className="self-end text-[9px] font-bold uppercase tracking-[0.16em] text-[#17191c]/60 transition-colors hover:text-[#17191c]"
      >
        Aplicar [↵]
      </button>
    </form>
  );
}
