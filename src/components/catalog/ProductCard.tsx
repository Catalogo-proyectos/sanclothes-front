'use client';

import { memo, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { CatalogProduct } from '@/types/api';
import HypeCountdown from '@/components/catalog/HypeCountdown';
import { formatCurrency } from '@/utils/format';
import { useCart } from '@/hooks/useCart';
import { cardSlots } from '@/lib/images/slots';
import { productHref } from '@/lib/catalog/sizes';
import {
  defaultQuickSize,
  needsCutChoice,
  quickSizes,
  quickVariant,
  variantToCartItem,
} from '@/lib/catalog/quickBuy';

interface ProductCardProps {
  product: CatalogProduct;
}

function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);

const variants = product.variants ?? [];
  const sizes = quickSizes(variants);
  const multiCut = needsCutChoice(variants);

const [pickedSize, setSelectedSize] = useState<string | null>(null);
  const selectedSize = pickedSize ?? defaultQuickSize(sizes);
  const href = productHref(product.productId, pickedSize);
  const variantToAdd = quickVariant(variants, selectedSize);

const { main, hover, count } = useMemo(
    () => cardSlots(product.images ?? []),
    [product.images]
  );
  const hasHoverImage = count > 1;

  const effectivePrice = product.discountPrice || product.price;

  const fabricSubtitle = product.description
    ? product.description.split('.')[0].toUpperCase()
    : 'TEXTURA SUEDE & EMBROIDERED NOVA';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variantToAdd) return;

    addItem(
      variantToCartItem(
        { productId: product.productId, productName: product.title, unitPrice: effectivePrice, image: main.url },
        variantToAdd
      )
    );

    toast.success('¡AÑADIDO AL CARRITO!', {
      icon: <ShoppingBag className="w-4 h-4 text-white" />,
      description: `${product.title} · TALLE ${variantToAdd.size} — ${formatCurrency(effectivePrice)}`,
    });
  };

if (product.hype) {
    return (
      <Link href={href} className="group flex flex-col select-none">
        <div className="relative aspect-[3/4] w-full bg-[#17191c] border border-[#17191c] mb-2.5 flex flex-col items-center justify-center gap-2 text-white">
          <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-zinc-400">PRÓXIMAMENTE</span>
          <span className="text-4xl font-[family-name:var(--font-bebas)] tracking-[0.06em]">???</span>
          <span className="text-xs"><HypeCountdown launchAt={product.hype.launchAt} variant="compact" /></span>
        </div>
        <div className="px-1">
          <span className="text-[9px] font-mono font-bold tracking-[0.18em] text-zinc-500 uppercase">LANZAMIENTO HYPE</span>
          <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#17191c] leading-snug line-clamp-2">{product.title}</h3>
        </div>
      </Link>
    );
  }

  return (
    <div className="group flex flex-col justify-between transition-all duration-300 select-none">

      <div className="relative aspect-[3/4] w-full bg-[#f6f6f6] border border-zinc-200 group-hover:border-black overflow-hidden mb-2.5 transition-all duration-300">

        <Link href={href} className="relative block w-full h-full">
          {hasHoverImage && (
            <Image
              src={hover.url}
              alt={hover.alt}
              fill
              loading="lazy"
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1440px) 25vw, 340px"
              quality={75}
              className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          )}
          <Image
            src={main.url}
            alt={main.alt}
            fill
            loading="lazy"
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1440px) 25vw, 340px"
            quality={75}
            className={
              hasHoverImage
                ? 'object-cover object-center group-hover:opacity-0 transition-opacity duration-500 ease-out'
                : 'object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out'
            }
          />
        </Link>
      </div>

<div className="relative min-h-[110px] px-1 flex flex-col justify-between overflow-hidden">

        <div className="flex flex-col gap-1 transition-all duration-300 ease-out group-hover:opacity-0 group-hover:pointer-events-none group-hover:-translate-y-2">
          <span className="text-[9px] font-mono font-bold tracking-[0.18em] text-zinc-500 uppercase truncate">
            {fabricSubtitle}
          </span>

          <Link href={href}>
            <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#17191c] leading-snug line-clamp-2">
              {product.title}
            </h3>
          </Link>

          <div className="flex items-baseline justify-between gap-2 mt-1 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-mono font-bold text-[#17191c] tabular-nums">
                {formatCurrency(effectivePrice)}
              </span>
              {product.discountPrice && (
                <span className="text-[11px] font-mono text-zinc-400 line-through tabular-nums">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            {selectedSize && (
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                TALLES: {selectedSize}
              </span>
            )}
          </div>
        </div>

<div className="absolute inset-0 z-20 bg-[#17191c] text-white p-2.5 flex flex-col justify-between opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out translate-y-2 group-hover:translate-y-0 shadow-lg">

          <div className="flex items-center justify-center gap-1.5">
            {sizes.map(({ size: sz, soldOut }) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  disabled={soldOut}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`text-[11px] font-mono font-bold flex-1 h-8 flex items-center justify-center transition-colors border ${soldOut
                      ? 'bg-transparent text-zinc-600 border-zinc-800 line-through cursor-not-allowed'
                      : isSelected
                        ? 'bg-white text-black border-white shadow-2xs cursor-pointer'
                        : 'bg-transparent text-zinc-300 border-zinc-700 hover:border-white cursor-pointer'
                    }`}
                >
                  {sz}
                  {soldOut && <span className="sr-only"> (sin stock)</span>}
                </button>
              );
            })}
          </div>

{sizes.length === 0 || multiCut ? (

            <Link
              href={href}
              className="w-full h-9 bg-white text-black hover:bg-zinc-200 text-[11px] font-[family-name:var(--font-bebas)] tracking-[0.12em] uppercase flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
            >
              <span>{product.combo ? 'ARMAR COMBO' : multiCut ? 'VER DETALLES' : 'VER PRENDA'}</span>
              <ArrowRight className="w-4 h-4 stroke-[1.8]" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!variantToAdd}
              className="w-full h-9 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed text-[11px] font-[family-name:var(--font-bebas)] tracking-[0.12em] uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
              <span>{variantToAdd ? 'AÑADIR AL CARRITO' : 'AGOTADO'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
