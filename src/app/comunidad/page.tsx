import type { Metadata } from 'next';
import ComunidadContent from '@/components/comunidad/ComunidadContent';
import { config } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Comunidad & Sant Club®',
  description:
    'Unite al Sant Club. Acceso anticipado a drops exclusivos, pases VIP para aperturas y fotos de la comunidad en las calles de Paraguay.',
  alternates: {
    canonical: '/comunidad',
  },
  openGraph: {
    title: 'Comunidad & Sant Club®',
    description:
      'Unite al Sant Club. Acceso anticipado a drops exclusivos, pases VIP para aperturas y fotos de la comunidad en las calles de Paraguay.',
    url: `${config.app.url}/comunidad`,
    images: [
      {
        url: '/img/hero/IMG_3202.webp',
        width: 1200,
        height: 630,
        alt: 'Comunidad Sant Club',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comunidad & Sant Club®',
    description:
      'Unite al Sant Club. Acceso anticipado a drops exclusivos, pases VIP para aperturas y fotos de la comunidad en las calles de Paraguay.',
    images: ['/img/hero/IMG_3202.webp'],
  },
};

export default function ComunidadPage() {
  return <ComunidadContent />;
}
