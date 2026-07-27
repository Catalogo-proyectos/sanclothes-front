import PageHero from '@/components/common/PageHero';
import ProductDetail from '@/components/catalog/ProductDetail';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return (
    <div className="bg-white">
      <PageHero
        category="ESPECIFICACIONES DE PRENDA / SANCLOTHES"
        title="DETALLE Y CONFECCIÓN DE PRENDA"
        subtitle="Conocé en detalle la composición, calce y especificaciones de diseño de cada pieza esencial."
        compact
      />
      <ProductDetail productId={productId} />
    </div>
  );
}
