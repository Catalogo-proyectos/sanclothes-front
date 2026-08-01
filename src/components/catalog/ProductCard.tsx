'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { ShoppingBag, Heart } from 'lucide-react';
import { CatalogProduct } from '@/types/api';
import { formatCurrency } from '@/utils/format';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: CatalogProduct;
}

/**
 * SANCLOTHES Atelier Product Card Design:
 * Unified with Home page FeaturedProductsGrid.
 * 3:4 portrait aspect ratio, top badge, wishlist heart, hover backdrop-blur quick add overlay with size selector.
 *
 * Memoized: it renders inside grids of up to 8 cards ("También te puede interesar"),
 * and each card owns its own size/wishlist state — without memo, any one card's
 * state change re-renders every sibling card in the grid.
 */
function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const availableSizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : ['S', 'M', 'L', 'XL'];

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || 'S');

  const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
  const hoverImage = product.images?.[1]?.url || mainImage;
  const effectivePrice = product.discountPrice || product.price;

  const tagBadge = product.category
    ? `${product.category.toUpperCase()} ATELIER — CHROME`
    : 'CÁPSULA SPECIAL — LE SANTS';

  const fabricSubtitle = product.description
    ? product.description.split('.')[0].toUpperCase()
    : 'TEXTURA SUEDE & EMBROIDERED NOVA';

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
    toast.success(
      !isWishlisted
        ? `Añadido a tus favoritos: ${product.title}`
        : `Eliminado de tus favoritos: ${product.title}`
    );
  };

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
      image: mainImage,
      quantity: 1,
    });

    toast.success('¡AÑADIDO AL CARRITO!', {
      icon: <ShoppingBag className="w-4 h-4 text-white" />,
      description: `${product.title} · TALLE ${selectedSize} — ${formatCurrency(effectivePrice)}`,
    });
  };

  return (
    <div className="group flex flex-col justify-between transition-all duration-300">
      {/* Product Card Image Container */}
      <div
        className="relative aspect-[3/4] w-full bg-[#f6f6f6] border border-zinc-200 group-hover:border-black overflow-hidden mb-3 transition-all duration-300"
        style={{ borderRadius: '0px' }}
      >
        <Link href={`/products/${product.productId}`} className="relative block w-full h-full">
          <Image
            src={mainImage}
            alt={product.title}
            fill
            loading="lazy"
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1440px) 25vw, 340px"
            quality={75}
            className="object-cover object-center group-hover:opacity-0 transition-opacity duration-500 ease-out"
          />
          <Image
            src={hoverImage}
            alt={`${product.title} vista 2`}
            fill
            loading="lazy"
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1440px) 25vw, 340px"
            quality={75}
            className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Top-Left Tag Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="inline-block rounded-full bg-[#e3e1dc]/90 text-[#3a2d28] text-[11px] font-medium px-3.5 py-1 tracking-wide shadow-sm border border-black/5">
            {product.discountPrice ? 'Sale' : 'New In'}
          </span>
        </div>

        {/* Top-Right Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Agregar a favoritos"
          className="absolute top-1.5 right-1.5 z-10 w-10 h-10 flex items-center justify-center text-zinc-800 cursor-pointer transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
        >
          <Heart className={`w-5 h-5 stroke-[1.5] ${isWishlisted ? 'fill-black text-black' : ''}`} />
        </button>

        {/* Hover Quick Add Overlay Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/90 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 z-20">
          {/* Sizes Selector */}
          <div className="flex items-center justify-center gap-1">
            {availableSizes.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`text-[10px] font-mono font-bold w-9 h-9 flex items-center justify-center transition-colors border cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-zinc-300 border-zinc-700 hover:border-white'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  {sz}
                </button>
              );
            })}
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-white text-black hover:bg-zinc-200 text-[10px] font-mono font-bold tracking-[0.2em] uppercase py-2 flex items-center justify-center gap-2 border border-white transition-colors cursor-pointer"
            style={{ borderRadius: '0px' }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>AÑADIR AL CARRITO</span>
          </button>
        </div>
      </div>

      {/* Metadata Below Card */}
      <div className="flex flex-col gap-1 px-1">
        <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase truncate">
          {fabricSubtitle}
        </span>
        <Link href={`/products/${product.productId}`}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-black leading-tight group-hover:underline">
            {product.title}
          </h3>
        </Link>
        {/* Wraps instead of overflowing: at 320px the price + size labels don't
            fit on one line inside a 2-column grid cell. */}
        <div className="flex items-baseline justify-between gap-x-2 gap-y-0.5 mt-0.5 flex-wrap">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-mono font-bold text-black tabular-nums">
              {formatCurrency(effectivePrice)}
            </span>
            {product.discountPrice && (
              <span className="text-[11px] font-mono text-zinc-500 line-through tabular-nums">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
            TALLES: {selectedSize}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
