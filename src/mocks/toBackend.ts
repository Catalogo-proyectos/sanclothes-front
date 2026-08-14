import type { CatalogProduct } from '@/types/api';
import type { BackendProduct, BackendVariant } from '@/types/backend';

/**
 * Convierte los productos de mock (escritos con el modelo de vista) al modelo
 * que emite la API real.
 *
 * Existe para que el modo mock ejercite exactamente el mismo camino que el modo
 * real: payload del backend → adaptador → slots de imagen → componente. Si los
 * mocks devolvieran el modelo de vista ya masticado, el adaptador y la capa de
 * imágenes quedarían sin cobertura justo donde más fácil es equivocarse.
 */
export function toBackendProduct(product: CatalogProduct): BackendProduct {
  const cuts = product.cuts?.length ? product.cuts : ['CLASSIC'];

  // Imágenes agrupadas por corte, como las guarda el admin en tabs separadas.
  const imagesByCut: Record<string, string[]> = {};
  for (const image of product.images ?? []) {
    const cut = image.cutVariant ?? cuts[0];
    (imagesByCut[cut] ??= []).push(image.url);
  }
  // Un corte sin fotos propias hereda las del primero: el admin no deja guardar
  // un corte con variantes y sin imágenes, así que este estado no existe en real.
  for (const cut of cuts) {
    if (!imagesByCut[cut]?.length) {
      imagesByCut[cut] = (product.images ?? []).map((i) => i.url);
    }
  }

  // Mapa anidado corte → talle → { sku, stock }.
  const variants: Record<string, Record<string, BackendVariant>> = {};
  for (const variant of product.variants ?? []) {
    const cut = variant.cut ?? cuts[0];
    (variants[cut] ??= {})[variant.size] = { sku: variant.sku, stock: variant.stock };
  }
  // Talles declarados sin variante explícita: el mock igual los ofrece.
  for (const cut of cuts) {
    variants[cut] ??= {};
    for (const size of product.sizes ?? []) {
      variants[cut][size] ??= { sku: `${product.slug}-${cut}-${size}`.toUpperCase(), stock: 8 };
    }
  }

  const discountPercent =
    product.discountPrice && product.price > 0
      ? Math.round((1 - product.discountPrice / product.price) * 100)
      : 0;

  return {
    productId: product.productId,
    slug: product.slug,
    name: product.title,
    category: product.category,
    dropType: 'DROP_01',
    price: product.price,
    isDropActive: true,
    images: (product.images ?? []).map((i) => i.url),
    imagesByCut,
    variants,
    variantsByCut: variants,
    availableCuts: cuts,
    discountPercent: product.flashSale ? 0 : discountPercent,
    quantityDiscounts: [],
    tags: product.tags ?? [],
    isLimitedDrop: product.isLimitedDrop ?? false,
    purchaseType: 'VENTA_DIRECTA',
    badge: product.badge ?? null,
    primaryActionLabel: 'COMPRAR AHORA',
    secondaryActionLabel: 'AGREGAR A BOLSA',
    successMessage: 'AGREGADO ✓',
    shippingEstimated: 'Envío gratis. Entrega estimada en 15 días',
    flashSale: product.flashSale
      ? {
          discountType: 'PERCENTAGE',
          discountValue: product.flashSale.discountPercent,
          overridePrice: null,
          startAt: null,
          endAt: product.flashSale.endsAt,
          isActive: true,
        }
      : null,
    isCombo: false,
    showHypeCountdown: false,
    publishAt: null,
    unpublishAt: null,
    description: product.description,
    isFeatured: product.isFeatured,
  };
}
