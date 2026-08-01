'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
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
}

const LOW_STOCK_THRESHOLD = 5;
const FALLBACK_MAX_QTY = 10;

type AccordionKey = 'detalles' | 'tallas' | 'envios';

export default function ProductPurchasePanel({
  product,
  images,
  onPreviewImage,
}: ProductPurchasePanelProps) {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);

  const availableSizes = useMemo(
    () => (product.sizes?.length ? product.sizes : ['XS', 'S', 'M', 'L', 'XL']),
    [product.sizes]
  );

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<AccordionKey | null>('detalles');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const openSizeGuide = useCallback(() => setShowSizeGuide(true), []);
  const closeSizeGuide = useCallback(() => setShowSizeGuide(false), []);

  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Without this cleanup, navigating away within the 2.5s window left a timer
  // that fired setState on an unmounted component (React logged a warning).
  useEffect(() => () => {
    if (successTimer.current) clearTimeout(successTimer.current);
  }, []);

  const effectivePrice = product.discountPrice ?? product.price;
  const activeCut = product.cuts?.[0] ?? 'UNISEX';
  const isSoldOut = product.stockStatus === 'OUT_OF_STOCK';

  /** Variant lookup: exact cut+size first, then size alone (variant data is partial in the catalog). */
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
  // Derived, not stored: `quantity` can legitimately exceed the stock of a size the
  // user just switched to (e.g. picked 3 in M, then flips to a low-stock L). Clamping
  // at render time — instead of an effect that calls setState off of maxQuantity —
  // avoids the extra cascading render React flags for that pattern.
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
      // User dismissed the share sheet, or the clipboard was blocked — nothing to report.
    }
  }, [product.title, product.description]);

  const toggleAccordion = useCallback(
    (section: AccordionKey) => setOpenAccordion((current) => (current === section ? null : section)),
    []
  );

  const savings = product.discountPrice ? product.price - product.discountPrice : 0;

  return (
    <div className="space-y-6">
      {/* Brand Eyebrow & Title */}
      <div>
        <div className="flex items-center flex-wrap gap-2 mb-3">
          {product.cuts.map((cut) => (
            <span
              key={cut}
              className="bg-white text-[#17191c] border border-black/10 text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest shadow-sm"
            >
              {cut}
            </span>
          ))}
          <span
            className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest ${
              isSoldOut
                ? 'bg-zinc-200 text-zinc-600'
                : product.stockStatus === 'LOW_STOCK'
                  ? 'bg-amber-700 text-white'
                  : 'bg-[#17191c] text-white'
            }`}
          >
            {isSoldOut ? 'AGOTADO' : product.stockStatus === 'LOW_STOCK' ? 'ÚLTIMAS UNIDADES' : 'DISPONIBLE'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#17191c] leading-tight">
          {product.title}
        </h1>

        {product.rating != null && product.reviewCount != null && (
          <p className="flex items-center gap-2 mt-2.5">
            <span className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(product.rating!)
                      ? 'fill-[#17191c] text-[#17191c]'
                      : 'text-zinc-300'
                  }`}
                />
              ))}
            </span>
            <span className="text-[11px] font-bold tracking-wide text-[#50524a]">
              {product.rating.toFixed(1)}
              <span className="sr-only"> de 5</span>
            </span>
            <span className="text-[11px] text-[#50524a]">({product.reviewCount} reseñas)</span>
          </p>
        )}

        <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed mt-2.5">
          {product.description}
        </p>
      </div>

      {/* Pricing Bar */}
      <div className="py-4 border-y border-zinc-200 flex items-baseline justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-black text-[#17191c] tracking-tight tabular-nums">
            {formatCurrency(effectivePrice)}
          </span>
          {product.discountPrice && (
            <span className="text-sm font-normal text-zinc-500 line-through tabular-nums">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {savings > 0 && (
          <span className="bg-[#17191c] text-white text-[9px] font-black px-2.5 py-1 uppercase tracking-widest">
            AHORRO {formatCurrency(savings)}
          </span>
        )}
      </div>

      {/* Variant thumbnails — open the corresponding shot in the zoom viewer */}
      {images.length > 1 && (
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#50524a] mb-2.5">
            ESTILO / VARIANTES:
          </span>
          <div className="flex items-center gap-3">
            {images.slice(0, 4).map((image, index) => (
              <button
                key={image.url + index}
                type="button"
                onClick={() => onPreviewImage(index)}
                aria-label={`Ver imagen ${index + 1} de ${images.length} ampliada`}
                className="relative w-12 h-16 border-2 border-zinc-200 overflow-hidden opacity-80 transition-all duration-200 hover:opacity-100 hover:border-[#17191c] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="48px"
                  quality={60}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <span id="size-label" className="text-[11px] font-bold uppercase tracking-wider text-[#50524a]">
            SELECCIONAR TALLE:
          </span>
          <button
            type="button"
            onClick={openSizeGuide}
            className="text-[11px] font-bold text-[#17191c] uppercase flex items-center gap-1 py-1.5 cursor-pointer hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
          >
            <Ruler className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Guía de talles</span>
          </button>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="size-label"
          className="grid grid-cols-4 sm:grid-cols-5 gap-2 border-b border-zinc-200 pb-4"
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
                className={`min-h-11 py-3 text-xs font-bold border flex items-center justify-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c] ${
                  unavailable
                    ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed line-through'
                    : isSelected
                      ? 'border-[#17191c] bg-[#17191c] text-white shadow-sm cursor-pointer'
                      : 'border-zinc-200 bg-white text-[#17191c] cursor-pointer hover:border-[#17191c]'
                }`}
              >
                {size}
                {unavailable && <span className="sr-only"> (sin stock)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <span id="qty-label" className="block text-[11px] font-bold uppercase tracking-wider text-[#50524a] mb-2.5">
          CANTIDAD:
        </span>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center border border-zinc-200 bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, Math.min(maxQuantity, q) - 1))}
              disabled={clampedQuantity <= 1 || isSoldOut}
              aria-label="Reducir cantidad"
              className="w-11 h-11 flex items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
            >
              <Minus className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <output
              aria-labelledby="qty-label"
              className="w-10 text-center font-bold text-xs tabular-nums"
            >
              {clampedQuantity}
            </output>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              disabled={clampedQuantity >= maxQuantity || isSoldOut}
              aria-label="Aumentar cantidad"
              className="w-11 h-11 flex items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <span className="text-xs text-[#50524a] font-mono tabular-nums">
            Total: {formatCurrency(effectivePrice * clampedQuantity)}
          </span>
        </div>

        {isLowStock && !isSoldOut && (
          <p className="mt-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-800" aria-live="polite">
            Quedan {selectedVariant.stock} unidades en talle {selectedSize}
          </p>
        )}
      </div>

      {/* Primary actions */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`flex-1 min-h-13 py-4 px-4 sm:px-6 text-xs font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2 shadow-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c] ${
              isSoldOut
                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed shadow-none'
                : addedSuccess
                  ? 'bg-emerald-800 text-white cursor-pointer'
                  : 'bg-[#17191c] text-white cursor-pointer hover:bg-zinc-800 active:bg-black'
            }`}
          >
            {isSoldOut ? (
              <span>SIN STOCK</span>
            ) : addedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" aria-hidden="true" />
                <span>¡AGREGADO CON ÉXITO!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span>AÑADIR A LA CESTA</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={isWishlisted}
            className={`w-13 h-13 shrink-0 flex items-center justify-center border cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c] ${
              isWishlisted
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'bg-[#17191c] border-[#17191c] text-white hover:bg-zinc-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartir esta prenda"
            className="w-13 h-13 shrink-0 flex items-center justify-center border border-zinc-300 bg-white text-[#17191c] cursor-pointer transition-colors duration-200 hover:border-[#17191c] hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {!isSoldOut && (
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full min-h-12 py-3.5 text-xs font-bold tracking-[0.2em] uppercase border border-[#17191c] bg-transparent text-[#17191c] cursor-pointer transition-colors duration-200 hover:bg-[#17191c] hover:text-[#f6f8f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
          >
            Comprar ahora
          </button>
        )}
      </div>

      {/* Trust badges */}
      <ul className="grid grid-cols-3 gap-2 py-4 bg-white/70 border border-zinc-200 p-3 text-center list-none">
        <li className="flex flex-col items-center gap-1">
          <Truck className="w-4 h-4 text-zinc-800" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-800">Envíos 24hs</span>
          <span className="text-[9px] text-[#50524a]">Asunción e Interior</span>
        </li>
        <li className="flex flex-col items-center gap-1 border-x border-zinc-200 px-1">
          <ShieldCheck className="w-4 h-4 text-zinc-800" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-800">100% Auténtico</span>
          <span className="text-[9px] text-[#50524a]">Calidad Garantizada</span>
        </li>
        <li className="flex flex-col items-center gap-1">
          <RotateCcw className="w-4 h-4 text-zinc-800" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-800">30 Días Cambio</span>
          <span className="text-[9px] text-[#50524a]">Sin costo adicional</span>
        </li>
      </ul>

      {/* Accordions */}
      <div className="border-t border-zinc-200 pt-2">
        <Accordion
          id="detalles"
          title="Detalles y Composición"
          isOpen={openAccordion === 'detalles'}
          onToggle={toggleAccordion}
        >
          <p>• Confeccionado en algodón pesado de máxima densidad (400 GSM).</p>
          <p>• Corte oversize atelier con caída estructurada contemporánea.</p>
          <p>• Costuras reforzadas de alta tenacidad e hilos de algodón orgánico.</p>
          <p>• Lavado recomendado a mano o a máquina a 30°C. No usar blanqueadores.</p>
        </Accordion>

        <Accordion
          id="tallas"
          title="Guía de Tallaje Rápida"
          isOpen={openAccordion === 'tallas'}
          onToggle={toggleAccordion}
        >
          <p>• S: Pecho 104 cm | Largo 70 cm</p>
          <p>• M: Pecho 110 cm | Largo 72 cm</p>
          <p>• L: Pecho 116 cm | Largo 74 cm</p>
          <p>• XL: Pecho 122 cm | Largo 76 cm</p>
          <button
            type="button"
            onClick={openSizeGuide}
            className="mt-2 text-[11px] font-bold text-[#17191c] underline uppercase cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
          >
            Ver tabla de medidas completa →
          </button>
        </Accordion>

        <Accordion
          id="envios"
          title="Envíos & Devoluciones"
          isOpen={openAccordion === 'envios'}
          onToggle={toggleAccordion}
        >
          <p>• Envíos exprés a Asunción y Gran Asunción en menos de 24 horas.</p>
          <p>• Envíos al interior del país mediante encomienda garantizada (24 a 48hs).</p>
          <p>• Cambios permitidos hasta 30 días posteriores a la fecha de compra.</p>
        </Accordion>
      </div>

      {showSizeGuide && <SizeGuideModal activeSize={selectedSize} onClose={closeSizeGuide} />}
    </div>
  );
}

interface AccordionProps {
  id: AccordionKey;
  title: string;
  isOpen: boolean;
  onToggle: (id: AccordionKey) => void;
  children: React.ReactNode;
}

function Accordion({ id, title, isOpen, onToggle, children }: AccordionProps) {
  const panelId = `accordion-panel-${id}`;
  const buttonId = `accordion-button-${id}`;

  return (
    <div className="border-b border-zinc-200">
      <h2>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(id)}
          className="w-full min-h-12 py-4 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-[#17191c] cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
        >
          <span>{title}</span>
          <span className="text-base font-bold leading-none" aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </button>
      </h2>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="pb-4 text-xs text-zinc-600 space-y-2 leading-relaxed"
        >
          {children}
        </div>
      )}
    </div>
  );
}
