import type { CatalogProduct, ComboInfo, ComboItemInfo } from '@/types/api';
import type { CartItem } from '@/types/cart';
import type { BackendComboItem } from '@/types/backend';

/** comboItems del backend → lo que necesita la ficha para armar el combo. */
export function toComboInfo(items: BackendComboItem[] | undefined): ComboInfo | null {
  if (!items || items.length === 0) return null;
  return {
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name ?? '',
      qty: item.qty,
      image: item.images?.[0],
      fixed: item.fixed ?? item.allowedSizes.length === 1,
      options: (item.options ?? []).map((o) => ({
        token: o.token,
        label: o.size + (o.token.includes(' ') ? ` · ${o.cut}` : ''),
        stock: o.stock,
      })),
    })),
  };
}

/** Hash corto (8 hex) de la selección: hace único el sku del combo por combinación de talles. */
function selectionHash(value: string): string {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, '0');
}

/** Cuántos combos alcanzan con el stock de una opción para esa prenda. */
const unitsFor = (item: ComboItemInfo, stock: number) => Math.floor(stock / Math.max(1, item.qty));

/** Se puede comprar si cada prenda tiene al menos una opción con stock. */
export function comboHasStock(combo: ComboInfo): boolean {
  return combo.items.every((item) => item.options.some((o) => unitsFor(item, o.stock) > 0));
}

/** Primera opción con stock de cada prenda (selección inicial). */
export function defaultComboSelection(combo: ComboInfo): Record<number, string> {
  const selection: Record<number, string> = {};
  combo.items.forEach((item, index) => {
    const option = item.options.find((o) => unitsFor(item, o.stock) > 0) ?? item.options[0];
    if (option) selection[index] = option.token;
  });
  return selection;
}

/**
 * Ítem de carrito de un combo. El backend lo precifica como COMBO y lo
 * descompone en sus prendas: `size` lleva los talles ELEGIBLES separados por
 * "/" en el orden del combo (las prendas de talle fijo no se mandan).
 */
export function comboCartItem(
  product: Pick<CatalogProduct, 'productId' | 'title' | 'price' | 'discountPrice'>,
  combo: ComboInfo,
  selection: Record<number, string>,
  image?: string
): (Omit<CartItem, 'quantity'> & { quantity?: number }) | null {
  const chosen = combo.items.map((item, index) => {
    const option = item.options.find((o) => o.token === selection[index]);
    return option ? { item, option } : null;
  });
  if (chosen.some((c) => !c)) return null;
  const picks = chosen as Array<{ item: ComboItemInfo; option: ComboItemInfo['options'][number] }>;

  const maxStock = Math.min(...picks.map(({ item, option }) => unitsFor(item, option.stock)));
  if (maxStock <= 0) return null;

  const variable = picks.filter(({ item }) => !item.fixed).map(({ option }) => option.token);
  const all = picks.map(({ option }) => option.token);
  const size = (variable.length > 0 ? variable : all).join('/');

  return {
    variantId: `${product.productId}::${all.join('/')}`,
    productId: product.productId,
    productName: product.title,
    // Único por combinación: el merge del carrito (login) junta ítems por sku y
    // fusionaba "combo S/M" con "combo L/XL". Para un combo el backend no lo usa.
    sku: `${product.productId}~${selectionHash(all.join('/'))}`.slice(0, 60),
    size,
    cut: 'COMBO',
    unitPrice: product.discountPrice ?? product.price,
    image,
    maxStock,
  };
}
