'use client';

import { useState } from 'react';
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
 * Le Sants Atelier Product Card Design:
 * Top Capsule badge, Wishlist Heart, Black Quick-Add Bar with S/M/L/XL size selector & full-width button,
 * Subtitle eyebrow, underlined bold title, and price/talles metadata.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const availableSizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : ['S', 'M', 'L', 'XL'];

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || 'S');

  const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
  const hoverImage = product.images?.[1]?.url || mainImage;
  const effectivePrice = product.discountPrice || product.price;

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

    toast.success(`AÑADIDO AL CARRITO: ${product.title}`, {
      icon: <ShoppingBag className="w-4 h-4 text-white" />,
      description: `TALLE: ${selectedSize} — ${formatCurrency(effectivePrice)}`,
    });
  };

  const subtitleText = product.category
    ? `TEXTURA ${product.category.toUpperCase()} & EMBROIDERED NOVA`
    : 'TEXTURA SUEDE & EMBROIDERED NOVA';

  return (
    <div className="group flex flex-col bg-[#f6f8f9] overflow-hidden shadow-none rounded-none border-none">
      {/* 1. Main Portrait Image Container */}
      <div className="relative block aspect-[3/4] overflow-hidden bg-zinc-100 border border-transparent group-hover:border-zinc-300 transition-colors">
        <Link href={`/products/${product.productId}`} className="block w-full h-full">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:opacity-0 transition-opacity duration-500 ease-out absolute inset-0"
          />
          <img
            src={hoverImage}
            alt={`${product.title} vista 2`}
            className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Top Left Capsule Badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="inline-block bg-white text-black text-[9px] sm:text-[10px] font-black tracking-[0.18em] uppercase px-2.5 py-1 border border-black/10 shadow-sm">
            CÁPSULA SPECIAL — LE SANTS
          </span>
        </div>

        {/* Top Right Wishlist Heart Icon Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Agregar a favoritos"
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-white text-black hover:bg-black hover:text-white flex items-center justify-center border border-black/10 transition-colors duration-200 shadow-sm cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 stroke-[2] transition-colors ${
              isWishlisted ? 'fill-black text-black' : ''
            }`}
          />
        </button>
      </div>

      {/* 2. Black Quick-Add & Size Selector Panel */}
      <div className="bg-black text-white p-3 sm:p-3.5 flex flex-col gap-2.5">
        {/* Size Selector Row */}
        <div className="flex items-center justify-center gap-2">
          {availableSizes.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs font-black tracking-wider transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black border border-white'
                    : 'bg-black text-white border border-white/30 hover:border-white'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>

        {/* Full-width Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-white text-black hover:bg-zinc-100 font-extrabold text-[11px] sm:text-xs tracking-[0.16em] uppercase py-2.5 px-4 flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
          <span>AÑADIR AL CARRITO</span>
        </button>
      </div>

      {/* 3. Card Footer Info */}
      <div className="pt-3 pb-1 flex flex-col">
        {/* Subtitle / Eyebrow */}
        <p className="text-[10px] font-bold tracking-[0.18em] text-zinc-500 uppercase leading-none mb-1">
          {subtitleText}
        </p>

        {/* Product Title */}
        <Link href={`/products/${product.productId}`}>
          <h3 className="text-sm sm:text-[15px] font-black tracking-wide text-zinc-950 uppercase leading-snug hover:opacity-75 transition-opacity underline decoration-1 underline-offset-4 mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Price & Size Metadata Row */}
        <div className="flex items-baseline justify-between gap-2 mt-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-extrabold text-zinc-950 tracking-wider">
              {formatCurrency(effectivePrice)}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            TALLES: {selectedSize}
          </span>
        </div>
      </div>
    </div>
  );
}
