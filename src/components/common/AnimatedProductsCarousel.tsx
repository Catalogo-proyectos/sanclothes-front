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
    image: '/img/products/brown-hoodie-set.jpg',
    category: 'Streetwear',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'le-sants-suede-set',
    tag: 'CÁPSULA SPECIAL — LE SANTS',
    name: 'LE SANTS CLUB SUEDE TRACKSUIT',
    fabric: 'TEXTURA SUEDE & EMBROIDERED NOVA',
    price: 390000,
    priceFormatted: '₲ 390.000',
    image: '/img/products/black-suede-tracksuit.jpg',
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
    image: '/img/products/brown-pants-set.jpg',
    category: 'Casual',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'santclub-metallic-tee',
    tag: 'WOMEN ATELIER — CHROME',
    name: 'SANTCLUB METALLIC SCRIPT TEE',
    fabric: '240G ALGODÓN PEINADO · SILVER PRINT',
    price: 170000,
    priceFormatted: '₲ 170.000',
    image: '/img/products/santclub-metallic-tee.jpg',
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
      description: 'CÁPSULA SANTS CLOTHES',
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
      className="w-full bg-[#f6f8f9] text-[#17191c] py-20 px-6 sm:px-12 border-b border-[#b6b2a7]/40 overflow-hidden"
      onMouseEnter={() => setIsAutoplay(false)}
      onMouseLeave={() => setIsAutoplay(true)}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Bar with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-500">
                NUEVO DROPS EXCLUSIVOS — MODO PRESENTACIÓN
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-none">
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
                    currentIndex === i ? 'w-8 bg-black' : 'w-2 bg-zinc-300 hover:bg-zinc-500'
                  }`}
                  aria-label={`Ir al producto ${i + 1}`}
                  style={{ borderRadius: '0px' }}
                />
              ))}
            </div>

            <button
              onClick={handlePrev}
              aria-label="Producto anterior"
              className="w-11 h-11 border border-zinc-300 bg-white hover:bg-black hover:text-white hover:border-black text-black flex items-center justify-center transition-all shadow-sm active:scale-95"
              style={{ borderRadius: '0px' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              aria-label="Siguiente producto"
              className="w-11 h-11 border border-zinc-300 bg-white hover:bg-black hover:text-white hover:border-black text-black flex items-center justify-center transition-all shadow-sm active:scale-95"
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
                  className={`relative aspect-[3/4] w-full bg-[#f6f6f6] border overflow-hidden mb-4 transition-all duration-300 ${
                    isSelected ? 'border-black shadow-xl' : 'border-zinc-200 group-hover:border-zinc-400'
                  }`}
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

                  {/* Studio Presentation Garment Image */}
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
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/90 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
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
                      className="w-full bg-white text-black hover:bg-zinc-200 text-[10px] font-mono font-bold tracking-[0.2em] uppercase py-2 flex items-center justify-center gap-2 border border-white transition-colors"
                      style={{ borderRadius: '0px' }}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>AÑADIR AL CARRITO</span>
                    </button>
                  </div>
                </div>

                {/* Metadata Below Card */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-zinc-500 uppercase">
                    {product.fabric}
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black leading-tight group-hover:underline">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-mono font-bold text-black tracking-widest">
                      {product.priceFormatted}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                      TALLES: {currentSize}
                    </span>
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
