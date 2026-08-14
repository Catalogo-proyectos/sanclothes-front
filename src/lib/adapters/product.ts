import type { BackendProduct } from '@/types/backend';
import type { CatalogProduct, ProductImage, ProductVariant, StockStatus } from '@/types/api';
import { imagesForCut } from '@/lib/images/resolve';

/**
 * Traduce el producto tal como lo emite la API al modelo que consumen los
 * componentes del front.
 *
 * Existe para que el cambio de backend no obligue a tocar las ~20 vistas que ya
 * renderizan `CatalogProduct`. Toda diferencia de nombre, forma o unidad entre
 * los dos modelos se resuelve acá y en ningún otro lado.
 */

const LOW_STOCK_THRESHOLD = 5;

interface EffectivePrice {
  price: number;
  discountPrice: number | null;
}

/**
 * Precio efectivo del producto.
 *
 * Espeja la precedencia de backend/src/modules/checkout/checkout.service.ts:107-170:
 * flash sale vigente gana sobre `discountPercent`. Es solo para mostrar — el
 * backend recalcula el precio real al crear la orden e ignora lo que mande el
 * front, así que una diferencia acá no puede cobrar de menos.
 */
export function resolvePrice(product: BackendProduct, now: number = Date.now()): EffectivePrice {
  const base = product.price;
  const sale = product.flashSale;

  const saleActive =
    !!sale &&
    (sale.isActive ?? true) &&
    (!sale.startAt || new Date(sale.startAt).getTime() <= now) &&
    (!sale.endAt || new Date(sale.endAt).getTime() > now);

  if (saleActive && sale) {
    const value = Math.abs(sale.discountValue ?? 0);

    if (sale.discountType === 'PERCENTAGE') {
      return { price: base, discountPrice: Math.round(base * (1 - value / 100)) };
    }
    if (sale.discountType === 'FIXED') {
      return { price: base, discountPrice: Math.max(0, base - value) };
    }
    if (sale.discountType === 'OVERRIDE') {
      return { price: base, discountPrice: sale.overridePrice ?? base };
    }
  }

  if (product.discountPercent > 0) {
    return { price: base, discountPrice: Math.round(base * (1 - product.discountPercent / 100)) };
  }

  return { price: base, discountPrice: null };
}

/**
 * Aplana el mapa anidado corte → talle → { sku, stock } al array plano que
 * esperan la card, el panel de compra y el carrito.
 *
 * El SKU hace de identificador de variante: el backend no emite un `variantId`
 * separado y el checkout se referencia por SKU.
 */
export function flattenVariants(product: BackendProduct): ProductVariant[] {
  const map = product.variantsByCut ?? product.variants ?? {};
  const { price, discountPrice } = resolvePrice(product);
  const unitPrice = discountPrice ?? price;

  return Object.entries(map).flatMap(([cut, sizes]) =>
    Object.entries(sizes ?? {}).map(([size, variant]) => ({
      variantId: variant.sku,
      sku: variant.sku,
      cut,
      size,
      price: unitPrice,
      stock: variant.stock,
    }))
  );
}

/**
 * Etiqueta de urgencia por stock.
 *
 * La documentación del backend promete un campo `urgencyLabel` en cada variante,
 * pero el payload real no lo trae, así que aplicamos la misma regla acá.
 */
export function urgencyLabel(stock: number): string | null {
  if (stock <= 0) return 'Agotado';
  if (stock <= LOW_STOCK_THRESHOLD) {
    return `¡Quedan ${stock} ${stock === 1 ? 'unidad' : 'unidades'}!`;
  }
  return null;
}

function toProductImages(product: BackendProduct, cut: string | null): ProductImage[] {
  return imagesForCut(product, cut).map((image) => ({
    url: image.url,
    alt: image.alt,
    cutVariant: image.cut ?? undefined,
  }));
}

export function toCatalogProduct(product: BackendProduct): CatalogProduct {
  const { price, discountPrice } = resolvePrice(product);
  const variants = flattenVariants(product);
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  const stockStatus: StockStatus =
    totalStock === 0 ? 'OUT_OF_STOCK' : totalStock <= LOW_STOCK_THRESHOLD ? 'LOW_STOCK' : 'IN_STOCK';

  const cuts =
    product.availableCuts?.length
      ? product.availableCuts
      : Object.keys(product.variantsByCut ?? product.variants ?? {});

  const imagesByCut: Record<string, ProductImage[]> = {};
  for (const cut of cuts) {
    const images = toProductImages(product, cut);
    if (images.length > 0) imagesByCut[cut] = images;
  }

  return {
    productId: product.productId,
    slug: product.slug,
    title: product.name,
    // El catálogo de Redis puede no traer `description` todavía; el resto del
    // front asume string, así que normalizamos a '' en vez de dejar undefined.
    description: product.description ?? '',
    price,
    discountPrice,
    images: toProductImages(product, null),
    imagesByCut,
    cuts,
    category: product.category,
    sizes: [...new Set(variants.map((v) => v.size))],
    stockStatus,
    variants,
    flashSale:
      product.flashSale?.endAt && discountPrice !== null
        ? { discountPercent: product.flashSale.discountValue, endsAt: product.flashSale.endAt }
        : null,
    badge: product.badge ?? null,
    isFeatured: product.isFeatured,
    isLimitedDrop: product.isLimitedDrop,
    tags: product.tags,
  };
}
