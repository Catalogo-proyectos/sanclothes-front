import PageHero from '@/components/common/PageHero';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export default function CheckoutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Page Hero */}
      <PageHero
        category="PROCESO DE PAGO SEGURO / SANCLOTHES"
        title="FINALIZAR COMPRA"
        subtitle="Ingresá los datos de envío y selección de pago. Envíos garantizados a todo el país."
        compact
      />

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <CheckoutForm />
      </div>
    </div>
  );
}
