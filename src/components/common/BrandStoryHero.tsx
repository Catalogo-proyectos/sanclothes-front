'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface JacketProduct {
  id: string;
  tag: string;
  name: string;
  fabric: string;
  price: number;
  priceFormatted: string;
  image: string;
  sizes: string[];
}

const JACKET_PRODUCTS: JacketProduct[] = [
  {
    id: 'suede-tracksuit-jacket',
    tag: 'CÁPSULA SPECIAL — LE SANT',
    name: 'LE SANT CLUB SUEDE JACKET',
    fabric: 'TEXTURA SUEDE & EMBROIDERED NOVA',
    price: 390000,
    priceFormatted: '₲ 390.000',
    image: '/img/Placeholer.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'varsity-jacket-supra',
    tag: 'LIMITED DROP — VARSITY',
    name: 'SANT CLOTHES VARSITY JACKET',
    fabric: 'APLIQUÉ EMBROIDERED & COLD WOOL',
    price: 420000,
    priceFormatted: '₲ 420.000',
    image: '/img/Placeholer.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'zip-santis-club',
    tag: 'SANT DROP',
    name: 'SANT CLUB HALF-ZIP SWEATER',
    fabric: '400G COTTON HEAVYWEIGHT · BROWN',
    price: 340000,
    priceFormatted: '₲ 340.000',
    image: '/img/Placeholer.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'brown-hoodie-heavy',
    tag: 'CORE ESSENTIALS',
    name: 'SANT CLOTHES HEAVYWEIGHT HOODIE',
    fabric: '400G FRISO HEAVYWEIGHT · BACK PRINT',
    price: 280000,
    priceFormatted: '₲ 280.000',
    image: '/img/Placeholer.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
  },
];

export default function BrandStoryHero() {
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.success(wishlist[id] ? 'QUITADO DE FAVORITOS' : 'AGREGADO A FAVORITOS', {
      description: 'CÁPSULA SANT CLOTHES — CAMPERAS',
    });
  };

  const handleSizeSelect = (productId: string, size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: JacketProduct, e: React.MouseEvent) => {
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
    <section className="w-full bg-[#f6f8f9] text-[#17191c] py-12 sm:py-16 px-4 sm:px-8 border-b border-[#b6b2a7]/40">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
          
          {/* ── LEFT SIDE: Hero Campaign Banner (IMG_2996.jpg - Camperas & Chaquetas) ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 flex flex-col h-full"
          >
            <div
              className="relative w-full h-full min-h-[580px] lg:min-h-full bg-[#17191c] overflow-hidden border border-[#b6b2a7] group flex flex-col justify-end"
              style={{ borderRadius: '0px' }}
            >
              {/* Background Campaign Image */}
              <Image
                src="/img/hero/IMG_2996.webp"
                alt="SANT CLOTHES — Colección Camperas & Chaquetas"
                fill
                quality={80}
                // Mitad izquierda de una rejilla de 12 columnas dentro de un
                // contenedor de 1440px; a pantalla completa nunca pasa de 720px.
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />

              {/* Gradient Vignette for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 pointer-events-none" />

              {/* Bottom Content Overlay */}
              <div className="relative z-10 p-6 sm:p-10 space-y-4 text-white">
                <motion.h2
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] tracking-wider uppercase leading-none text-white drop-shadow-md"
                >
                  CAMPERAS & CHAQUETAS — SANT CLOTHES
                </motion.h2>

                <p className="text-xs font-mono tracking-wide uppercase text-zinc-300 leading-relaxed max-w-lg">
                  CONFECCIONADAS CON MATERIALES PESADOS, TEXTURAS SUEDE Y BORDADOS DE ALTA PRECISIÓN. SILUETAS RELAJADAS Y ACABADOS DE ALTA DURABILIDAD.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT SIDE: 4 Product Cards in 2x2 Grid (Exact Signature "Nuevas Prendas Destacadas" Style) ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 flex flex-col justify-between"
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
              {JACKET_PRODUCTS.map((product) => {
                const isFav = !!wishlist[product.id];
                const currentSize = selectedSizes[product.id] || product.sizes[0];

                return (
                  <div key={product.id} className="group flex flex-col justify-between transition-all duration-300">
                    {/* Presentation Card Container */}
                    <Link
                      href={`/products/${product.id}`}
                      aria-label={`Ver precompra de ${product.name}`}
                      className="relative block aspect-[3/4] w-full bg-[#f6f6f6] border border-zinc-200 group-hover:border-black overflow-hidden mb-2.5 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
                      style={{ borderRadius: '0px' }}
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        quality={80}
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </Link>

                    {/* ── LOWER CONTENT AREA: TITLE & PRICE / REPLACED BY SIZES & CART ON HOVER ── */}
                    <div className="relative min-h-[105px] px-1 flex flex-col justify-between overflow-hidden">
                      {/* 1. DEFAULT CONTENT (Title, Subtitle & Price) — Fades out on hover */}
                      <Link
                        href={`/products/${product.id}`}
                        aria-label={`Ver precompra de ${product.name}`}
                        className="flex flex-col gap-1 transition-all duration-300 ease-out group-hover:opacity-0 group-hover:pointer-events-none group-hover:-translate-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]"
                      >
                        <span className="text-[9px] font-mono font-bold tracking-[0.18em] text-zinc-500 uppercase truncate">
                          {product.fabric}
                        </span>

                        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-[#17191c] leading-snug line-clamp-2">
                          {product.name}
                        </h3>

                        <span className="text-xs font-mono font-bold text-[#17191c] tabular-nums mt-0.5">
                          {product.priceFormatted}
                        </span>
                      </Link>

                      {/* 2. HOVER QUICK ADD PANEL — Fades & slides in where the title was! */}
                      <div className="absolute inset-0 z-20 bg-[#17191c] text-white p-2.5 flex flex-col justify-between opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out translate-y-2 group-hover:translate-y-0 shadow-lg">
                        {/* Sizes Selector */}
                        <div className="flex items-center justify-center gap-1.5">
                          {product.sizes.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={(e) => handleSizeSelect(product.id, sz, e)}
                              className={`text-[11px] font-mono font-bold flex-1 h-8 flex items-center justify-center transition-colors border cursor-pointer ${
                                currentSize === sz
                                  ? 'bg-white text-black border-white shadow-2xs'
                                  : 'bg-transparent text-zinc-300 border-zinc-700 hover:border-white'
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
                          className="w-full h-9 bg-white text-black hover:bg-zinc-200 text-[11px] font-[family-name:var(--font-bebas)] tracking-[0.12em] uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.98]"
                        >
                          <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                          <span>AÑADIR AL CARRITO</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
