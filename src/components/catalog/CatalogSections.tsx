'use client';

import Link from 'next/link';
import type { CatalogSection } from '@/lib/catalog/sections';
import { catalogHref } from '@/lib/catalog/query';
import ProductCard from './ProductCard';
import { BentoBandView } from './CatalogBento';

interface CatalogSectionsProps {
  sections: CatalogSection[];
  style: string | null;
}

/** Vista sin filtros: una sección por tipo de prenda, con sus bentos. */
export default function CatalogSections({ sections, style }: CatalogSectionsProps) {
  let bandIndex = 0;

  return (
    <div className="flex flex-col gap-16 sm:gap-20 lg:gap-24">
      {sections.map((section, sectionIndex) => {
        const href = catalogHref({ style, tipo: section.categoryCode });
        const label = section.categoryName;
        return (
          <section key={section.categoryCode} aria-labelledby={`seccion-${section.categoryCode}`} className="flex flex-col gap-6 sm:gap-8">
            <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-[#17191c]/10 pb-3">
              <h2
                id={`seccion-${section.categoryCode}`}
                className="font-[family-name:var(--font-bebas)] text-2xl uppercase leading-none tracking-[0.08em] text-[#17191c] sm:text-3xl"
              >
                {label}
              </h2>
              <Link
                href={href}
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#17191c]/55 underline-offset-4 hover:text-[#17191c] hover:underline sm:text-[11px]"
              >
                Ver todas ({section.total}) →
              </Link>
            </header>

            {section.bands.map((band) => {
              const index = bandIndex++;
              return (
                <BentoBandView
                  key={band.bento.productId}
                  band={band}
                  flip={index % 2 === 1}
                  priority={sectionIndex === 0 && index === 0}
                  seeAll={{ href, label, count: section.total }}
                />
              );
            })}

            {section.grid.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {section.grid.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            )}

            {section.hiddenCount > 0 && (
              <div className="flex justify-center">
                <Link
                  href={href}
                  className="border border-[#17191c] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#17191c] transition-colors hover:bg-[#17191c] hover:text-white sm:text-[11px]"
                >
                  Ver {section.hiddenCount} más de {label}
                </Link>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
