import type { ProductVariant } from '@/types/api';
import type { CartItem } from '@/types/cart';
import { sortSizes } from './sizes';

/**
 * Compra rápida desde las tarjetas (catálogo, destacados y bento de la home).
 *
 * El backend identifica cada prenda por su SKU (corte + talle) y en el checkout
 * rechaza con INVALID_PRODUCT cualquier SKU que no exista. Por eso estas
 * funciones trabajan sólo con variantes reales: nunca inventan un SKU.
 */

export interface QuickSize {
  size: string;
  soldOut: boolean;
}

/** Talles con variante real, de chico a grande, marcando los que no tienen stock. */
export function quickSizes(variants: ProductVariant[]): QuickSize[] {
  const sizes = sortSizes([...new Set(variants.map((v) => v.size))]);
  return sizes.map((size) => ({
    size,
    soldOut: !variants.some((v) => v.size === size && v.stock > 0),
  }));
}

/** Talle preseleccionado: el primero con stock (o el primero, si están todos agotados). */
export function defaultQuickSize(sizes: QuickSize[]): string | undefined {
  return (sizes.find((s) => !s.soldOut) ?? sizes[0])?.size;
}

/**
 * Con más de un corte (Femenino, Masculino, Unisex) la tarjeta no puede saber
 * cuál quiere el cliente: hay que elegirlo en la ficha.
 */
export function needsCutChoice(variants: ProductVariant[]): boolean {
  return new Set(variants.map((v) => v.cut)).size > 1;
}

/** Variante que se puede agregar directo desde la tarjeta, o `undefined` si no hay una inequívoca con stock. */
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
