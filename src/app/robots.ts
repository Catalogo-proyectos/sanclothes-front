import type { MetadataRoute } from 'next';
import { config } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = config.app.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/catalog',
          '/products/',
          '/about',
          '/nosotros',
          '/comunidad',
          '/img/',
          '/llms.txt',
        ],
        disallow: [
          '/dashboard',
          '/checkout',
          '/reset-password',
          '/login',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
