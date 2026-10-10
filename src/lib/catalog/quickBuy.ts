import type { ProductVariant } from '@/types/api';
import type { CartItem } from '@/types/cart';
import { sortSizes } from './sizes';

export interface QuickSize {
  size: string;
  soldOut: boolean;
}

export function quickSizes(variants: ProductVariant[]): QuickSize[] {
  const sizes = sortSizes([...new Set(variants.map((v) => v.size))]);
  return sizes.map((size) => ({
    size,
    soldOut: !variants.some((v) => v.size === size && v.stock > 0),
  }));
}

export function defaultQuickSize(sizes: QuickSize[]): string | undefined {
  return (sizes.find((s) => !s.soldOut) ?? sizes[0])?.size;
}

export function needsCutChoice(variants: ProductVariant[]): boolean {
  return new Set(variants.map((v) => v.cut)).size > 1;
}

export function quickVariant(variants: ProductVariant[], size: string | undefined): ProductVariant | undefined {
  if (!size || needsCutChoice(variants)) return undefined;
  return variants.find((v) => v.size === size && v.stock > 0);
}

interface CartProductInfo {
  productId: string;
  productName: string;
  unitPrice: number;
  image?: string;
}

export function variantToCartItem(product: CartProductInfo, variant: ProductVariant): CartItem {
  return {
    variantId: variant.variantId,
    productId: product.productId,
    productName: product.productName,
    sku: variant.sku,
    size: variant.size,
    cut: variant.cut,
    unitPrice: product.unitPrice,
    image: product.image,
    quantity: 1,
    maxStock: variant.stock,
  };
}
