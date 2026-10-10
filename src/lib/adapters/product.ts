import type { BackendProduct } from '@/types/backend';
import type { CatalogProduct, ProductImage, ProductVariant, StockStatus } from '@/types/api';
import { imagesForCut } from '@/lib/images/resolve';
import { comboHasStock, toComboInfo } from '@/lib/catalog/combo';

const LOW_STOCK_THRESHOLD = 5;

interface EffectivePrice {
  price: number;
  discountPrice: number | null;
}

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

const combo = product.isCombo ? toComboInfo(product.comboItems) : null;

  const hype =
    product.showHypeCountdown && product.publishAt && new Date(product.publishAt).getTime() > Date.now()
      ? { launchAt: product.publishAt }
      : null;

  const stockStatus: StockStatus = combo
    ? comboHasStock(combo) ? 'IN_STOCK' : 'OUT_OF_STOCK'
    : totalStock === 0 ? 'OUT_OF_STOCK' : totalStock <= LOW_STOCK_THRESHOLD ? 'LOW_STOCK' : 'IN_STOCK';

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
        ? {

            discountPercent:
              product.flashSale.discountType === 'PERCENTAGE'
                ? product.flashSale.discountValue
                : price > 0 ? Math.round((1 - discountPrice / price) * 100) : 0,
            endsAt: product.flashSale.endAt,
          }
        : null,
    badge: product.badge ?? null,
    isFeatured: product.isFeatured,
    isLimitedDrop: product.isLimitedDrop,
    tags: product.tags,
    createdAt: product.createdAt,
    styles: product.styles ?? [],
    categoryName: product.categoryName ?? product.category,
    color: product.color ?? null,
    bento: product.bento ?? null,
    combo,
    hype,
  };
}
