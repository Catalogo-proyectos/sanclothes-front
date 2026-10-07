import type { Metadata } from 'next';
import PageHero from '@/components/common/PageHero';
import OrderAccess from './OrderAccess';

export const metadata: Metadata = {
  title: 'Tu pedido',
  description: 'Estado de tu pedido y comprobante de pago.',
  robots: { index: false, follow: false },
  // El link trae el token en el fragmento (#t=...): nunca sale de este sitio.
  referrer: 'no-referrer',
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="bg-white min-h-screen">
      <PageHero category="TU PEDIDO / SANCLOTHES" title={`PEDIDO #${id}`} subtitle="Datos para transferir y comprobante de pago." compact />
      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12">
        <OrderAccess orderId={id} />
      </div>
    </div>
  );
}
