import type { Metadata } from 'next';
import ComunidadContent from '@/components/comunidad/ComunidadContent';
import { config } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Comunidad & Sant Club®',
  description:
    'Unite al Sant Club oficial en WhatsApp. Acceso anticipado 24h a drops exclusivos, pases VIP para aperturas y decisiones de moldería en Paraguay.',
  alternates: {
    canonical: '/comunidad',
  },
  openGraph: {
    title: 'Comunidad & Sant Club®',
    description:
      'Unite al Sant Club oficial en WhatsApp. Acceso anticipado 24h a drops exclusivos, pases VIP para aperturas y decisiones de moldería en Paraguay.',
    url: `${config.app.url}/comunidad`,
    images: [
      {
        url: '/img/web/hero/IMG_3202.webp',
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
      'Unite al Sant Club oficial en WhatsApp. Acceso anticipado 24h a drops exclusivos, pases VIP para aperturas y decisiones de moldería en Paraguay.',
    images: ['/img/web/hero/IMG_3202.webp'],
  },
};

export default function ComunidadPage() {
  return <ComunidadContent />;
}
