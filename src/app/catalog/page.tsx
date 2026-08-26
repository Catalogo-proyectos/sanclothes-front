import type { Metadata } from 'next';
import { Suspense } from 'react';
import CatalogHero from '@/components/catalog/CatalogHero';
import ProductGrid from '@/components/catalog/ProductGrid';
import { isStyleId, CATALOG_STYLES } from '@/lib/catalogFilters';
import { config } from '@/lib/config';

interface CatalogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const { category } = await searchParams;
  const styleId = isStyleId(category) ? category : null;
  const activeStyle = CATALOG_STYLES.find((c) => c.id === styleId);

  const title =
    styleId === 'old-money'
      ? 'Colección Old Money'
      : styleId === 'sports'
        ? 'Colección Sports'
        : styleId === 'streetwear'
          ? 'Colección Streetwear'
          : styleId === 'casual'
            ? 'Colección Casual'
            : 'Catálogo Completo';

  const description = activeStyle
    ? `Explora la colección ${activeStyle.label} de SANT CLOTHES®. Prendas de alta densidad, algodón pesado y siluetas contemporáneas en Paraguay.`
    : 'Explora todas las prendas de SANT CLOTHES®';

  const canonicalUrl = styleId ? `/catalog?category=${styleId}` : '/catalog';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | SANT CLOTHES®`,
      description,
      url: `${config.app.url}${canonicalUrl}`,
      images: [
        {
          url: '/img/hero/Hero-Catalogo.jpeg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | SANT CLOTHES®`,
      description,
      images: ['/img/hero/Hero-Catalogo.jpeg'],
    },
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { category } = await searchParams;
  const styleId = isStyleId(category) ? category : null;

  return (
    <div className="bg-[#f6f8f9] pt-16 sm:pt-[72px]">
      <CatalogHero styleId={styleId} />
      <div id="productos" className="relative z-10 scroll-mt-24 bg-[#f6f8f9] shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.25)]">
        <Suspense fallback={<div className="py-12 text-center text-xs font-semibold text-zinc-400 uppercase tracking-widest">Cargando catálogo...</div>}>
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  );
}
