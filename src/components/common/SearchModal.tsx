'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Search, X } from 'lucide-react';
import { fetchCatalog } from '@/lib/services/catalog';
import { selectFeaturedWithFallback } from '@/lib/catalog/featured';
import type { CatalogProduct } from '@/types/api';
import { formatCurrency } from '@/utils/format';
import SegmentOutline from './SegmentOutline';
import { CARD_CUT, EASE, GLASS_PANEL, PANEL_BACKDROP } from './headerStyles';
import { buildNavItems, titleCase } from './navMenus';
import { NAV_CATEGORIES, type NavCategory } from './navData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  navCategories?: NavCategory[];
  
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
}

const FALLBACK_PRODUCT_IMAGE = '/img/web/hero/IMG_4390.webp';

const MAX_TYPE_SUGGESTIONS = 5;

const CATALOG_TTL_MS = 5 * 60_000;
let catalogPromise: Promise<CatalogProduct[]> | null = null;
let catalogLoadedAt = 0;
const loadCatalog = () => {
  if (catalogPromise && Date.now() - catalogLoadedAt > CATALOG_TTL_MS) catalogPromise = null; 
  if (!catalogPromise) {
    catalogLoadedAt = Date.now();
    catalogPromise = fetchCatalog().catch(() => {
      catalogPromise = null; 
      return [];
    });
  }
  return catalogPromise;
};

const normalize = (v: string | null | undefined) =>
  (v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/-/g, ' ');

const typeLabel = (name: string) => titleCase(name.replace(/-/g, ' '));

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group/chip relative isolate inline-flex h-8 items-center gap-1.5 px-3.5 text-[13px] font-medium sm:h-9 sm:gap-2 sm:px-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        active ? 'text-[#17191c]' : 'text-white/90 hover:text-white'
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-0 -z-10 -skew-x-[18deg] rounded-[3px] border-[1.5px] transition-colors duration-150 ${
          active ? 'border-[#f6f8f9] bg-[#f6f8f9]' : 'border-[#d0d1d2]/55 group-hover/chip:border-[#d0d1d2] group-hover/chip:bg-white/[0.08]'
        }`}
      />
      {children}
    </button>
  );
}

export default function SearchModal({ isOpen, onClose, navCategories = NAV_CATEGORIES, returnFocusRef }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    loadCatalog().then((list) => {
      if (!active) return;
      setProducts(list);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 100);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        returnFocusRef?.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, returnFocusRef]);

const styleSuggestions = useMemo(
    () => buildNavItems(navCategories).find((i) => i.id === 'catalogo')?.menu?.filter((l) => l.styleId) ?? [],
    [navCategories],
  );

const typeSuggestions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) if (p.categoryName) counts.set(p.categoryName, (counts.get(p.categoryName) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, MAX_TYPE_SUGGESTIONS);
  }, [products]);

  if (!isOpen) return null;

  const trimmedQuery = normalize(query.trim());
  const filteredProducts = trimmedQuery
    ? products.filter((p) =>
        [p.title, p.categoryName, p.category, p.description, p.color, ...p.styles].some((field) =>
          normalize(field).includes(trimmedQuery)
        )
      )
    : [];
  const featuredProducts = selectFeaturedWithFallback(products, 4);
  const shown = trimmedQuery ? filteredProducts : featuredProducts;

  const pick = (value: string) => {

    setQuery((current) => (normalize(current.trim()) === normalize(value) ? '' : value));
    inputRef.current?.focus();
  };
  const isPicked = (value: string) => trimmedQuery === normalize(value);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <>
      <motion.div
        aria-hidden
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className={`${PANEL_BACKDROP} z-[45]`}
      />

<motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar productos"
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        style={{ transformOrigin: 'top center' }}
        className={`fixed inset-x-2 top-16 z-[45] mx-auto max-h-[calc(100dvh-76px)] max-w-[480px] overflow-y-auto overscroll-contain sm:inset-x-4 sm:top-[72px] sm:max-w-[640px] lg:max-w-[896px] ${GLASS_PANEL}`}
      >
        
        <div className="flex items-stretch p-2 [--s:15.6px] sm:[--s:18.2px]">
          <div className="relative flex h-12 min-w-0 flex-1 items-stretch sm:h-14">
            <SegmentOutline kind="start" />
            <label className="flex min-w-0 flex-1 items-center gap-3 pl-4 pr-2">
              <Search aria-hidden className="h-5 w-5 shrink-0 stroke-[1.75] text-white/80" />
              <span className="sr-only">Buscar productos</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscá remeras, hoodies…"
                className="min-w-0 flex-1 bg-transparent text-[16px] font-medium text-white placeholder:text-white/45 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                  className="shrink-0 rounded px-2 py-1 text-[12px] font-medium text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                >
                  Borrar
                </button>
              )}
            </label>
            <span aria-hidden className="block w-[15.6px] shrink-0 sm:w-[18.2px]" />
          </div>
          <div className="relative -ml-[8px] flex h-12 shrink-0 items-stretch sm:-ml-[10px] sm:h-14">
            <SegmentOutline kind="end" />
            <span aria-hidden className="block w-[15.6px] shrink-0 sm:w-[18.2px]" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar buscador"
              className="flex w-11 items-center justify-center pr-1 text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
            >
              <X aria-hidden className="h-5 w-5 stroke-[1.75]" />
            </button>
          </div>
        </div>

<div className="space-y-3 px-4 pb-4 pt-2 sm:pt-3">
          {styleSuggestions.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-medium text-white/55">Estilos</p>
              <div className="flex flex-wrap gap-1.5 pl-1.5 sm:gap-2">
                {styleSuggestions.map((s) => (
                  <Chip key={s.href} active={isPicked(s.label)} onClick={() => pick(s.label)}>
                    <s.icon aria-hidden className="h-4 w-4 shrink-0" />
                    {s.label}
                  </Chip>
                ))}
              </div>
            </div>
          )}
          {typeSuggestions.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-medium text-white/55">Tipos de prenda</p>
              <div className="flex flex-wrap gap-1.5 pl-1.5 sm:gap-2">
                {typeSuggestions.map(([name, count]) => (
                  <Chip key={name} active={isPicked(name)} onClick={() => pick(typeLabel(name))}>
                    {typeLabel(name)}
                    <span className={`tabular-nums ${isPicked(name) ? 'text-[#17191c]/55' : 'text-white/45'}`}>{count}</span>
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>

<div className="border-t border-white/10 px-4 pb-5 pt-4">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="min-w-0 truncate text-[15px] font-medium text-white">
              {trimmedQuery ? <>Resultados para “{query.trim()}”</> : 'Destacados'}
            </h2>
            {trimmedQuery && loaded && (
              <span role="status" className="shrink-0 text-[12px] text-white/55">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </span>
            )}
          </div>

          {!loaded ? (
            <div role="status" aria-label="Cargando catálogo" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[4/5] animate-pulse rounded-md bg-white/10 motion-reduce:animate-none" style={{ clipPath: CARD_CUT }} />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
                </div>
              ))}
            </div>
          ) : trimmedQuery && filteredProducts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[15px] font-medium text-white">No hay productos para “{query.trim()}”.</p>
              <p className="mt-1 text-[13px] text-white/60">Probá con otro nombre, un estilo o un tipo de prenda.</p>
              <Link
                href="/catalog"
                onClick={onClose}
                className="group/all mt-5 inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-[#d0d1d2] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Ver todo el catálogo
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover/all:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
              {shown.map((product) => {
                const imageSrc =
                  imageErrors[product.productId] || !product.images?.[0]?.url
                    ? FALLBACK_PRODUCT_IMAGE
                    : product.images[0].url;
                const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price;
                return (
                  <li key={product.productId}>
                    <Link
                      href={`/products/${product.productId}`}
                      onClick={onClose}
                      className="group/card block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-white/5" style={{ clipPath: CARD_CUT }}>
                        <Image
                          src={imageSrc}
                          alt={product.title}
                          fill
                          sizes="(min-width: 1024px) 210px, (min-width: 640px) 200px, 45vw"
                          quality={80}
                          onError={() => handleImageError(product.productId)}
                          className="object-cover object-center transition-transform duration-500 group-hover/card:scale-[1.04] motion-reduce:transition-none"
                        />
                      </div>
                      <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/55">{product.categoryName}</p>
                      <p className="mt-0.5 line-clamp-2 text-[14px] font-medium leading-snug text-white">{product.title}</p>
                      <p className="mt-1 flex items-baseline gap-2 text-[13px] tabular-nums">
                        <span className="font-semibold text-white">{formatCurrency(product.discountPrice ?? product.price)}</span>
                        {hasDiscount && <span className="text-white/45 line-through">{formatCurrency(product.price)}</span>}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </>
  );
}
