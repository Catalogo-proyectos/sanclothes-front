'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { heroSlot } from '@/lib/images/slots';
import { formatCurrency } from '@/utils/format';
import type { CatalogProduct, ProductVariant } from '@/types/api';
import type { CartItem } from '@/types/cart';


const GRID_CAPACITY = 8;

export interface GridProduct {
  id: string;
  tag: string;
  name: string;
  fabric: string;
  price: number;
  priceFormatted: string;
  image: string;
  imageAlt: string;
  sizes: string[];
  variants: ProductVariant[];
}



export function toGridProduct(product: CatalogProduct): GridProduct {
  const effectivePrice = product.discountPrice ?? product.price;
  const image = heroSlot(product.images ?? []);

  return {
    id: product.productId,
    tag: product.badge || (product.isLimitedDrop ? 'LIMITED DROP' : product.category.toUpperCase()),
    name: product.title,
    fabric: product.description
      ? product.description.split('.')[0].toUpperCase()
      : product.category.toUpperCase(),
    price: effectivePrice,
    priceFormatted: formatCurrency(effectivePrice),
    image: image.url,
    imageAlt: image.alt,
    sizes: product.sizes?.length ? product.sizes.slice(0, 4) : ['S', 'M', 'L', 'XL'],
    variants: product.variants ?? [],
  };
}

/** Ítem de carrito para una tarjeta de producto real (usa la variante real del talle). */
export function toCartItem(product: GridProduct, size: string): CartItem {
  const variant = product.variants.find((v) => v.size === size);
  return {
    variantId: variant?.variantId ?? `${product.id}-${size}`,
    productId: product.id,
    productName: product.name,
    sku: variant?.sku ?? `${product.id}-${size}`,
    size,
    cut: variant?.cut ?? 'UNISEX',
    unitPrice: product.price,
    image: product.image,
    quantity: 1,
    maxStock: variant?.stock,
  };
}


interface FeaturedProductsGridProps {
  products: CatalogProduct[];
}

export default function FeaturedProductsGrid({ products }: FeaturedProductsGridProps) {
  const { addItem } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const gridProducts = products.slice(0, GRID_CAPACITY).map(toGridProduct);

  const handleSizeSelect = (productId: string, size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: GridProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const chosenSize = selectedSizes[product.id] || product.sizes[0];

    addItem(toCartItem(product, chosenSize));

    toast.success('¡AÑADIDO AL CARRITO!', {
      description: `${product.name} · TALLE ${chosenSize}`,
    });
  };



  if (gridProducts.length === 0) return null;

  return (
    <section className="w-full bg-[#f6f8f9] text-[#17191c] py-20 px-6 sm:px-12 border-b border-[#17191c]/10">
      <div className="max-w-[1440px] mx-auto">


        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-[#17191c]/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-[#17191c]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-600">
                DROP SANT CLOTHES
              </span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-none text-[#17191c]"
            >
              PRENDAS DESTACADAS
            </motion.h2>
          </div>

          <Link
            href="/catalog"
            className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#17191c] hover:opacity-70 transition-opacity inline-flex items-center gap-2 border-b-2 border-[#17191c] pb-1 self-start md:self-end"
          >
            <span>VER TODO EL CATÁLOGO</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gridProducts.map((product, idx) => {
            const currentSize = selectedSizes[product.id] || product.sizes[0];

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 4) * 0.08 }}
                className="group flex flex-col justify-between transition-all duration-300"
              >

                <Link
                  href={`/products/${product.id}`}
                  aria-label={`Ver precompra de ${product.name}`}
                  className="relative block aspect-[3/4] w-full bg-[#101214] border border-white/10 group-hover:border-white/40 overflow-hidden mb-2.5 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
                  style={{ borderRadius: '0px' }}
                >
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    quality={80}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </Link>


                <div className="relative min-h-[105px] px-1 flex flex-col justify-between overflow-hidden">

                  <Link
                    href={`/products/${product.id}`}
                    aria-label={`Ver precompra de ${product.name}`}
                    className="flex flex-col gap-1 transition-all duration-300 ease-out group-hover:opacity-0 group-hover:pointer-events-none group-hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
                  >
                    <span className="text-[9px] font-mono font-bold tracking-[0.18em] text-zinc-600 uppercase truncate">
                      {product.fabric}
                    </span>

                    <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#17191c] leading-snug line-clamp-2">
                      {product.name}
                    </h3>

                    <span className="text-xs font-mono font-bold text-[#17191c] tabular-nums mt-0.5">
                      {product.priceFormatted}
                    </span>
                  </Link>


                  <div className="absolute inset-0 z-20 bg-white text-[#17191c] p-2.5 flex flex-col justify-between opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out translate-y-2 group-hover:translate-y-0 shadow-xl border border-zinc-200">

                    <div className="flex items-center justify-center gap-1.5">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={(e) => handleSizeSelect(product.id, sz, e)}
                          className={`text-[11px] font-mono font-bold flex-1 h-8 flex items-center justify-center transition-colors border cursor-pointer ${currentSize === sz
                            ? 'bg-[#17191c] text-white border-[#17191c] shadow-2xs'
                            : 'bg-transparent text-[#17191c] border-zinc-300 hover:border-black'
                            }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>


                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full h-9 bg-[#17191c] text-white hover:bg-zinc-800 text-[11px] font-[family-name:var(--font-bebas)] tracking-[0.12em] uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.98]"
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                      <span>AÑADIR AL CARRITO</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
