import type { Metadata } from 'next';
import PageHero from '@/components/common/PageHero';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = {
  title: 'Finalizar compra',
  description: 'Checkout privado para completar pedidos de SANT CLOTHES.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/checkout',
  },
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#f6f8f9]">
      <PageHero
        category="PROCESO DE PAGO / SANT CLOTHES"
        title="FINALIZAR COMPRA"
        subtitle="Completá tus datos de envío, revisá el total y confirmá tu pedido de forma segura."
        image="/img/web/hero/hero-checkout.webp"
        mobileImage="/img/movil/hero/hero-checkout.webp"
        preserveColor
        tall
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
