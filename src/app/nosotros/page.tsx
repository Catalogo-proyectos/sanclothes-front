import type { Metadata } from 'next';
import NosotrosContent from '@/components/nosotros/NosotrosContent';
import { config } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Nuestra Historia',
  description:
    'Conocé la historia de Matías y Lucas Santos. De los primeros cortes en plena pandemia de 2020 a crear fábrica propia y liderar el streetwear oversize en Paraguay.',
  alternates: {
    canonical: '/nosotros',
  },
  openGraph: {
    title: 'Nuestra Historia | SANT CLOTHES®',
    description:
      'Conocé la historia de Matías y Lucas Santos. De los primeros cortes en plena pandemia de 2020 a crear fábrica propia y liderar el streetwear oversize en Paraguay.',
    url: `${config.app.url}/nosotros`,
    images: [
      {
        url: '/img/hero/IMG_4390.webp',
        width: 1200,
        height: 630,
        alt: 'SANT CLOTHES — Historia de Marca',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nuestra Historia | SANT CLOTHES®',
    description:
      'Conocé la historia de Matías y Lucas Santos. De los primeros cortes en plena pandemia de 2020 a crear fábrica propia y liderar el streetwear oversize en Paraguay.',
    images: ['/img/hero/IMG_4390.webp'],
  },
};

export default function NosotrosPage() {
  return <NosotrosContent />;
}
