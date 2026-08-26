import type { MetadataRoute } from 'next';
import { fetchCatalog } from '@/lib/services/catalog';
import { CATALOG_STYLES } from '@/lib/catalogFilters';
import { config } from '@/lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = config.app.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comunidad`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATALOG_STYLES.map((style) => ({
    url: `${baseUrl}/catalog?category=${style.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  try {
    const products = await fetchCatalog();
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.productId}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    }));
    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return [...staticRoutes, ...categoryRoutes];
  }
}
