'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

export interface StudioProduct {
  id: string;
  tag: string;
  name: string;
  fabric: string;
  price: number;
  priceFormatted: string;
  image: string;
  category: string;
  sizes: string[];
}

const CAROUSEL_PRODUCTS: StudioProduct[] = [
  {
    id: 'brown-hoodie-arts',
    tag: 'LIMITED DROP — 400G FRISO',
    name: 'SANT CLOTHES BROWN HOODIE',
    fabric: 'ARTS THROUGH GARMENTS — BACK PRINT',
    price: 280000,
    priceFormatted: '₲ 280.000',
    image: '/img/Placeholer.jpeg',
    category: 'Streetwear',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'le-sants-suede-set',
    tag: 'CÁPSULA SPECIAL — LE SANT',
    name: 'LE SANT CLUB SUEDE TRACKSUIT',
    fabric: 'TEXTURA SUEDE & EMBROIDERED NOVA',
    price: 390000,
    priceFormatted: '₲ 390.000',
    image: '/img/Placeholer.jpeg',
    category: 'Old Money',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'brown-heavy-pants',
    tag: 'CORE ESSENTIALS',
    name: 'BROWN HEAVYWEIGHT TRACKPANTS',
    fabric: '400G FRISO HEAVYWEIGHT · RELAXED FIT',
    price: 240000,
    priceFormatted: '₲ 240.000',
    image: '/img/Placeholer.jpeg',
    category: 'Casual',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'santclub-metallic-tee',
    tag: 'WOMEN — CHROME',
    name: 'SANTCLUB METALLIC SCRIPT TEE',
    fabric: '240G ALGODÓN PEINADO · SILVER PRINT',
    price: 170000,
    priceFormatted: '₲ 170.000',
    image: '/img/Placeholer.jpeg',
    category: 'Streetwear',
    sizes: ['S', 'M', 'L', 'XL'],
  },
];

export default function AnimatedProductsCarousel() {
  const { addItem } = useCart();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(true);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  // Auto-slide effect every 4.5 seconds
  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_PRODUCTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoplay]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_PRODUCTS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CAROUSEL_PRODUCTS.length) % CAROUSEL_PRODUCTS.length);
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.success(wishlist[id] ? 'QUITADO DE FAVORITOS' : 'AGREGADO A FAVORITOS', {
      description: 'CÁPSULA SANT CLOTHES',
    });
  };

  const handleSizeSelect = (productId: string, size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: StudioProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const chosenSize = selectedSizes[product.id] || product.sizes[0];

    addItem({
      variantId: `${product.id}-${chosenSize}`,
      productId: String(product.id),
      productName: product.name,
      sku: `SKU-${product.id}-${chosenSize}`,
      size: chosenSize,
      cut: 'REGULAR',
      unitPrice: product.price,
      image: product.image,
    });

    toast.success('¡AÑADIDO AL CARRITO!', {
      description: `${product.name} · TALLE ${chosenSize}`,
    });
  };

  return (
    <section
      className="w-full bg-[#17191c] text-[#f6f8f9] py-20 px-6 sm:px-12 border-b border-white/10 overflow-hidden"
      onMouseEnter={() => setIsAutoplay(false)}
      onMouseLeave={() => setIsAutoplay(true)}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Bar with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-400">
                NUEVO DROPS EXCLUSIVOS — MODO PRESENTACIÓN
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-none text-white">
              NUEVAS PRENDAS DESTACADAS
            </h2>
          </div>

          {/* Carousel Arrows & Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 mr-2">
              {CAROUSEL_PRODUCTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 transition-all duration-300 ${
                    currentIndex === i ? 'w-8 bg-white' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  aria-label={`Ir al producto ${i + 1}`}
                  style={{ borderRadius: '0px' }}
                />
              ))}
            </div>

            <button
              onClick={handlePrev}
              aria-label="Producto anterior"
              className="w-11 h-11 border border-white/20 bg-black/60 hover:bg-white hover:text-black hover:border-white text-white flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              aria-label="Siguiente producto"
              className="w-11 h-11 border border-white/20 bg-black/60 hover:bg-white hover:text-black hover:border-white text-white flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── DESKTOP GRID (4 Cards Layout with Animated Highlight) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CAROUSEL_PRODUCTS.map((product, idx) => {
            const isSelected = currentIndex === idx;
            const isFav = !!wishlist[product.id];
            const currentSize = selectedSizes[product.id] || product.sizes[0];

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group flex flex-col justify-between transition-all duration-300 ${
                  isSelected ? 'scale-[1.02]' : 'opacity-90 hover:opacity-100'
                }`}
              >
                {/* Presentation Card Container */}
                <div
                  className={`relative aspect-[3/4] w-full bg-[#0d0e10] border overflow-hidden mb-2.5 transition-all duration-300 ${
                    isSelected ? 'border-white shadow-2xl' : 'border-white/10 group-hover:border-white/30'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  {/* Studio Presentation Garment Image */}
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
                    <span className="text-[9px] font-mono font-bold tracking-[0.18em] text-zinc-400 uppercase truncate">
                      {product.fabric}
                    </span>

                    <h3 className="text-sm font-extrabold uppercase tracking-tight text-white leading-snug line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs font-mono font-bold text-white tabular-nums">
                        {product.priceFormatted}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                        TALLES: {currentSize}
                      </span>
                    </div>
                  </div>

                  {/* 2. HOVER QUICK ADD PANEL — Fades & slides in where the title was! */}
                  <div className="absolute inset-0 z-20 bg-black/95 text-white p-2.5 border border-white/20 flex flex-col justify-between opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out translate-y-2 group-hover:translate-y-0 shadow-xl">
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
