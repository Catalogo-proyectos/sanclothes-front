'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, ShoppingBag } from 'lucide-react';
import { CatalogProduct } from '@/types/api';
import { formatCurrency } from '@/utils/format';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: CatalogProduct;
}

/**
 * Scuffers-inspired Magazine Product Card:
 * 3:4 portrait aspect ratio, 0px border radius, flat box-shadow none.
 * Clean inline title and price, dual-image hover transition, Sonner toast quick add.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);

  const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
  const hoverImage = product.images?.[1]?.url || mainImage;
  const effectivePrice = product.discountPrice || product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultVariant = product.variants?.[0] || {
      variantId: `var_${product.productId}_default`,
      sku: `${product.slug}-DEFAULT`,
      size: product.sizes[0] || 'M',
      cut: product.cuts[0] || 'UNISEX',
      price: effectivePrice,
    };

    addItem({
      variantId: defaultVariant.variantId,
      productId: product.productId,
      productName: product.title,
      sku: defaultVariant.sku,
      size: defaultVariant.size,
      cut: defaultVariant.cut,
      unitPrice: effectivePrice,
      image: mainImage,
      quantity: 1,
    });

    toast.success(`AÑADIDO AL CARRITO: ${product.title}`, {
      icon: <ShoppingBag className="w-4 h-4 text-white" />,
      description: `TALLE: ${defaultVariant.size} — ${formatCurrency(effectivePrice)}`,
    });
  };

  return (
    <div className="group flex flex-col bg-white overflow-hidden shadow-none rounded-none border-none">
      {/* 3:4 Aspect Portrait Image Container with Dual Image Hover */}
      <Link
        href={`/products/${product.productId}`}
        className="relative block aspect-[3/4] overflow-hidden bg-zinc-100 border border-transparent group-hover:border-zinc-200 transition-colors"
      >
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

        {/* Scuffers Minimal "NEW IN" / Status Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
          {product.discountPrice ? (
            <span
              className="text-[9px] font-black tracking-[0.2em] uppercase text-white bg-black px-2 py-0.5"
              style={{ borderRadius: '0px' }}
            >
              SALE
            </span>
          ) : (
            <span
              className="text-[9px] font-black tracking-[0.2em] uppercase text-black bg-white px-2 py-0.5 border border-black/10"
              style={{ borderRadius: '0px' }}
            >
              NEW IN
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          aria-label={`Agregar ${product.title} al carrito`}
          className="absolute bottom-2.5 right-2.5 z-10 w-9 h-9 bg-white text-black hover:bg-black hover:text-white flex items-center justify-center transition-all duration-200 border border-black/20 group/btn"
          style={{ borderRadius: '0px' }}
        >
          <Plus className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-90" />
        </button>
      </Link>

      {/* Product Metadata */}
      <div className="pt-2.5 pb-1 flex items-baseline justify-between gap-2 text-zinc-950">
        <Link href={`/products/${product.productId}`} className="flex-1 min-w-0">
          <h3 className="text-[12px] font-medium uppercase tracking-tight truncate leading-tight hover:opacity-60 transition-opacity">
            {product.title}
          </h3>
        </Link>

        <div className="text-right shrink-0">
          {product.discountPrice ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[12px] font-semibold text-black">{formatCurrency(product.discountPrice)}</span>
              <span className="text-[11px] font-normal text-zinc-400 line-through">{formatCurrency(product.price)}</span>
            </div>
          ) : (
            <span className="text-[12px] font-medium text-black">{formatCurrency(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
