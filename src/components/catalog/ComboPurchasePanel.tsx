'use client';

import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import type { CatalogProduct, ComboInfo } from '@/types/api';
import { formatCurrency } from '@/utils/format';
import { useCart } from '@/hooks/useCart';
import { comboCartItem, defaultComboSelection } from '@/lib/catalog/combo';

interface ComboPurchasePanelProps {
  product: CatalogProduct;
  combo: ComboInfo;
  image?: string;
}

export default function ComboPurchasePanel({ product, combo, image }: ComboPurchasePanelProps) {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);
  const [selection, setSelection] = useState<Record<number, string>>(() => defaultComboSelection(combo));
  const [quantity, setQuantity] = useState(1);

  const cartItem = useMemo(() => comboCartItem(product, combo, selection, image), [product, combo, selection, image]);
  const maxQuantity = cartItem?.maxStock ?? 0;
  const clampedQuantity = Math.max(1, Math.min(quantity, maxQuantity || 1));
  const effectivePrice = product.discountPrice ?? product.price;

  const handleAdd = useCallback(() => {
    if (!cartItem) return false;
    addItem({ ...cartItem, quantity: clampedQuantity });
    toast.success('¡COMBO AÑADIDO A LA CESTA!', {
      icon: <ShoppingBag className="w-4 h-4 text-white" />,
      description: `${product.title} · ${cartItem.size} (x${clampedQuantity})`,
    });
    return true;
  }, [cartItem, addItem, clampedQuantity, product.title]);

  return (
    <div className="space-y-6 select-none text-[#17191c]">
      <div>
        <span className="inline-block mb-3 bg-[#17191c] text-white text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-[0.2em]">
          COMBO · {combo.items.length} PRENDAS
        </span>
        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-[family-name:var(--font-bebas)] uppercase tracking-[0.05em] leading-[0.95]">
          {product.title}
        </h1>
        {product.description && <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mt-3">{product.description}</p>}
      </div>

      <div className="py-4 border-y border-[#17191c]/10 flex items-baseline gap-3 px-1">
        <span className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-[0.04em] leading-none">
          {formatCurrency(effectivePrice)}
        </span>
        {product.discountPrice && (
          <span className="text-sm font-mono text-zinc-400 line-through">{formatCurrency(product.price)}</span>
        )}
      </div>

      <ol className="space-y-4">
        {combo.items.map((item, index) => {
          const labelId = `combo-item-${index}`;
          return (
            <li key={`${item.productId}-${index}`} className="flex gap-3 border border-[#17191c]/10 p-3">
              <div className="relative w-14 h-18 shrink-0 bg-[#f6f6f6] border border-zinc-200 overflow-hidden">
                {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p id={labelId} className="text-xs font-extrabold uppercase tracking-tight leading-snug">
                  {item.qty > 1 ? `${item.qty}× ` : ''}{item.name}
                </p>
                {item.fixed ? (
                  <p className="mt-2 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-zinc-500">
                    TALLE {item.options[0]?.label ?? '—'}
                  </p>
                ) : (
                  <div role="radiogroup" aria-labelledby={labelId} className="mt-2 flex flex-wrap gap-1.5">
                    {item.options.map((option) => {
                      const soldOut = Math.floor(option.stock / Math.max(1, item.qty)) <= 0;
                      const selected = selection[index] === option.token;
                      return (
                        <button
                          key={option.token}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={soldOut}
                          onClick={() => setSelection((prev) => ({ ...prev, [index]: option.token }))}
                          className={`min-w-10 h-9 px-2 text-sm font-[family-name:var(--font-bebas)] tracking-[0.08em] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c] ${
                            soldOut
                              ? 'border-zinc-200 bg-zinc-100 text-zinc-400 line-through cursor-not-allowed'
                              : selected
                                ? 'border-[#17191c] bg-[#17191c] text-white cursor-pointer'
                                : 'border-zinc-300 bg-white hover:border-[#17191c] cursor-pointer'
                          }`}
                        >
                          {option.label}
                          {soldOut && <span className="sr-only"> (sin stock)</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex items-center gap-4">
        <span id="combo-qty" className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-700">CANTIDAD:</span>
        <div className="flex items-center border border-[#17191c]/20 bg-white">
          <button
            type="button"
            aria-label="Reducir cantidad"
            onClick={() => setQuantity(Math.max(1, clampedQuantity - 1))}
            disabled={!cartItem || clampedQuantity <= 1}
            className="w-11 h-11 flex items-center justify-center hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <output aria-labelledby="combo-qty" className="w-10 text-center font-mono font-bold text-sm">{clampedQuantity}</output>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            onClick={() => setQuantity(Math.min(maxQuantity, clampedQuantity + 1))}
            disabled={!cartItem || clampedQuantity >= maxQuantity}
            className="w-11 h-11 flex items-center justify-center hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!cartItem}
          className="w-full h-13 sm:h-14 font-[family-name:var(--font-bebas)] text-lg sm:text-xl tracking-[0.08em] uppercase flex items-center justify-center gap-2 bg-[#17191c] text-white hover:bg-[#282b30] disabled:bg-zinc-200 disabled:text-zinc-500 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ShoppingBag className="w-5 h-5 stroke-[1.8]" aria-hidden="true" />
          <span>{cartItem ? 'AÑADIR COMBO A LA CESTA' : 'COMBO SIN STOCK'}</span>
        </button>
        {cartItem && (
          <button
            type="button"
            onClick={() => {
              if (handleAdd()) router.push('/checkout');
            }}
            className="w-full h-12 font-[family-name:var(--font-bebas)] text-lg tracking-[0.1em] uppercase border-2 border-[#17191c] hover:bg-[#17191c] hover:text-white cursor-pointer transition-colors"
          >
            Comprar ahora
          </button>
        )}
      </div>
    </div>
  );
}
