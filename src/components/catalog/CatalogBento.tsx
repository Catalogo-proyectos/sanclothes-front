'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CatalogProduct } from '@/types/api';
import { formatCurrency } from '@/utils/format';
import { normalizeImageUrl } from '@/lib/images/url';
import { PLACEHOLDER_PRODUCT } from '@/lib/images/constants';
import { bentoTitle, type BentoBand } from '@/lib/catalog/sections';
import ProductCard from './ProductCard';

/**
 * Bento del catálogo v2: un producto marcado como bento en el admin, con sus
 * productos del mismo tipo de prenda al lado. El armado depende de cuántos
 * hay (ver arrangementFor en lib/catalog/sections.ts).
 */

function bentoImage(product: CatalogProduct): string {
  return normalizeImageUrl(product.bento?.image) ?? product.images[0]?.url ?? PLACEHOLDER_PRODUCT;
}

interface BentoTileProps {
  product: CatalogProduct;
  className?: string;
  priority?: boolean;
  sizes: string;
}

export function BentoTile({ product, className = '', priority = false, sizes }: BentoTileProps) {
  const title = bentoTitle(product);
  const price = product.discountPrice ?? product.price;
  // Si la imagen (propia del bento o del producto) no carga, el placeholder.
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={`/products/${product.productId}`}
      aria-label={`${title} — ${product.title}`}
      className={`group relative block overflow-hidden bg-[#17191c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17191c] focus-visible:ring-offset-2 ${className}`}
    >
      <Image
        src={failed ? PLACEHOLDER_PRODUCT : bentoImage(product)}
        onError={() => setFailed(true)}
        alt={product.images[0]?.alt ?? product.title}
        fill
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        quality={82}
        sizes={sizes}
        className="object-cover object-center transition-transform duration-[900ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-3 p-6 sm:p-8 lg:p-10">
        <h3 className="max-w-[16ch] font-[family-name:var(--font-bebas)] text-3xl uppercase leading-[0.95] tracking-[0.04em] text-white sm:text-4xl lg:text-5xl">
          {title}
        </h3>
        {product.bento?.copy && (
          <p className="max-w-[46ch] font-mono text-[10px] uppercase leading-[1.7] tracking-[0.14em] text-white/70 sm:text-[11px]">
            {product.bento.copy}
          </p>
        )}
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/85 sm:text-[11px]">
          {product.title} · {formatCurrency(price)}
        </p>
      </div>
    </Link>
  );
}

interface SeeAllTileProps {
  href: string;
  label: string;
  count: number;
}

export function SeeAllTile({ href, label, count }: SeeAllTileProps) {
  return (
    <Link
      href={href}
      className="flex min-h-[220px] flex-col items-center justify-center gap-3 border border-dashed border-[#17191c]/20 bg-white/40 p-6 text-center transition-colors hover:border-[#17191c]/50 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17191c]"
    >
      <span className="font-[family-name:var(--font-bebas)] text-2xl uppercase leading-none tracking-[0.06em] text-[#17191c]">
        Ver {label}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#17191c]/50">
        {count} {count === 1 ? 'pieza' : 'piezas'} →
      </span>
    </Link>
  );
}

interface BentoBandViewProps {
  band: BentoBand;
  /** Alterna el lado del bento entre bandas consecutivas. */
  flip: boolean;
  priority: boolean;
  seeAll: { href: string; label: string; count: number };
}

const cards = (products: CatalogProduct[]) =>
  products.map((product) => <ProductCard key={product.productId} product={product} />);

export function BentoBandView({ band, flip, priority, seeAll }: BentoBandViewProps) {
  const { bento, side, arrangement } = band;

  // 0 al lado: banner a todo el ancho.
  if (arrangement === 'banner') {
    return (
      <BentoTile
        product={bento}
        priority={priority}
        sizes="100vw"
        className="aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/9]"
      />
    );
  }

  // 1 al lado: bento ancho (3/4) + una card. 2 al lado: bento (2/4) + dos cards.
  if (arrangement === 'split' || arrangement === 'stack') {
    const bentoSpan = arrangement === 'split' ? 'lg:col-span-3' : 'lg:col-span-2';
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <BentoTile
          product={bento}
          priority={priority}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className={`col-span-2 aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[520px] ${bentoSpan} ${flip ? 'lg:order-2' : ''}`}
        />
        {cards(side)}
      </div>
    );
  }

  // 3 o 4 al lado: bento a la mitad + grilla 2×2 (con "Ver todas" en el 4.º lugar si hay 3).
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-6">
      <BentoTile
        product={bento}
        priority={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className={`min-h-[500px] sm:min-h-[600px] lg:min-h-[820px] xl:min-h-[960px] ${flip ? 'lg:order-2' : ''}`}
      />
      <div className={`grid grid-cols-2 content-start gap-4 sm:gap-6 ${flip ? 'lg:order-1' : ''}`}>
        {cards(side)}
        {arrangement === 'trio' && <SeeAllTile {...seeAll} />}
      </div>
    </div>
  );
}
