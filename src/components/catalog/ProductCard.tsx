'use client';

import { memo, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { ShoppingBag } from 'lucide-react';
import { CatalogProduct } from '@/types/api';
import { formatCurrency } from '@/utils/format';
import { useCart } from '@/hooks/useCart';
import { cardSlots } from '@/lib/images/slots';

interface ProductCardProps {
  product: CatalogProduct;
}

/**
 * SANCLOTHES Atelier Product Card Design:
 * Title swap on hover — when cursor is over the card, the title/subtitle area below the image
 * disappears and is replaced by the size selector buttons and "AÑADIR AL CARRITO" button.
 */
function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);

  const availableSizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : ['XS', 'S', 'M', 'L', 'XL'];

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || 'S');

  // Slots 0 y 1 del corte por defecto. Con una sola foto no se monta la segunda
  // capa: cruzar una imagen contra sí misma solo produce un parpadeo.
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

    const selectedVariant = product.variants?.find((v) => v.size === selectedSize) || {
      variantId: `var_${product.productId}_${selectedSize}`,
      sku: `${product.slug}-${selectedSize}`,
      size: selectedSize,
      cut: product.cuts?.[0] || 'UNISEX',
      price: effectivePrice,
    };

    addItem({
      variantId: selectedVariant.variantId,
      productId: product.productId,
      productName: product.title,
      sku: selectedVariant.sku,
      size: selectedSize,
      cut: selectedVariant.cut,
      unitPrice: effectivePrice,
      image: main.url,
      quantity: 1,
    });

    toast.success('¡AÑADIDO AL CARRITO!', {
      icon: <ShoppingBag className="w-4 h-4 text-white" />,
      description: `${product.title} · TALLE ${selectedSize} — ${formatCurrency(effectivePrice)}`,
    });
  };

  return (
    <div className="group flex flex-col justify-between transition-all duration-300 select-none">
      {/* Product Card Image Container */}
      <div className="relative aspect-[3/4] w-full bg-[#f6f6f6] border border-zinc-200 group-hover:border-black overflow-hidden mb-2.5 transition-all duration-300">
        {/* La foto de hover va PRIMERO en el DOM para quedar debajo: las dos son
            `fill` y sin z-index gana la última pintada. Con el orden inverso la
            card mostraba siempre el slot 1 y la principal quedaba tapada. */}
        <Link href={`/products/${product.productId}`} className="relative block w-full h-full">
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

      {/* ── LOWER CONTENT AREA: TITLE & PRICE / REPLACED BY SIZES & CART ON HOVER ── */}
      <div className="relative min-h-[110px] px-1 flex flex-col justify-between overflow-hidden">
        {/* 1. DEFAULT CONTENT (Title, Subtitle & Price) — Fades out on hover */}
        <div className="flex flex-col gap-1 transition-all duration-300 ease-out group-hover:opacity-0 group-hover:pointer-events-none group-hover:-translate-y-2">
          <span className="text-[9px] font-mono font-bold tracking-[0.18em] text-zinc-500 uppercase truncate">
            {fabricSubtitle}
          </span>

          <Link href={`/products/${product.productId}`}>
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
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
              TALLES: {selectedSize}
            </span>
          </div>
        </div>

        {/* 2. HOVER QUICK ADD PANEL — Fades & slides in where the title was! */}
        <div className="absolute inset-0 z-20 bg-[#17191c] text-white p-2.5 flex flex-col justify-between opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out translate-y-2 group-hover:translate-y-0 shadow-lg">
          {/* Sizes Selector */}
          <div className="flex items-center justify-center gap-1.5">
            {availableSizes.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`text-[11px] font-mono font-bold flex-1 h-8 flex items-center justify-center transition-colors border cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-2xs'
                      : 'bg-transparent text-zinc-300 border-zinc-700 hover:border-white'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full h-9 bg-white text-black hover:bg-zinc-200 text-[11px] font-[family-name:var(--font-bebas)] tracking-[0.12em] uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
            <span>AÑADIR AL CARRITO</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
