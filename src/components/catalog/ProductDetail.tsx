'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CatalogProduct } from '@/types/api';
import ProductCard from '@/components/catalog/ProductCard';
import ProductGallery from '@/components/catalog/ProductGallery';
import ProductPurchasePanel from '@/components/catalog/ProductPurchasePanel';
import { GalleryImage } from './productGallery.types';

const ProductLightbox = dynamic(() => import('@/components/catalog/ProductLightbox'), { ssr: false });

interface ProductDetailProps {
  product: CatalogProduct;
  recommended: CatalogProduct[];
}


export default function ProductDetail({ product, recommended }: ProductDetailProps) {
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [selectedCut, setSelectedCut] = useState<string>(product.cuts?.[0] ?? '');





  const galleryImages = useMemo<GalleryImage[]>(() => {
    const source = product.imagesByCut?.[selectedCut] ?? product.images ?? [];

    if (!source || source.length === 0) {
      return [{ url: '/img/Placeholer.jpeg', alt: product.title || 'Imagen de producto' }];
    }

    const isAllPlaceholder = source.every(
      (img) => !img.url || img.url.includes('Placeholer') || img.url.includes('placeholder')
    );
    if (isAllPlaceholder) {
      return [{ url: source[0]?.url || '/img/Placeholer.jpeg', alt: source[0]?.alt || product.title }];
    }

    const seenUrls = new Set<string>();
    const uniqueImages: GalleryImage[] = [];

    for (let i = 0; i < source.length; i++) {
      const img = source[i];
      if (!seenUrls.has(img.url)) {
        seenUrls.add(img.url);
        uniqueImages.push({
          url: img.url,
          alt: img.alt || `${product.title} vista ${uniqueImages.length + 1}`,
        });
      }
    }

    return uniqueImages.length > 0
      ? uniqueImages
      : [{ url: '/img/Placeholer.jpeg', alt: product.title || 'Imagen de producto' }];
  }, [product.imagesByCut, product.images, product.title, selectedCut]);

  const openZoom = useCallback((index: number) => setZoomIndex(index), []);
  const closeZoom = useCallback(() => setZoomIndex(null), []);


  const handleSelectCut = useCallback((cut: string) => {
    setSelectedCut(cut);
    setZoomIndex(null);
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 sm:py-12 text-[#17191c]">


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          <ProductGallery images={galleryImages} onOpenZoom={openZoom} />
        </div>


        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
          <ProductPurchasePanel
            product={product}
            images={galleryImages}
            onPreviewImage={openZoom}
            selectedCut={selectedCut}
            onSelectCut={handleSelectCut}
          />
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
