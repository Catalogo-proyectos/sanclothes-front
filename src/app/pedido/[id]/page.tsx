import type { Metadata } from 'next';
import PageHero from '@/components/common/PageHero';
import OrderAccess from './OrderAccess';

export const metadata: Metadata = {
  title: 'Tu pedido',
  description: 'Estado de tu pedido y comprobante de pago.',
  robots: { index: false, follow: false },
  
  referrer: 'no-referrer',
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="bg-[#f6f8f9] min-h-screen">
      <PageHero
        category="TU PEDIDO / SANT CLOTHES"
        title={`PEDIDO #${id}`}
        subtitle="Transferí el total, subí el comprobante y seguí el estado de tu compra."
          image="/img/web/hero/hero-pedido.webp"
          mobileImage="/img/movil/hero/hero-pedido.webp"
        preserveColor
        tall
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <OrderAccess orderId={id} />
      </div>
    </div>
  );
}
