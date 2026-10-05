'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import type { CatalogProduct } from '@/types/api';
import type { CatalogTaxonomy } from '@/lib/services/taxonomy';
import { findStyle } from '@/lib/services/taxonomy';
import { useCatalogFilter } from '@/hooks/useCatalogFilter';
import { filterByStyle, isStyleId } from '@/lib/catalogFilters';
import { buildSections } from '@/lib/catalog/sections';
import {
  PAGE_SIZE,
  applyFilters,
  availableSizes,
  filterByStyleCode,
  hasActiveFilters,
  parseCatalogQuery,
  sortProducts,
} from '@/lib/catalog/query';
import CatalogFilters, { type FilterTypeOption } from './CatalogFilters';
import CatalogSections from './CatalogSections';
import ProductCard from './ProductCard';

interface CatalogViewProps {
  initialProducts: CatalogProduct[];
  taxonomy: CatalogTaxonomy;
}

// Backend anterior al catálogo v2 (sin `styles`): el filtro por estilo de antes.
const legacyStyleFilter = (products: CatalogProduct[], style: string) =>
  isStyleId(style) ? filterByStyle(products, style) : [];

/**
 * Catálogo v2. Sin filtros → secciones por tipo de prenda con sus bentos.
 * Con cualquier filtro (tipo, talle, género, precio, stock u orden) → grilla
 * simple sin bentos, de a PAGE_SIZE con "Cargar más".
 */
export default function CatalogView({ initialProducts, taxonomy }: CatalogViewProps) {
  const searchParams = useSearchParams();
  const query = useMemo(() => parseCatalogQuery(searchParams), [searchParams]);
  const reduceMotion = useReducedMotion();
  const setStyle = useCatalogFilter((s) => s.setStyle);

  // El header resalta el estilo activo.
  useEffect(() => {
    setStyle(query.style);
  }, [query.style, setStyle]);

  const style = findStyle(taxonomy, query.style);
  const styleProducts = useMemo(
    () => filterByStyleCode(initialProducts, query.style, legacyStyleFilter),
    [initialProducts, query.style]
  );

  const categoryOrder = useMemo(
    () => taxonomy.categories.map((c) => ({ code: c.code, name: c.name, sortOrder: c.sortOrder })),
    [taxonomy.categories]
  );

  // Chips de tipo: los que tienen productos en este estilo, en el orden del admin.
  const types: FilterTypeOption[] = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const p of styleProducts) {
      const entry = counts.get(p.category) ?? { name: p.categoryName, count: 0 };
      entry.count += 1;
      counts.set(p.category, entry);
    }
    const order = new Map(categoryOrder.map((c) => [c.code, c.sortOrder]));
    return [...counts.entries()]
      .sort(([a, ea], [b, eb]) => (order.get(a) ?? 1e9) - (order.get(b) ?? 1e9) || ea.name.localeCompare(eb.name, 'es'))
      .map(([code, { name, count }]) => ({ code, name, count }));
  }, [styleProducts, categoryOrder]);

  const filtering = hasActiveFilters(query);
  const filtered = useMemo(
    () => (filtering ? sortProducts(applyFilters(styleProducts, query), query.sort) : []),
    [filtering, styleProducts, query]
  );
  const sections = useMemo(
    () => (filtering ? [] : buildSections(styleProducts, categoryOrder)),
    [filtering, styleProducts, categoryOrder]
  );

  // La paginación queda atada a la URL: si cambian los filtros, vuelve a la página 1.
  const queryKey = searchParams.toString();
  const [paging, setPaging] = useState({ key: queryKey, pages: 1 });
  const pages = paging.key === queryKey ? paging.pages : 1;

  const visible = filtered.slice(0, pages * PAGE_SIZE);
  const heading = query.tipo
    ? (types.find((t) => t.code === query.tipo)?.name ?? query.tipo)
    : (style?.name ?? 'Catálogo completo');
  const count = filtering ? filtered.length : styleProducts.length;

  return (
    <section id="catalog-grid" className="bg-[#f6f8f9] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 sm:mb-8">
          <h2
            aria-live="polite"
            className="font-[family-name:var(--font-bebas)] text-3xl uppercase leading-none tracking-[0.08em] text-[#17191c] sm:text-4xl"
          >
            {heading}
            {query.tipo && style && <span className="text-[#17191c]/35"> · {style.name}</span>}
          </h2>
          <p className="font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-[#17191c]/40 sm:text-[11px]">
            {count} {count === 1 ? 'pieza' : 'piezas'}
          </p>
        </header>

        {styleProducts.length > 0 && (
          <CatalogFilters
            key={queryKey}
            query={query}
            types={types}
            sizes={availableSizes(styleProducts)}
            total={styleProducts.length}
          />
        )}

        {count === 0 ? (
          <div className="border border-dashed border-[#17191c]/15 px-6 py-20 text-center">
            <p className="font-[family-name:var(--font-bebas)] text-2xl uppercase tracking-[0.08em] text-[#17191c]">
              {styleProducts.length === 0 && style ? `Todavía no hay piezas en ${style.name}` : 'Nada con estos filtros todavía'}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#17191c]/45">
              <Link href="/catalog" className="underline underline-offset-4 hover:text-[#17191c]">
                Ver el catálogo completo
              </Link>
            </p>
          </div>
        ) : (
          <motion.div
            key={queryKey}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {filtering ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                  {visible.map((product) => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>
                {visible.length < filtered.length && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setPaging({ key: queryKey, pages: pages + 1 })}
                      className="border border-[#17191c] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#17191c] transition-colors hover:bg-[#17191c] hover:text-white sm:text-[11px]"
                    >
                      Cargar más ({filtered.length - visible.length})
                    </button>
                  </div>
                )}
              </>
            ) : (
              <CatalogSections sections={sections} style={query.style} />
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
