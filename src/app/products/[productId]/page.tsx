import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/catalog/ProductDetail';
import { fetchCatalog, fetchProduct } from '@/lib/services/catalog';
import { config } from '@/lib/config';
import { CatalogProduct } from '@/types/api';

interface PageParams {
  params: Promise<{ productId: string }>;
}

/**
 * Fetches a product on the server so the HTML ships with the real content:
 * gives the crawler a populated <h1>/price, makes the hero image the LCP
 * candidate (discoverable in the initial HTML) and removes the client-side
 * loading flash that used to shift the layout.
 */
async function getProduct(productId: string): Promise<CatalogProduct | null> {
  return fetchProduct(productId);
}

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
  const title = `${product.title} — SANT CLOTHES®`;
  // El catálogo puede llegar sin `description` (el backend no la propaga a Redis
  // todavía), así que la metadescripción cae al nombre de la prenda.
  const description = (product.description || product.title).slice(0, 160);
  const image = product.images?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.productId}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${config.app.url}/products/${product.productId}`,
      siteName: 'SANT CLOTHES®',
      locale: 'es_PY',
      images: image ? [{ url: image, alt: product.images[0].alt || product.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    other: {
      'product:price:amount': String(price),
      'product:price:currency': 'PYG',
    },
  };
}

export default async function ProductDetailPage({ params }: PageParams) {
  const { productId } = await params;
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

  // Product + BreadcrumbList structured data for rich results.
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} recommended={recommended} />
    </div>
  );
}
