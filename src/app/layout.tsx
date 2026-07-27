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
});

export const metadata: Metadata = {
  title: 'SANTS CLOTHES® — Modern Elevated Fashion & Atelier',
  description: 'Plataforma oficial de prendas streetwear, hoodies y drops exclusivos SANTS CLOTHES®.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={bebas.variable}>
      <body className="min-h-screen flex flex-col antialiased bg-[#f6f8f9] text-[#17191c]">
        <Header />
        <main className="flex-1">{children}</main>
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

