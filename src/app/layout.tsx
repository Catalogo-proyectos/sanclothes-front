import type { Metadata } from 'next';
import { Bebas_Neue } from 'next/font/google';
import './globals.css';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Toaster } from 'sonner';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: 'SANT CLOTHES® — Modern Elevated Fashion & Atelier',
  description: 'Plataforma oficial de prendas streetwear, hoodies y drops exclusivos SANT CLOTHES®.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={bebas.variable}>
      <body className="min-h-screen antialiased bg-[#f6f8f9] text-[#17191c] relative overflow-x-hidden">
        <Header />
        {/* z-10 + opaque background keeps <main> sliding over the fixed footer (Footer Reveal).
            The reveal gap itself is rendered by <Footer /> so it always matches the footer's real height. */}
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

