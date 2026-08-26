import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SANT CLOTHES',
    short_name: 'SANT',
    description:
      'Streetwear, moda urbana y prendas de alto gramaje de SANT CLOTHES en Paraguay.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f6f8f9',
    theme_color: '#17191c',
    icons: [
      {
        src: '/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
