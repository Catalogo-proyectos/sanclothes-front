import type { Metadata } from 'next';
import NosotrosContent from '@/components/nosotros/NosotrosContent';
import { config } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description:
    'Conocé la historia de Matías y Lucas Santos. De los primeros cortes en plena pandemia de 2020 a crear fábrica propia y liderar el streetwear oversize en Paraguay.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Sobre Nosotros | SANT CLOTHES®',
    description:
      'Conocé la historia de Matías y Lucas Santos. De los primeros cortes en plena pandemia de 2020 a crear fábrica propia y liderar el streetwear oversize en Paraguay.',
    url: `${config.app.url}/about`,
    images: [
      {
        url: '/img/hero/IMG_4390.webp',
        width: 1200,
        height: 630,
        alt: 'SANT CLOTHES — Historia de Marca',
      },
    ],
  },
};

export default function AboutPage() {
  return <NosotrosContent />;
}
