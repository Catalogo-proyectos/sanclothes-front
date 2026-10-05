'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
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
  /** Total de productos del estilo (para el chip "Todo"). */
  total: number;
}

const chip = (active: boolean) =>
  `whitespace-nowrap border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors sm:text-[11px] ${
    active ? 'border-[#17191c] bg-[#17191c] text-white' : 'border-[#17191c]/15 text-[#17191c]/70 hover:border-[#17191c]/45 hover:text-[#17191c]'
  }`;

const SORT_LABELS: Record<SortId, string> = {
  nuevos: 'Más nuevos',
  'precio-asc': 'Precio: menor a mayor',
  'precio-desc': 'Precio: mayor a menor',
};

export default function CatalogFilters({ query, types, sizes, total }: CatalogFiltersProps) {
  const router = useRouter();
  // El panel queda abierto mientras se eligen filtros (cada filtro cambia la URL).
  const [open, setOpen] = useState(false);

  const go = (next: Partial<CatalogQuery>) => {
    router.replace(catalogHref({ ...query, ...next }), { scroll: false });
  };
  const toggleSize = (size: string) =>
    go({ sizes: query.sizes.includes(size) ? query.sizes.filter((s) => s !== size) : [...query.sizes, size] });
  const extraFilters =
    query.sizes.length + (query.gender ? 1 : 0) + (query.min !== null || query.max !== null ? 1 : 0) + (query.onlyAvailable ? 1 : 0);

  return (
    <div className="mb-10 flex flex-col gap-4 sm:mb-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Tipo de prenda" className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1">
          <button type="button" className={chip(query.tipo === null)} aria-pressed={query.tipo === null} onClick={() => go({ tipo: null })}>
            Todo ({total})
          </button>
          {types.map((type) => (
            <button
              key={type.code}
              type="button"
              className={chip(query.tipo === type.code)}
              aria-pressed={query.tipo === type.code}
              onClick={() => go({ tipo: query.tipo === type.code ? null : type.code })}
            >
              {type.name} ({type.count})
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="catalog-filters-panel"
            className={`${chip(open || extraFilters > 0)} flex items-center gap-2`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            Filtros{extraFilters > 0 ? ` (${extraFilters})` : ''}
          </button>
          <label className="sr-only" htmlFor="catalog-sort">Ordenar</label>
          <select
            id="catalog-sort"
            value={query.sort}
            onChange={(e) => go({ sort: e.target.value as SortId })}
            className="border border-[#17191c]/15 bg-transparent px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#17191c] focus:border-[#17191c] focus:outline-none sm:text-[11px]"
          >
            {(Object.keys(SORT_LABELS) as SortId[]).map((id) => (
              <option key={id} value={id}>
                {SORT_LABELS[id]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {open && (
        <div id="catalog-filters-panel" className="grid gap-6 border border-[#17191c]/10 bg-white/60 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <fieldset>
            <legend className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#17191c]/50">Talle</legend>
            <div className="flex flex-wrap gap-2">
              {sizes.length === 0 && <span className="font-mono text-[10px] text-[#17191c]/40">Sin talles</span>}
              {sizes.map((size) => (
                <button key={size} type="button" className={chip(query.sizes.includes(size))} aria-pressed={query.sizes.includes(size)} onClick={() => toggleSize(size)}>
                  {size}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#17191c]/50">Género</legend>
            <div className="flex flex-wrap gap-2">
              {([null, 'hombre', 'mujer'] as Array<GenderId | null>).map((g) => (
                <button key={g ?? 'todos'} type="button" className={chip(query.gender === g)} aria-pressed={query.gender === g} onClick={() => go({ gender: g })}>
                  {g === null ? 'Todos' : g === 'hombre' ? 'Hombre' : 'Mujer'}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#17191c]/50">Precio (Gs.)</legend>
            {/* Se remonta solo cuando el precio de la URL cambia (p. ej. "Limpiar filtros"). */}
            <PriceRange key={`${query.min ?? ''}-${query.max ?? ''}`} min={query.min} max={query.max} onApply={(range) => go(range)} />
          </fieldset>

          <fieldset className="flex flex-col justify-between gap-3">
            <legend className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#17191c]/50">Stock</legend>
            <label className="flex cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#17191c]">
              <input type="checkbox" checked={query.onlyAvailable} onChange={(e) => go({ onlyAvailable: e.target.checked })} className="h-4 w-4 accent-[#17191c]" />
              Solo disponibles
            </label>
            {hasActiveFilters(query) && (
              <button
                type="button"
                onClick={() => go({ tipo: null, sizes: [], gender: null, min: null, max: null, onlyAvailable: false, sort: 'nuevos' })}
                className="flex items-center gap-1.5 self-start font-mono text-[10px] uppercase tracking-[0.14em] text-[#17191c]/60 underline-offset-4 hover:text-[#17191c] hover:underline"
              >
                <X className="h-3 w-3" aria-hidden /> Limpiar filtros
              </button>
            )}
          </fieldset>
        </div>
      )}
    </div>
  );
}

const priceInput =
  'w-full border border-[#17191c]/15 bg-transparent px-3 py-2 font-mono text-[11px] text-[#17191c] focus:border-[#17191c] focus:outline-none';
const toAmount = (v: string) => (v.trim() === '' || Number.isNaN(Number(v)) ? null : Math.max(0, Math.round(Number(v))));

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
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <input
        inputMode="numeric"
        aria-label="Precio mínimo"
        placeholder="Mín."
        value={from}
        onChange={(e) => setFrom(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={apply}
        className={priceInput}
      />
      <span className="text-[#17191c]/40">–</span>
      <input
        inputMode="numeric"
        aria-label="Precio máximo"
        placeholder="Máx."
        value={to}
        onChange={(e) => setTo(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={apply}
        className={priceInput}
      />
    </form>
  );
}
