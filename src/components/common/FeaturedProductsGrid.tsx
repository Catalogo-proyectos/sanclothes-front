'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, ShoppingBag, ArrowRight } from 'lucide-react';
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
    image: '/img/hero/IMG_3202.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'le-sants-suede-set',
    tag: 'CÁPSULA SPECIAL — LE SANT',
    name: 'LE SANT CLUB SUEDE TRACKSUIT',
    fabric: 'TEXTURA SUEDE & EMBROIDERED NOVA',
    price: 390000,
    priceFormatted: '₲ 390.000',
    image: '/img/hero/IMG_4390.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'brown-heavy-pants',
    tag: 'CORE ESSENTIALS',
    name: 'BROWN HEAVYWEIGHT TRACKPANTS',
    fabric: '400G FRISO HEAVYWEIGHT · RELAXED FIT',
    price: 240000,
    priceFormatted: '₲ 240.000',
    image: '/img/hero/IMG_3148.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'santclub-metallic-tee',
    tag: 'WOMEN — CHROME',
    name: 'SANTCLUB METALLIC SCRIPT TEE',
    fabric: '240G ALGODÓN PEINADO · SILVER PRINT',
    price: 170000,
    priceFormatted: '₲ 170.000',
    image: '/img/hero/IMG_1460.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'varsity-jacket-supra',
    tag: 'LIMITED DROP — VARSITY',
    name: 'SANT CLOTHES VARSITY JACKET',
    fabric: 'APLIQUÉ EMBROIDERED & COLD WOOL',
    price: 420000,
    priceFormatted: '₲ 420.000',
    image: '/img/hero/IMG_2996.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'zip-santis-club',
    tag: 'SANT DROP',
    name: 'SANTIS CLUB HALF-ZIP SWEATER',
    fabric: '400G COTTON HEAVYWEIGHT · BROWN',
    price: 340000,
    priceFormatted: '₲ 340.000',
    image: '/img/hero/IMG_2334.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'casual-linen-shirt',
    tag: 'SUMMER SANT',
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
    name: 'SANT GRAFFITI BACK PRINT TEE',
    fabric: '240G ALGODÓN HEAVYWEIGHT · GRAPHIC',
    price: 180000,
    priceFormatted: '₲ 180.000',
    image: '/img/secciones/IMG_4279.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
];

export default function FeaturedProductsGrid() {
  const { addItem } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

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
    <section className="w-full bg-[#f6f8f9] text-[#17191c] py-20 px-6 sm:px-12 border-b border-[#17191c]/10">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-[#17191c]/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-[#17191c]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-600">
                DROP EXCLUSIVO SANT CLOTHES
              </span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-none text-[#17191c]"
            >
              PRENDAS DESTACADAS — CÁPSULA SANT
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

        {/* 8 Products Grid (4 columns × 2 rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_GRID_PRODUCTS.map((product, idx) => {
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
                  className="relative aspect-[3/4] w-full bg-[#101214] border border-white/10 group-hover:border-white/40 overflow-hidden mb-2.5 transition-all duration-300"
                  style={{ borderRadius: '0px' }}
                >
                  {/* Garment Image */}
                  <div className="relative w-full h-full p-4 flex items-center justify-center">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      quality={80}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                </div>

                {/* ── LOWER CONTENT AREA: TITLE & PRICE / REPLACED BY SIZES & CART ON HOVER ── */}
                <div className="relative min-h-[105px] px-1 flex flex-col justify-between overflow-hidden">
                  {/* 1. DEFAULT CONTENT (Title, Subtitle & Price) — Fades out on hover */}
                  <div className="flex flex-col gap-1 transition-all duration-300 ease-out group-hover:opacity-0 group-hover:pointer-events-none group-hover:-translate-y-2">
                    <span className="text-[9px] font-mono font-bold tracking-[0.18em] text-zinc-600 uppercase truncate">
                      {product.fabric}
                    </span>

                    <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#17191c] leading-snug line-clamp-2">
                      {product.name}
                    </h3>

                    <span className="text-xs font-mono font-bold text-[#17191c] tabular-nums mt-0.5">
                      {product.priceFormatted}
                    </span>
                  </div>

                  {/* 2. HOVER QUICK ADD PANEL — Fades & slides in where the title was! */}
                  <div className="absolute inset-0 z-20 bg-white text-[#17191c] p-2.5 flex flex-col justify-between opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out translate-y-2 group-hover:translate-y-0 shadow-xl border border-zinc-200">
                    {/* Sizes Selector */}
                    <div className="flex items-center justify-center gap-1.5">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={(e) => handleSizeSelect(product.id, sz, e)}
                          className={`text-[11px] font-mono font-bold flex-1 h-8 flex items-center justify-center transition-colors border cursor-pointer ${
                            currentSize === sz
                              ? 'bg-[#17191c] text-white border-[#17191c] shadow-2xs'
                              : 'bg-transparent text-[#17191c] border-zinc-300 hover:border-black'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>

                    {/* Add to Cart Button */}
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
