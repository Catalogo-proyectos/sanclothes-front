'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Check,
  Minus,
  Plus,
  Ruler,
  Share2,
  ShoppingBag,
} from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import SantLogoIcon from '@/components/common/SantLogoIcon';
import { CatalogProduct, ProductVariant } from '@/types/api';
import { formatCurrency } from '@/utils/format';
import { useCart } from '@/hooks/useCart';
import { GalleryImage } from './productGallery.types';
import { sortSizes } from '@/lib/catalog/sizes';

const SizeGuideModal = dynamic(() => import('./SizeGuideModal'), { ssr: false });

interface ProductPurchasePanelProps {
  product: CatalogProduct;
  images: GalleryImage[];
  onPreviewImage: (index: number) => void;

  selectedCut: string;
  onSelectCut: (cut: string) => void;
  
  initialSize?: string;
}

const LOW_STOCK_THRESHOLD = 5;

export default function ProductPurchasePanel({
  product,
  images,
  onPreviewImage,
  selectedCut,
  onSelectCut,
  initialSize,
}: ProductPurchasePanelProps) {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);

  const activeCut = selectedCut;

const availableSizes = useMemo(() => {
    const sizesForCut = (product.variants ?? [])
      .filter((v) => v.cut === activeCut)
      .map((v) => v.size);

    const unique = [...new Set(sizesForCut)];
    if (unique.length > 0) return sortSizes(unique);

return sortSizes(product.sizes ?? []);
  }, [product.variants, product.sizes, activeCut]);

const findVariant = useCallback(
    (size: string): ProductVariant | undefined =>
      product.variants?.find((v) => v.cut === activeCut && v.size === size),
    [product.variants, activeCut]
  );
  const hasStock = (size: string) => (findVariant(size)?.stock ?? 0) > 0;

const [pickedSize, setSelectedSize] = useState<string>(initialSize ?? availableSizes[0]);
  const selectedSize =
    availableSizes.includes(pickedSize) && hasStock(pickedSize)
      ? pickedSize
      : availableSizes.find(hasStock) ?? availableSizes[0];
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const openSizeGuide = useCallback(() => setShowSizeGuide(true), []);
  const closeSizeGuide = useCallback(() => setShowSizeGuide(false), []);

  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (successTimer.current) clearTimeout(successTimer.current);
  }, []);

  const effectivePrice = product.discountPrice ?? product.price;
  const isSoldOut = product.stockStatus === 'OUT_OF_STOCK';

const selectedVariant = findVariant(selectedSize);
  const canBuy = !isSoldOut && !!selectedVariant && selectedVariant.stock > 0;

  const maxQuantity = canBuy ? selectedVariant.stock : 0;
  const isLowStock = canBuy && selectedVariant.stock <= LOW_STOCK_THRESHOLD;
  const clampedQuantity = Math.min(quantity, maxQuantity);

  const handleSelectSize = useCallback((size: string) => setSelectedSize(size), []);

  const handleAddToCart = useCallback(() => {
    if (!canBuy || !selectedVariant) return;

    addItem({
      variantId: selectedVariant.variantId,
      productId: product.productId,
      productName: product.title,
      sku: selectedVariant.sku,
      size: selectedVariant.size,
      cut: selectedVariant.cut,
      unitPrice: effectivePrice,
      image: images[0]?.url,
      quantity: clampedQuantity,
      maxStock: selectedVariant.stock,
    });

    setAddedSuccess(true);
    if (successTimer.current) clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setAddedSuccess(false), 2500);

    toast.success('¡AÑADIDO A LA CESTA!', {
      icon: <ShoppingBag className="w-4 h-4 text-white" />,
      description: `${product.title} · TALLE ${selectedSize} (x${clampedQuantity}) — ${formatCurrency(
        effectivePrice * clampedQuantity
      )}`,
    });
  }, [
    canBuy,
    addItem,
    selectedVariant,
    product.productId,
    product.title,
    selectedSize,
    effectivePrice,
    images,
    clampedQuantity,
  ]);

  const handleBuyNow = useCallback(() => {
    if (!canBuy) return;
    handleAddToCart();
    router.push('/checkout');
  }, [canBuy, handleAddToCart, router]);

  const handleShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, text: product.description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('ENLACE COPIADO', { description: 'Ya podés compartir esta prenda.' });
    } catch {

    }
  }, [product.title, product.description]);

  const savings = product.discountPrice ? product.price - product.discountPrice : 0;

  return (
    <div className="space-y-6 select-none text-[#17191c]">

      <div>
        <div className="flex items-center flex-wrap gap-2 mb-3">

          {product.cuts.map((cut) =>
            product.cuts.length > 1 ? (
              <button
                key={cut}
                type="button"
                aria-pressed={cut === activeCut}
                onClick={() => onSelectCut(cut)}
                className={`text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-[0.2em] shadow-2xs border cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c] ${
                  cut === activeCut
                    ? 'bg-[#17191c] text-white border-[#17191c]'
                    : 'bg-white text-[#17191c] border-[#17191c]/15 hover:border-[#17191c]'
                }`}
              >
                {cut}
              </button>
            ) : (
              <span
                key={cut}
                className="bg-white text-[#17191c] border border-[#17191c]/15 text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-[0.2em] shadow-2xs"
              >
                {cut}
              </span>
            )
          )}
          <span
            className={`group relative overflow-hidden text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-[0.2em] shadow-2xs transition-all duration-300 select-none ${
              isSoldOut
                ? 'bg-zinc-200 text-zinc-600 border border-zinc-300'
                : product.stockStatus === 'LOW_STOCK' || isLowStock
                  ? 'bg-[#17191c] text-white border border-[#17191c] shadow-[0_2px_10px_rgba(23,25,28,0.25)] flex items-center gap-2'
                  : 'bg-[#17191c] text-white border border-[#17191c]'
            }`}
          >
            {isSoldOut ? (
              'AGOTADO'
            ) : product.stockStatus === 'LOW_STOCK' || isLowStock ? (
              <>
                
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3.5s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  aria-hidden="true"
                />

<SantLogoIcon
                  className="relative z-10 w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.85)] animate-pulse shrink-0"
                />

                <span className="relative z-10 tracking-[0.22em]">ÚLTIMAS UNIDADES</span>

<span className="relative z-10 flex h-1.5 w-1.5 items-center justify-center shrink-0 ml-0.5">
                  <span className="absolute inline-flex h-full w-full animate-ping bg-amber-400/80 opacity-75" />
                  <span className="relative inline-flex h-1 w-1 bg-amber-400" />
                </span>
              </>
            ) : (
              'DISPONIBLE'
            )}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-[family-name:var(--font-bebas)] uppercase tracking-[0.05em] text-[#17191c] leading-[0.95] drop-shadow-2xs">
          {product.title}
        </h1>

        <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed mt-3">
          {product.description}
        </p>
      </div>

<div className="py-4 border-y border-[#17191c]/10 flex items-center justify-between gap-4 flex-wrap bg-[#17191c]/[0.015] px-1">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-[0.04em] text-[#17191c] leading-none">
            {formatCurrency(effectivePrice)}
          </span>
          {product.discountPrice && (
            <span className="text-sm font-mono text-zinc-400 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {savings > 0 && (
          <span className="bg-[#17191c] text-white text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-[0.18em] shadow-xs">
            AHORRO {formatCurrency(savings)}
          </span>
        )}
      </div>

{images.length > 0 && (
        <div>
          <div className="flex items-center gap-3">
            {images.slice(0, 4).map((image, index) => (
              <button
                key={image.url + index}
                type="button"
                onClick={() => onPreviewImage(index)}
                aria-label={`Ver imagen ${index + 1} de ${images.length} ampliada`}
                className="group relative w-13 h-16 border border-zinc-200 overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#17191c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="52px"
                  quality={70}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

<div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <span id="size-label" className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-700">
            SELECCIONAR TALLE:
          </span>
          <button
            type="button"
            onClick={openSizeGuide}
            className="text-[11px] font-mono font-bold text-[#17191c] uppercase flex items-center gap-1.5 py-1 cursor-pointer hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
          >
            <Ruler className="w-3.5 h-3.5 text-[#17191c]" aria-hidden="true" />
            <span>Guía de talles</span>
          </button>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="size-label"
          className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 border-b border-[#17191c]/10 pb-5"
        >
          {availableSizes.map((size) => {
            const variant = findVariant(size);
            const unavailable = isSoldOut || !variant || variant.stock <= 0;
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={unavailable}
                onClick={() => handleSelectSize(size)}
                className={`min-h-12 py-2 text-xl font-[family-name:var(--font-bebas)] tracking-[0.08em] border flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c] ${
                  unavailable
                    ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed line-through opacity-60'
                    : isSelected
                      ? 'border-[#17191c] bg-[#17191c] text-white shadow-md scale-[1.02] cursor-pointer'
                      : 'border-zinc-300 bg-white text-[#17191c] cursor-pointer hover:border-[#17191c] hover:bg-[#17191c]/[0.03]'
                }`}
              >
                {size}
                {unavailable && <span className="sr-only"> (sin stock)</span>}
              </button>
            );
          })}
        </div>
      </div>

<div>
        <div className="flex items-center justify-between mb-2.5">
          <span id="qty-label" className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-700">
            CANTIDAD:
          </span>

<span
            className="text-xs font-mono font-bold text-[#17191c]"
            title="Precio de lista × cantidad. El total final se calcula en el checkout."
          >
            SUBTOTAL ESTIMADO: {formatCurrency(effectivePrice * clampedQuantity)}
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center border border-[#17191c]/20 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, Math.min(maxQuantity, q) - 1))}
              disabled={clampedQuantity <= 1 || !canBuy}
              aria-label="Reducir cantidad"
              className="w-12 h-12 flex items-center justify-center text-zinc-800 transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <output
              aria-labelledby="qty-label"
              className="w-12 text-center font-mono font-bold text-sm text-[#17191c]"
            >
              {clampedQuantity}
            </output>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={clampedQuantity >= maxQuantity || !canBuy}
              aria-label="Aumentar cantidad"
              className="w-12 h-12 flex items-center justify-center text-zinc-800 transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isLowStock && (
          <div
            className="group relative mt-3 inline-flex items-center gap-2.5 overflow-hidden border border-[#17191c] bg-white pl-3.5 pr-3 py-1.5 shadow-2xs select-none transition-all duration-300 hover:border-black"
            aria-live="polite"
          >
            
            <span className="pointer-events-none absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />

<span
              className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3.5s_infinite] bg-gradient-to-r from-transparent via-[#17191c]/[0.05] to-transparent"
              aria-hidden="true"
            />

<SantLogoIcon
              className="relative z-10 w-3.5 h-3.5 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] animate-pulse shrink-0 ml-0.5"
            />

<span className="relative z-10 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#17191c]">
              {selectedVariant?.stock === 1 ? (
                <>
                  ÚLTIMA <span className="font-black text-amber-600">1 UNIDAD</span> EN TALLE {selectedSize}
                </>
              ) : (
                <>
                  ÚLTIMAS <span className="font-black text-amber-600">{selectedVariant?.stock} UNIDADES</span> EN TALLE {selectedSize}
                </>
              )}
            </span>
          </div>
        )}
      </div>

<div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canBuy}
            className={`flex-1 h-13 sm:h-14 px-3 sm:px-5 font-[family-name:var(--font-bebas)] text-lg sm:text-xl tracking-[0.08em] uppercase whitespace-nowrap flex items-center justify-center gap-2 shadow-md transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c] ${
              !canBuy
                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed shadow-none'
                : addedSuccess
                  ? 'bg-emerald-900 border border-emerald-700 text-emerald-200 cursor-pointer scale-[0.99]'
                  : 'bg-[#17191c] text-white cursor-pointer hover:bg-[#282b30] active:scale-[0.98]'
            }`}
          >
            {isSoldOut ? (
              <span>SIN STOCK DISPONIBLE</span>
            ) : !canBuy ? (
              <span>TALLE NO DISPONIBLE</span>
            ) : addedSuccess ? (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 shrink-0" aria-hidden="true" />
                <span className="truncate">¡AGREGADO CON ÉXITO!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8] shrink-0" aria-hidden="true" />
                <span className="truncate">AÑADIR A LA CESTA</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartir esta prenda"
            className="w-13 h-13 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center border border-[#17191c]/20 bg-white text-[#17191c] cursor-pointer transition-all duration-200 hover:border-[#17191c] hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" aria-hidden="true" />
          </button>
        </div>

        {canBuy && (
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full h-12 sm:h-13 font-[family-name:var(--font-bebas)] text-lg sm:text-xl tracking-[0.1em] uppercase border-2 border-[#17191c] bg-transparent text-[#17191c] cursor-pointer transition-all duration-300 hover:bg-[#17191c] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
          >
            Comprar ahora
          </button>
        )}
      </div>

      {showSizeGuide && <SizeGuideModal activeSize={selectedSize} onClose={closeSizeGuide} />}
    </div>
  );
}

