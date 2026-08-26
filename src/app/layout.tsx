import type { Metadata, Viewport } from 'next';
import { Bebas_Neue } from 'next/font/google';
import './globals.css';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Toaster } from 'sonner';
import { config } from '@/lib/config';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
  adjustFontFallback: false,
});

export const viewport: Viewport = {
  themeColor: '#17191c',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(config.app.url),
  title: 'Sant Clothes®',
  description:
    'Moda urbana y streetwear en Paraguay.',
  keywords: [
    'SANT CLOTHES',
    'Sant Clothes',
    'Sant Clothes Paraguay',
    'SANT CLOTHES CDE',
    'Sant Clothes CDE',
    'SANT CLOTHES PARAGUAY',
    'Streetwear paraguay',
    'Old Money paraguay',
    'Moda urbana paraguay',
  ],
  authors: [{ name: 'SANT CLOTHES®' }],
  creator: 'SANT CLOTHES®',
  publisher: 'SANT CLOTHES®',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PY',
    url: config.app.url,
    siteName: 'SANT CLOTHES®',
    title: 'SANT CLOTHES®',
    description:
      'Moda urbana y streetwear en Paraguay.',
    images: [
      {
        url: '/img/hero/IMG_4390.webp',
        width: 1200,
        height: 630,
        alt: 'SANT CLOTHES®',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SANT CLOTHES®',
    description:
      'Moda urbana y streetwear en Paraguay.',
    images: ['/img/hero/IMG_4390.webp'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${config.app.url}/#organization`,
      name: 'SANT CLOTHES',
      url: config.app.url,
      logo: `${config.app.url}/img/logo/logo-iso-negro.png`,
      sameAs: [
        'https://www.instagram.com/santclothespy/',
        'https://www.youtube.com/@santclothes',
      ],
      founder: [
        { '@type': 'Person', name: 'Matías Santos' },
        { '@type': 'Person', name: 'Lucas Santos' },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${config.app.url}/#website`,
      url: config.app.url,
      name: 'SANT CLOTHES®',
      publisher: { '@id': `${config.app.url}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${config.app.url}/catalog?category={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'ClothingStore',
      '@id': `${config.app.url}/#store`,
      name: 'SANT CLOTHES',
      image: `${config.app.url}/img/hero/IMG_4390.webp`,
      url: config.app.url,
      priceRange: '$$',
      currenciesAccepted: 'PYG',
      paymentAccepted: 'Cash, Credit Card, Bank Transfer',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ciudad del Este',
        addressRegion: 'Alto Paraná',
        addressCountry: 'PY',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={bebas.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased bg-[#f6f8f9] text-[#17191c] relative overflow-x-hidden">
        <Header />
        <main className="relative z-10 bg-[#f6f8f9] min-h-screen shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
          {children}
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '0px',
              background: '#000000',
              color: '#ffffff',
              border: '1px solid #000000',
              fontFamily: 'sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              padding: '12px 16px',
            },
          }}
        />
      </body>
    </html>
  );
}
