'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { CatalogProduct } from '@/types/api';
import { MOCK_PRODUCTS } from '@/mocks/catalog';
import { useCatalogFilter } from '@/hooks/useCatalogFilter';
import { filterByChip, filterByStyle, getChip, getStyle, isStyleId } from '@/lib/catalogFilters';
import ProductCard from './ProductCard';

/**
 * SANCLOTHES Catalog — Editorial Bands.
 * The catalog reads as a sequence of bands: one campaign image panel beside a 2×2
 * block of product cards. Each band flips the side the image sits on, so the eye
 * zig-zags down the page instead of scanning a flat 4-column grid.
 */

interface BandPanel {
  eyebrow: string;
  title: string;
  copy: string;
  cta: string;
  href: string;
  image: string;
  alt: string;
}

const BAND_PANELS: BandPanel[] = [
  {
    eyebrow: 'Colección camperas · Atelier drop',
    title: 'Camperas & chaquetas — Sant Atelier',
    copy: 'Confeccionadas con materiales pesados, texturas suede y bordados atelier. Siluetas relajadas y acabados de alta durabilidad.',
    cta: 'Ver colección camperas',
    href: '/catalog?category=camperas',
    image: '/img/hero/IMG_2996.webp',
    alt: 'Campera suede marrón de la colección Atelier',
  },
  {
    eyebrow: 'Fleece pesado · 400–450 g',
    title: 'Hoodies & buzos de gramaje alto',
    copy: 'Algodón perchado de 400 y 450 gramos, puños acanalados y caída estructurada que no se deforma con el uso.',
    cta: 'Ver hoodies',
    href: '/catalog?category=hoodies',
    image: '/img/secciones/rack-outfits-4.webp',
    alt: 'Rack de hoodies y buzos heavyweight',
  },
  {
    eyebrow: 'Conjuntos completos · Drop #01',
    title: 'Tracksuits en suede y algodón',
    copy: 'Sets de dos piezas pensados para usarse juntos o por separado. Cierre metálico bidireccional y bordado frontal Nova.',
    cta: 'Ver tracksuits',
    href: '/catalog?category=tracksuits',
    image: '/img/hero/IMG_4390.webp',
    alt: 'Conjunto tracksuit completo Le Sant Club',
  },
  {
    eyebrow: 'Jersey 240–280 g · Boxy fit',
    title: 'Remeras de base, tejidas para durar',
    copy: 'La capa que sostiene el resto del guardarropa. Cuello reforzado, hombro caído y lavados que envejecen sin perder color.',
    cta: 'Ver remeras',
    href: '/catalog?category=remeras',
    image: '/img/hero/IMG_3202.webp',
    alt: 'Remeras heavyweight de la colección base',
  },
  {
    eyebrow: 'Pantalones · Wide-leg & cargo',
    title: 'Bases anchas, caída limpia',
    copy: 'Denim carpenter, cargos tácticos y sweatpants de gramaje alto. Tiro medio y pierna amplia sin exceso de volumen.',
    cta: 'Ver pantalones',
    href: '/catalog?category=pantalones',
    image: '/img/hero/IMG_1460.webp',
    alt: 'Pantalones wide-leg y cargo de la colección',
  },
  {
    eyebrow: 'Archivo · Unidades limitadas',
    title: 'Piezas de archivo y últimas unidades',
    copy: 'Prendas de drops anteriores que no vuelven a producirse. Stock limitado por talle, sin reposición.',
    cta: 'Ver archivo',
    href: '/catalog?category=archivo',
    image: '/img/secciones/IMG_4279.webp',
    alt: 'Taller Sanclothes con moldes y piezas de archivo',
  },
];

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const cut = searchParams.get('cut');
  const category = searchParams.get('category');

  // Build request query
  const queryParams = new URLSearchParams();
  if (cut) queryParams.set('cut', cut);
  if (category) queryParams.set('category', category);

  const path = queryParams.toString() ? `/catalog?${queryParams.toString()}` : '/catalog';
  const { data: products, loading } = useFetch<CatalogProduct[]>('GET', path);

  // If backend returns fewer than 24 products, use full mock list so user gets complete view
  const displayedProducts = useMemo(() => {
    if (products && products.length >= 24) return products;
    return MOCK_PRODUCTS;
  }, [products]);

  // The header chip rail is the live filter: it never navigates, so the grid
  // recomputes from the same fetched list instead of refetching per selection.
  const chip = useCatalogFilter((s) => s.chip);
  const setStyle = useCatalogFilter((s) => s.setStyle);
  const reduceMotion = useReducedMotion();
  const activeChip = getChip(chip);

  // `?category=` is the header nav's selection. The grid still filters locally
  // because the mock fallback below can replace the backend's (already filtered)
  // response with the full list — without this the style link would be a no-op.
  const activeStyle = isStyleId(category) ? getStyle(category) : null;

  // Mirror it into the store so the header can underline the active nav link.
  useEffect(() => {
    setStyle(category);
  }, [category, setStyle]);

  const visibleProducts = useMemo(
    () => filterByStyle(filterByChip(displayedProducts, chip), activeStyle?.id ?? null),
    [displayedProducts, chip, activeStyle],
  );

  const bands = useMemo(() => chunk(visibleProducts, 4), [visibleProducts]);

  if (loading) {
    return (
      <section id="catalog-grid" className="bg-[#f6f8f9] py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 flex flex-col gap-16">
          {Array.from({ length: 2 }, (_, b) => (
            <div key={b} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-zinc-200 animate-pulse min-h-[420px] lg:min-h-[640px]" />
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="bg-zinc-200 aspect-[3/4] animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="catalog-grid" className="bg-[#f6f8f9] py-12 sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* ── What the rail is currently showing ── */}
        <header className="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-[#17191c]/10 pb-4 sm:mb-14">
          <h2
            aria-live="polite"
            className="font-[family-name:var(--font-bebas)] text-3xl uppercase leading-none tracking-[0.08em] text-[#17191c] sm:text-4xl"
          >
            {activeStyle ? activeStyle.label : activeChip.label}
            {activeStyle && chip !== 'todo' && (
              <span className="text-[#17191c]/35"> · {activeChip.label}</span>
            )}
          </h2>
          <p className="font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-[#17191c]/40 sm:text-[11px]">
            {visibleProducts.length} {visibleProducts.length === 1 ? 'pieza' : 'piezas'} · {activeStyle ? activeStyle.caption : activeChip.caption}
          </p>
        </header>

        {visibleProducts.length === 0 ? (
          <div className="border border-dashed border-[#17191c]/15 px-6 py-20 text-center">
            <p className="font-[family-name:var(--font-bebas)] text-2xl uppercase tracking-[0.08em] text-[#17191c]">
              {activeStyle ? `Todavía no hay piezas en ${activeStyle.label}` : 'Nada bajo este filtro todavía'}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#17191c]/45">
              {activeStyle ? (
                <Link href="/catalog" className="underline underline-offset-4 hover:text-[#17191c]">
                  Ver el catálogo completo
                </Link>
              ) : (
                'Elegí otro chip arriba para ver el resto del catálogo'
              )}
            </p>
          </div>
        ) : (

        <motion.div
          key={`${chip}-${activeStyle?.id ?? 'all'}`}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-16 sm:gap-20 lg:gap-24"
        >
        {bands.map((group, index) => {
          const panel = BAND_PANELS[index % BAND_PANELS.length];
          const imageOnRight = index % 2 === 1;

          return (
            <div
              key={`band-${index}`}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-6 items-stretch"
            >
              {/* ── CAMPAIGN PANEL ── */}
              <article
                className={`group relative overflow-hidden bg-[#17191c] min-h-[440px] sm:min-h-[520px] lg:min-h-0 ${
                  imageOnRight ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <Image
                  src={panel.image}
                  alt={panel.alt}
                  fill
                  loading={index === 0 ? 'eager' : 'lazy'}
                  priority={index === 0}
                  quality={82}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/45" />

                {/* Eyebrow chip, top-left */}
                <span className="absolute top-6 left-6 z-10 flex items-center gap-2 border border-white/25 bg-black/55 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                  <span aria-hidden className="block h-1.5 w-1.5 bg-white" />
                  {panel.eyebrow}
                </span>

                {/* Panel content, bottom-left */}
                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-4 p-6 sm:p-8 lg:p-10">
                  <h2 className="max-w-[16ch] font-[family-name:var(--font-bebas)] text-3xl uppercase leading-[0.95] tracking-[0.04em] text-white sm:text-4xl lg:text-5xl">
                    {panel.title}
                  </h2>
                  <p className="max-w-[46ch] font-mono text-[10px] uppercase leading-[1.7] tracking-[0.14em] text-white/70 sm:text-[11px]">
                    {panel.copy}
                  </p>
                  <Link
                    href={panel.href}
                    className="mt-1 flex h-11 items-center gap-3 border border-white/70 px-6 font-[family-name:var(--font-bebas)] text-lg uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-white hover:text-[#17191c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-xl"
                  >
                    {panel.cta}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                  </Link>
                </div>
              </article>

              {/* ── 2×2 PRODUCT BLOCK ── */}
              <div
                className={`grid grid-cols-2 gap-4 sm:gap-6 ${
                  imageOnRight ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                {group.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            </div>
          );
        })}
        </motion.div>

        )}
      </div>
    </section>
  );
}
