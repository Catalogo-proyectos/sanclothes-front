'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Heart, ShoppingBag } from 'lucide-react';
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
    tag: 'CÁPSULA SPECIAL — LE SANTS',
    name: 'LE SANTS CLUB SUEDE JACKET',
    fabric: 'TEXTURA SUEDE & EMBROIDERED NOVA',
    price: 390000,
    priceFormatted: '₲ 390.000',
    image: '/img/products/black-suede-tracksuit.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'varsity-jacket-supra',
    tag: 'LIMITED DROP — VARSITY',
    name: 'SANTS CLOTHES VARSITY JACKET',
    fabric: 'APLIQUÉ EMBROIDERED & COLD WOOL',
    price: 420000,
    priceFormatted: '₲ 420.000',
    image: '/img/products/varsity-flat.png',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'zip-santis-club',
    tag: 'ATELIER DROP',
    name: 'SANTIS CLUB HALF-ZIP SWEATER',
    fabric: '400G COTTON HEAVYWEIGHT · BROWN',
    price: 340000,
    priceFormatted: '₲ 340.000',
    image: '/img/products/zip-santis.png',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'brown-hoodie-heavy',
    tag: 'CORE ESSENTIALS',
    name: 'SANT CLOTHES HEAVYWEIGHT HOODIE',
    fabric: '400G FRISO HEAVYWEIGHT · BACK PRINT',
    price: 280000,
    priceFormatted: '₲ 280.000',
    image: '/img/products/brown-hoodie-set.jpg',
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
      description: 'CÁPSULA SANTS CLOTHES — CAMPERAS',
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
              className="relative w-full h-full min-h-[580px] lg:min-h-full bg-[#17191c] overflow-hidden border border-[#b6b2a7] group flex flex-col justify-between"
              style={{ borderRadius: '0px' }}
            >
              {/* Background Campaign Image */}
              <Image
                src="/img/hero/IMG_2996.jpg"
                alt="SANTS CLOTHES — Colección Camperas & Chaquetas"
                fill
                priority
                quality={95}
                className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />

              {/* Gradient Vignette for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 pointer-events-none" />

              {/* Top Tag Badge */}
              <div className="relative z-10 p-6 sm:p-8">
                <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.25em] text-white bg-black/80 backdrop-blur-md px-3.5 py-1.5 uppercase border border-white/20">
                  <Flame className="w-3.5 h-3.5 text-white" />
                  <span>COLECCIÓN CAMPERAS · ATELIER DROP</span>
                </span>
              </div>

              {/* Bottom Content Overlay */}
              <div className="relative z-10 p-6 sm:p-10 space-y-4 text-white">
                <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] tracking-wider uppercase leading-none text-white drop-shadow-md">
                  CAMPERAS & CHAQUETAS — SANTS ATELIER
                </h2>

                <p className="text-xs font-mono tracking-wide uppercase text-zinc-300 leading-relaxed max-w-lg">
                  CONFECCIONADAS CON MATERIALES PESADOS, TEXTURAS SUEDE Y BORDADOS ATELIER. SILUETAS RELAJADAS Y ACABADOS DE ALTA DURABILIDAD.
                </p>

                <div className="pt-2">
                  <Link
                    href="/catalog?category=old-money"
                    className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 text-[11px] font-mono font-extrabold tracking-[0.2em] uppercase px-7 py-3.5 border border-white transition-all duration-300 shadow-xl group/btn"
                    style={{ borderRadius: '0px' }}
                  >
                    <span>VER COLECCIÓN CAMPERAS</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Link>
                </div>
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
                    <div
                      className="relative aspect-[3/4] w-full bg-[#f6f6f6] border border-zinc-200 group-hover:border-black overflow-hidden mb-3 transition-all duration-300"
                      style={{ borderRadius: '0px' }}
                    >
                      {/* Top-Left Tag */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-black bg-white px-2.5 py-1 border border-zinc-200 shadow-sm">
                          {product.tag}
                        </span>
                      </div>

                      {/* Top-Right Wishlist Button */}
                      <button
                        onClick={(e) => toggleWishlist(product.id, e)}
                        aria-label="Agregar a favoritos"
                        className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm border border-zinc-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all shadow-sm"
                        style={{ borderRadius: '0px' }}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-black text-black' : ''}`} />
                      </button>

                      {/* Garment Image */}
                      <div className="relative w-full h-full p-4 flex items-center justify-center">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          quality={95}
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      </div>

                      {/* Hover Quick Add Overlay Bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/90 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 z-20">
                        {/* Sizes selector */}
                        <div className="flex items-center justify-center gap-1">
                          {product.sizes.map((sz) => (
                            <button
                              key={sz}
                              onClick={(e) => handleSizeSelect(product.id, sz, e)}
                              className={`text-[10px] font-mono font-bold w-7 h-7 flex items-center justify-center transition-colors border ${
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
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black leading-tight group-hover:underline">
                        {product.name}
                      </h3>
                      <span className="text-xs font-mono font-bold text-black mt-0.5">
                        {product.priceFormatted}
                      </span>
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
