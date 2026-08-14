'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Check,
  Heart,
  Minus,
  Plus,
  Ruler,
  Share2,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { CatalogProduct, ProductVariant } from '@/types/api';
import { formatCurrency } from '@/utils/format';
import { useCart } from '@/hooks/useCart';
import { GalleryImage } from './productGallery.types';
import SizeGuideModal from './SizeGuideModal';

interface ProductPurchasePanelProps {
  product: CatalogProduct;
  images: GalleryImage[];
  onPreviewImage: (index: number) => void;
  /** Corte activo. Lo posee ProductDetail porque también manda sobre la galería. */
  selectedCut: string;
  onSelectCut: (cut: string) => void;
}

const LOW_STOCK_THRESHOLD = 5;
const FALLBACK_MAX_QTY = 10;

export default function ProductPurchasePanel({
  product,
  images,
  onPreviewImage,
  selectedCut,
  onSelectCut,
}: ProductPurchasePanelProps) {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);

  const activeCut = selectedCut;

  // Los talles dependen del corte: el backend guarda las variantes anidadas
  // corte → talle, y un corte puede ofrecer menos talles que otro.
  const availableSizes = useMemo(() => {
    const sizesForCut = (product.variants ?? [])
      .filter((v) => v.cut === activeCut)
      .map((v) => v.size);

    const unique = [...new Set(sizesForCut)];
    if (unique.length > 0) return unique;

    return product.sizes?.length ? product.sizes : ['XS', 'S', 'M', 'L', 'XL'];
  }, [product.variants, product.sizes, activeCut]);

  const [pickedSize, setSelectedSize] = useState<string>(availableSizes[0]);

  // Talle efectivo. Al cambiar de corte el talle elegido puede no existir en el
  // nuevo, así que se deriva en render en vez de sincronizarse con un efecto:
  // evita el render en cascada y que quede seleccionado un talle fantasma que
  // después falla al agregar al carrito.
  const selectedSize = availableSizes.includes(pickedSize) ? pickedSize : availableSizes[0];
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
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

  const findVariant = useCallback(
    (size: string): ProductVariant | undefined =>
      product.variants?.find((v) => v.cut === activeCut && v.size === size) ??
      product.variants?.find((v) => v.size === size),
    [product.variants, activeCut]
  );

  const selectedVariant = useMemo<ProductVariant>(
    () =>
      findVariant(selectedSize) ?? {
        variantId: `var_${product.productId}_${activeCut}_${selectedSize}`,
        sku: `${product.slug}-${activeCut}-${selectedSize}`,
        cut: activeCut,
        size: selectedSize,
        price: effectivePrice,
        stock: FALLBACK_MAX_QTY,
      },
    [findVariant, selectedSize, product.productId, product.slug, activeCut, effectivePrice]
  );

  const maxQuantity = isSoldOut ? 0 : Math.max(1, selectedVariant.stock);
  const isLowStock = !isSoldOut && selectedVariant.stock <= LOW_STOCK_THRESHOLD;
  const clampedQuantity = Math.min(quantity, maxQuantity);

  const handleSelectSize = useCallback((size: string) => setSelectedSize(size), []);

  const handleAddToCart = useCallback(() => {
    if (isSoldOut) return;

    addItem({
      variantId: selectedVariant.variantId,
      productId: product.productId,
      productName: product.title,
      sku: selectedVariant.sku,
      size: selectedSize,
      cut: activeCut,
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
    isSoldOut,
    addItem,
    selectedVariant,
    product.productId,
    product.title,
    selectedSize,
    activeCut,
    effectivePrice,
    images,
    clampedQuantity,
  ]);

  const handleBuyNow = useCallback(() => {
    if (isSoldOut) return;
    handleAddToCart();
    router.push('/checkout');
  }, [isSoldOut, handleAddToCart, router]);

  const handleToggleWishlist = useCallback(() => {
    setIsWishlisted((prev) => {
      const next = !prev;
      toast.success(
        next
          ? `Añadido a tus favoritos: ${product.title}`
          : `Eliminado de tus favoritos: ${product.title}`
      );
      return next;
    });
  }, [product.title]);

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
      // User dismissed share
    }
  }, [product.title, product.description]);

  const savings = product.discountPrice ? product.price - product.discountPrice : 0;

  return (
    <div className="space-y-6 select-none text-[#17191c]">
      {/* ── BRAND EYEBROW & HIGH-CONTRAST HEADLINE ── */}
      <div>
        <div className="flex items-center flex-wrap gap-2 mb-3">
          {/* Con más de un corte esto deja de ser decorativo: cada corte tiene su
              propio set de fotos (imagesByCut) y sus propios talles, así que
              seleccionarlo repinta la galería entera. */}
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
            className={`text-[10px] font-mono font-bold px-3 py-1 uppercase tracking-[0.2em] shadow-2xs ${
              isSoldOut
                ? 'bg-zinc-200 text-zinc-600 border border-zinc-300'
                : product.stockStatus === 'LOW_STOCK' || isLowStock
                  ? 'bg-amber-500/10 text-amber-900 border border-amber-500/40 flex items-center gap-1.5'
                  : 'bg-[#17191c] text-white border border-[#17191c]'
            }`}
          >
            {isSoldOut ? (
              'AGOTADO'
            ) : product.stockStatus === 'LOW_STOCK' || isLowStock ? (
              <>
                <Zap className="w-3 h-3 text-amber-600 fill-amber-600 animate-pulse" />
                <span>ÚLTIMAS UNIDADES</span>
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

      {/* ── PRICING BAR WITH EDITORIAL MONO BADGES ── */}
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

      {/* ── STYLE / VARIANT THUMBNAILS ── */}
      {images.length > 1 && (
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

      {/* ── SIZE SELECTOR WITH BEBAS NEUE BUTTONS ── */}
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
            const unavailable = isSoldOut || variant?.stock === 0;
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

      {/* ── QUANTITY SELECTOR & LIVE TOTAL ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span id="qty-label" className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-700">
            CANTIDAD:
          </span>
          <span className="text-xs font-mono font-bold text-[#17191c]">
            TOTAL: {formatCurrency(effectivePrice * clampedQuantity)}
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center border border-[#17191c]/20 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, Math.min(maxQuantity, q) - 1))}
              disabled={clampedQuantity <= 1 || isSoldOut}
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
              disabled={clampedQuantity >= maxQuantity || isSoldOut}
              aria-label="Aumentar cantidad"
              className="w-12 h-12 flex items-center justify-center text-zinc-800 transition-colors hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isLowStock && !isSoldOut && (
          <p className="mt-2.5 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-amber-800 flex items-center gap-1.5" aria-live="polite">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping inline-block" />
            <span>ÚLTIMAS {selectedVariant.stock} UNIDADES EN TALLE {selectedSize}</span>
          </p>
        )}
      </div>

      {/* ── HIGH-IMPACT PRIMARY CTA BUTTONS ── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`flex-1 h-13 sm:h-14 px-3 sm:px-5 font-[family-name:var(--font-bebas)] text-lg sm:text-xl tracking-[0.08em] uppercase whitespace-nowrap flex items-center justify-center gap-2 shadow-md transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c] ${
              isSoldOut
                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed shadow-none'
                : addedSuccess
                  ? 'bg-emerald-900 border border-emerald-700 text-emerald-200 cursor-pointer scale-[0.99]'
                  : 'bg-[#17191c] text-white cursor-pointer hover:bg-[#282b30] active:scale-[0.98]'
            }`}
          >
            {isSoldOut ? (
              <span>SIN STOCK DISPONIBLE</span>
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

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={isWishlisted}
            className={`w-13 h-13 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center border cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c] ${
              isWishlisted
                ? 'bg-rose-600 border-rose-600 text-white shadow-md'
                : 'bg-white border-[#17191c]/20 text-[#17191c] hover:border-[#17191c] hover:bg-zinc-50'
            }`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8] ${isWishlisted ? 'fill-white' : ''}`} aria-hidden="true" />
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartir esta prenda"
            className="w-13 h-13 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center border border-[#17191c]/20 bg-white text-[#17191c] cursor-pointer transition-all duration-200 hover:border-[#17191c] hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" aria-hidden="true" />
          </button>
        </div>

        {!isSoldOut && (
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

