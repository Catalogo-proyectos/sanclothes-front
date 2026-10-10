import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ProductDetail from '@/components/catalog/ProductDetail';
import { fetchCatalog, fetchProduct } from '@/lib/services/catalog';
import { config } from '@/lib/config';
import { SIZE_PARAM } from '@/lib/catalog/sizes';
import { CatalogProduct } from '@/types/api';
import { serializeJsonLd } from '@/lib/seo/jsonLd';

interface PageParams {
  params: Promise<{ productId: string }>;
}

interface ProductPageProps extends PageParams {
  searchParams: Promise<{ [SIZE_PARAM]?: string | string[] }>;
}

const getProduct = cache(
  async (productId: string): Promise<CatalogProduct | null> => fetchProduct(productId),
);

async function getRecommended(productId: string): Promise<CatalogProduct[]> {
  try {
    const all = await fetchCatalog();
    return all.filter((p) => p.productId !== productId).slice(0, 8);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) {
    return { title: 'Prenda no encontrada — SANT CLOTHES®' };
  }

  const price = product.discountPrice ?? product.price;
  const title = product.title;
  const socialTitle = `${product.title} — SANT CLOTHES®`;

const description = (product.description || product.title).slice(0, 160);
  const image = product.images?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.productId}` },
    openGraph: {
      type: 'website',
      title: socialTitle,
      description,
      url: `${config.app.url}/products/${product.productId}`,
      siteName: 'SANT CLOTHES®',
      locale: 'es_PY',
      images: image ? [{ url: image, alt: product.images[0].alt || product.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: image ? [image] : undefined,
    },
    other: {
      'product:price:amount': String(price),
      'product:price:currency': 'PYG',
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }: ProductPageProps) {
  const { productId } = await params;

  const sizeParam = (await searchParams)[SIZE_PARAM];
  const initialSize = Array.isArray(sizeParam) ? sizeParam[0] : sizeParam;
  const [product, recommended] = await Promise.all([
    getProduct(productId),
    getRecommended(productId),
  ]);

  if (!product) notFound();

  const price = product.discountPrice ?? product.price;
  const availability =
    product.stockStatus === 'OUT_OF_STOCK'
      ? 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';

const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.images?.map((img) => img.url) ?? [],
        sku: product.variants?.[0]?.sku ?? product.slug,
        category: product.category,
        brand: { '@type': 'Brand', name: 'SANT CLOTHES' },
        offers: {
          '@type': 'Offer',
          price,
          priceCurrency: 'PYG',
          availability,
          url: `${config.app.url}/products/${product.productId}`,
        },
        ...(product.rating && product.reviewCount
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount,
              },
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: config.app.url },
          { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${config.app.url}/catalog` },
          { '@type': 'ListItem', position: 3, name: product.title },
        ],
      },
    ],
  };

  return (
    <div className="bg-[#f6f8f9] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ProductDetail
        key={`${product.productId}:${initialSize ?? ''}`}
        product={product}
        recommended={recommended}
        initialSize={initialSize}
      />
    </div>
  );
}
