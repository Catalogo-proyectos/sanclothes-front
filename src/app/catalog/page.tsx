import type { Metadata } from 'next';
import { Suspense } from 'react';
import CatalogHero from '@/components/catalog/CatalogHero';
import CatalogView from '@/components/catalog/CatalogView';
import { isStyleId } from '@/lib/catalogFilters';
import { config } from '@/lib/config';
import { fetchCatalog } from '@/lib/services/catalog';
import { fetchTaxonomy, findStyle, type CatalogTaxonomy } from '@/lib/services/taxonomy';
import type { CatalogProduct } from '@/types/api';

interface CatalogPageProps {
  searchParams: Promise<{ category?: string }>;
}

async function CatalogProducts({ taxonomy }: { taxonomy: CatalogTaxonomy }) {
  let products: CatalogProduct[] = [];
  try {

products = await fetchCatalog();
  } catch {
    
  }

  return <CatalogView initialProducts={products} taxonomy={taxonomy} />;
}

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const { category } = await searchParams;
  const taxonomy = await fetchTaxonomy();
  const style = findStyle(taxonomy, category);

  const title = style ? `Colección ${style.name}` : 'Catálogo Completo';
  const description = style
    ? `Explora la colección ${style.name} de SANT CLOTHES®. Prendas de alta densidad, algodón pesado y siluetas contemporáneas en Paraguay.`
    : 'Explora todas las prendas de SANT CLOTHES®';
  const canonicalUrl = style ? `/catalog?category=${style.code}` : '/catalog';
  const image = style?.coverImage ?? '/img/web/hero/hero-catalogo.webp';

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
          url: image,
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
      images: [image],
    },
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { category } = await searchParams;
  const taxonomy = await fetchTaxonomy();
  const style = findStyle(taxonomy, category);

  const legacyStyleId = isStyleId(category) ? category : null;

  return (

    <div className="bg-[#f6f8f9]">
      <CatalogHero
        styleId={legacyStyleId}
        styleName={style?.name ?? null}
        coverImage={style?.coverImage ?? null}
        coverImageMobile={style?.coverImageMobile ?? null}
      />
      <div id="productos" className="relative z-10 scroll-mt-24 bg-[#f6f8f9] shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.25)]">
        <Suspense fallback={<div className="py-12 text-center text-xs font-semibold text-zinc-400 uppercase tracking-widest">Cargando catálogo...</div>}>
          <CatalogProducts taxonomy={taxonomy} />
        </Suspense>
      </div>
    </div>
  );
}
