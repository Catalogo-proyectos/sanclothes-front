'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useCatalog } from '@/hooks/useCatalog';
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
  title: string;
  copy: string;
  image: string;
  alt: string;
}

const BAND_PANELS: BandPanel[] = [
  {
    title: 'Camperas & chaquetas — Sant Atelier',
    copy: 'Confeccionadas con materiales pesados, texturas suede y bordados atelier. Siluetas relajadas y acabados de alta durabilidad.',
    image: '/img/hero/IMG_2996.webp',
    alt: 'Campera suede marrón de la colección Atelier',
  },
  {
    title: 'Hoodies & buzos de gramaje alto',
    copy: 'Algodón perchado de 400 y 450 gramos, puños acanalados y caída estructurada que no se deforma con el uso.',
    image: '/img/secciones/rack-outfits-4.webp',
    alt: 'Rack de hoodies y buzos heavyweight',
  },
  {
    title: 'Tracksuits en suede y algodón',
    copy: 'Sets de dos piezas pensados para usarse juntos o por separado. Cierre metálico bidireccional y bordado frontal Nova.',
    image: '/img/hero/IMG_4390.webp',
    alt: 'Conjunto tracksuit completo Le Sant Club',
  },
  {
    title: 'Remeras de base, tejidas para durar',
    copy: 'La capa que sostiene el resto del guardarropa. Cuello reforzado, hombro caído y lavados que envejecen sin perder color.',
    image: '/img/hero/IMG_3202.webp',
    alt: 'Remeras heavyweight de la colección base',
  },
  {
    title: 'Bases anchas, caída limpia',
    copy: 'Denim carpenter, cargos tácticos y sweatpants de gramaje alto. Tiro medio y pierna amplia sin exceso de volumen.',
    image: '/img/hero/IMG_1460.webp',
    alt: 'Pantalones wide-leg y cargo de la colección',
  },
  {
    title: 'Piezas de archivo y últimas unidades',
    copy: 'Prendas de drops anteriores que no vuelven a producirse. Stock limitado por talle, sin reposición.',
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

  const { products, loading } = useCatalog({
    cut: cut ?? undefined,
    category: category ?? undefined,
  });

  // Antes, si el backend devolvía menos de 24 productos se reemplazaba la
  // respuesta por la lista de mocks completa. Eso disfrazaba un catálogo vacío o
  // un backend caído de catálogo lleno, y encima anulaba el filtrado del server.
  // Ahora se muestra lo que hay, y si no hay nada se muestra el estado vacío.
  const displayedProducts = products;

  // The header chip rail is the live filter: it never navigates, so the grid
  // recomputes from the same fetched list instead of refetching per selection.
  const chip = useCatalogFilter((s) => s.chip);
  const setStyle = useCatalogFilter((s) => s.setStyle);
  const reduceMotion = useReducedMotion();
  const activeChip = getChip(chip);

  // `?category=` is the header nav's selection. The grid still filters locally
  // because the backend's `category` filter is an exact match against the code
  // the admin assigned to the product, while the style lines here group several
  // of those codes — the server-side filter alone would drop valid pieces.
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
              <div className="bg-zinc-200 animate-pulse min-h-[500px] sm:min-h-[600px] lg:min-h-[820px] xl:min-h-[960px] 2xl:min-h-[1050px]" />
              <div className="grid grid-cols-2 content-start gap-4 sm:gap-6">
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
            {visibleProducts.length} {visibleProducts.length === 1 ? 'pieza' : 'piezas'}
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
                className={`group relative overflow-hidden bg-[#17191c] min-h-[500px] sm:min-h-[600px] lg:min-h-[820px] xl:min-h-[960px] 2xl:min-h-[1050px] ${
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

                {/* Panel content, bottom-left */}
                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-4 p-6 sm:p-8 lg:p-10">
                  <h2 className="max-w-[16ch] font-[family-name:var(--font-bebas)] text-3xl uppercase leading-[0.95] tracking-[0.04em] text-white sm:text-4xl lg:text-5xl">
                    {panel.title}
                  </h2>
                  <p className="max-w-[46ch] font-mono text-[10px] uppercase leading-[1.7] tracking-[0.14em] text-white/70 sm:text-[11px]">
                    {panel.copy}
                  </p>
                </div>
              </article>

              {/* ── 2×2 PRODUCT BLOCK ── */}
              <div
                className={`grid grid-cols-2 content-start gap-4 sm:gap-6 ${
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
