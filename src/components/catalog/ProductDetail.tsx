'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { CatalogProduct } from '@/types/api';
import ProductCard from '@/components/catalog/ProductCard';
import ProductGallery from '@/components/catalog/ProductGallery';
import ProductPurchasePanel from '@/components/catalog/ProductPurchasePanel';
import ProductLightbox from '@/components/catalog/ProductLightbox';
import { GalleryImage } from './productGallery.types';

interface ProductDetailProps {
  product: CatalogProduct;
  recommended: CatalogProduct[];
}

/**
 * Orchestrates the Product Details page. Data comes down from the server
 * component (src/app/products/[productId]/page.tsx) as props — no client-side
 * fetch, no loading skeleton, no layout shift once JS hydrates.
 *
 * The heavy pieces (gallery, purchase panel, lightbox) are split into their own
 * components so state changes in one (e.g. quantity) don't re-render the others.
 */
export default function ProductDetail({ product, recommended }: ProductDetailProps) {
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  // Only fall back to stock photography for whichever slots are actually missing —
  // previously 4 unrelated Unsplash photos were always injected regardless of how
  // many real product images existed, which padded the gallery with off-brand
  // filler and cost 3 extra network requests per page view.
  const galleryImages = useMemo<GalleryImage[]>(() => {
    if (product.images && product.images.length > 0) {
      return product.images.map((img, i) => ({
        url: img.url,
        alt: img.alt || `${product.title} vista ${i + 1}`,
      }));
    }
    return [
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        alt: `${product.title} vista principal`,
      },
    ];
  }, [product.images, product.title]);

  const openZoom = useCallback((index: number) => setZoomIndex(index), []);
  const closeZoom = useCallback(() => setZoomIndex(null), []);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 sm:py-12 text-[#17191c]">
      <nav aria-label="Ruta de navegación" className="mb-5 sm:mb-7">
        <ol className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#50524a] flex-wrap">
          <li>
            <Link href="/" className="inline-block py-1.5 hover:text-[#17191c] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/catalog" className="inline-block py-1.5 hover:text-[#17191c] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]">
              Catálogo
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-[#17191c] font-bold truncate max-w-[50vw]">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          <ProductGallery images={galleryImages} onOpenZoom={openZoom} />
        </div>

        {/* The panel is taller than the viewport on a 900px-high screen (~1190px with an
            accordion open). Pinned with only `top`, its lower half — accordions included —
            stayed off-screen and unreachable for the whole length of the gallery scroll.
            Capping it to the visible area and letting it scroll internally keeps every
            control reachable; scroll chaining still hands off to the page at the end. */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
          <ProductPurchasePanel product={product} images={galleryImages} onPreviewImage={openZoom} />
        </div>
      </div>

      {recommended.length > 0 && (
        <section aria-labelledby="recommended-heading" className="mt-20 sm:mt-28 border-t border-zinc-200/80 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-500 block mb-1">
                COMPLETÁ EL LOOK · SANT CLOTHES
              </span>
              <h2 id="recommended-heading" className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#17191c]">
                TAMBIÉN TE PUEDE INTERESAR
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-xs font-bold uppercase tracking-wider text-[#17191c] hover:underline flex items-center gap-1.5 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
            >
              <span>Ver Todo el Catálogo</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* 2 → 3 → 4 columns: at 768px a 2-column grid stretched each card to
              ~340px, far wider than the 3:4 card was designed for. */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommended.map((recProduct) => (
              <ProductCard key={recProduct.productId} product={recProduct} />
            ))}
          </div>
        </section>
      )}

      {zoomIndex !== null && (
        <ProductLightbox
          images={galleryImages}
          index={zoomIndex}
          productTitle={product.title}
          onIndexChange={setZoomIndex}
          onClose={closeZoom}
        />
      )}
    </div>
  );
}
