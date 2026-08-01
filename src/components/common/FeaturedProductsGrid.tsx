'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

export interface GridProduct {
  id: string;
  tag: string;
  name: string;
  fabric: string;
  price: number;
  priceFormatted: string;
  image: string;
  sizes: string[];
}

const FEATURED_GRID_PRODUCTS: GridProduct[] = [
  {
    id: 'brown-hoodie-arts',
    tag: 'LIMITED DROP — 400G FRISO',
    name: 'SANT CLOTHES BROWN HOODIE',
    fabric: 'ARTS THROUGH GARMENTS — BACK PRINT',
    price: 280000,
    priceFormatted: '₲ 280.000',
    image: '/img/products/brown-hoodie-set.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'le-sants-suede-set',
    tag: 'CÁPSULA SPECIAL — LE SANTS',
    name: 'LE SANTS CLUB SUEDE TRACKSUIT',
    fabric: 'TEXTURA SUEDE & EMBROIDERED NOVA',
    price: 390000,
    priceFormatted: '₲ 390.000',
    image: '/img/products/black-suede-tracksuit.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'brown-heavy-pants',
    tag: 'CORE ESSENTIALS',
    name: 'BROWN HEAVYWEIGHT TRACKPANTS',
    fabric: '400G FRISO HEAVYWEIGHT · RELAXED FIT',
    price: 240000,
    priceFormatted: '₲ 240.000',
    image: '/img/products/brown-pants-set.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'santclub-metallic-tee',
    tag: 'WOMEN ATELIER — CHROME',
    name: 'SANTCLUB METALLIC SCRIPT TEE',
    fabric: '240G ALGODÓN PEINADO · SILVER PRINT',
    price: 170000,
    priceFormatted: '₲ 170.000',
    image: '/img/products/santclub-metallic-tee.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'varsity-jacket-supra',
    tag: 'LIMITED DROP — VARSITY',
    name: 'SANTS CLOTHES VARSITY JACKET',
    fabric: 'APLIQUÉ EMBROIDERED & COLD WOOL',
    price: 420000,
    priceFormatted: '₲ 420.000',
    image: '/img/products/varsity-flat.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'zip-santis-club',
    tag: 'ATELIER DROP',
    name: 'SANTIS CLUB HALF-ZIP SWEATER',
    fabric: '400G COTTON HEAVYWEIGHT · BROWN',
    price: 340000,
    priceFormatted: '₲ 340.000',
    image: '/img/products/zip-santis.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'casual-linen-shirt',
    tag: 'SUMMER ATELIER',
    name: 'BEIGE OVERSIZED CASUAL SHIRT',
    fabric: 'LINO & ALGODÓN PREMIUM · RELAXED FIT',
    price: 220000,
    priceFormatted: '₲ 220.000',
    image: '/img/products/camisa-oversized-beige/IMG_5382.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'street-graffiti-tee',
    tag: 'STREET ART DROP',
    name: 'SANTS GRAFFITI BACK PRINT TEE',
    fabric: '240G ALGODÓN HEAVYWEIGHT · GRAPHIC',
    price: 180000,
    priceFormatted: '₲ 180.000',
    image: '/img/products/tee-graffiti.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
];

export default function FeaturedProductsGrid() {
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.success(wishlist[id] ? 'QUITADO DE FAVORITOS' : 'AGREGADO A FAVORITOS', {
      description: 'CÁPSULA SANTS CLOTHES',
    });
  };

  const handleSizeSelect = (productId: string, size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: GridProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const chosenSize = selectedSizes[product.id] || product.sizes[0];

    addItem({
      variantId: `${product.id}-${chosenSize}`,
      productId: product.id,
      productName: product.name,
      sku: `SKU-${product.id}-${chosenSize}`,
      size: chosenSize,
      cut: 'UNISEX',
      unitPrice: product.price,
      image: product.image,
      quantity: 1,
    });

    toast.success('¡AÑADIDO AL CARRITO!', {
      description: `${product.name} · TALLE ${chosenSize}`,
    });
  };

  return (
    <section className="w-full bg-[#f6f8f9] text-[#17191c] py-20 px-6 sm:px-12 border-b border-[#b6b2a7]/40">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-[#17191c]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#50524a]">
                DROP EXCLUSIVO SANTS ATELIER
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-none text-[#17191c]">
              PRENDAS DESTACADAS — CÁPSULA ATELIER
            </h2>
          </div>

          <Link
            href="/catalog"
            className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#17191c] hover:text-[#50524a] transition-colors inline-flex items-center gap-2 border-b-2 border-[#17191c] pb-1 self-start md:self-end"
          >
            <span>VER TODO EL CATÁLOGO</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 8 Products Grid (4 columns × 2 rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_GRID_PRODUCTS.map((product, idx) => {
            const isFav = !!wishlist[product.id];
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
                {/* Product Card Image Container */}
                <div
                  className="relative aspect-[3/4] w-full bg-[#f6f6f6] border border-zinc-200 group-hover:border-black overflow-hidden mb-4 transition-all duration-300"
                  style={{ borderRadius: '0px' }}
                >
                  {/* Top-Left Tag Badge */}
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="inline-block rounded-full bg-[#e3e1dc]/90 text-[#3a2d28] text-[11px] font-medium px-3.5 py-1 tracking-wide shadow-sm border border-black/5">
                      New In
                    </span>
                  </div>

                  {/* Top-Right Wishlist Button */}
                  <button
                    onClick={(e) => toggleWishlist(product.id, e)}
                    aria-label="Agregar a favoritos"
                    className="absolute top-3 right-3 z-10 text-zinc-800 hover:text-black hover:scale-110 transition-all p-1 cursor-pointer"
                  >
                    <Heart className={`w-5 h-5 stroke-[1.5] ${isFav ? 'fill-black text-black' : ''}`} />
                  </button>

                  {/* Garment Image */}
                  <div className="relative w-full h-full p-4 flex items-center justify-center">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      quality={80}
                      // Rejilla 1 / 2 / 4 columnas dentro de max-w-[1440px].
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>

                  {/* Hover Quick Add Overlay Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/90 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 z-20">
                    {/* Sizes Selector */}
                    <div className="flex items-center justify-center gap-1">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={(e) => handleSizeSelect(product.id, sz, e)}
                          className={`text-[10px] font-mono font-bold w-7 h-7 flex items-center justify-center transition-colors border cursor-pointer ${
                            currentSize === sz
                              ? 'bg-white text-black border-white'
                              : 'bg-transparent text-zinc-300 border-zinc-700 hover:border-white'
                          }`}
                          style={{ borderRadius: '0px' }}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
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
                  <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                    {product.fabric}
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black leading-tight group-hover:underline">
                    {product.name}
                  </h3>
                  <span className="text-xs font-mono font-bold text-black mt-0.5">
                    {product.priceFormatted}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
