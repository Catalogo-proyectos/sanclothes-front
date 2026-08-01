'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

export interface PresentationProduct {
  id: string;
  tag: string;
  name: string;
  fabric: string;
  price: number;
  priceFormatted: string;
  image: string;
  sizes: string[];
}

const PRODUCTS_DATA: PresentationProduct[] = [
  {
    id: 'varsity-jacket-brown',
    tag: 'LIMITED DROP',
    name: 'VARSITY JACKET BROWN & WHITE "S"',
    fabric: 'BOXY FIT — EMBROIDERED 400G',
    price: 350000,
    priceFormatted: '₲ 350.000',
    image: '/img/products/varsity-flat.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'shorts-trio-sants',
    tag: 'DAILY ESSENTIALS',
    name: 'SHORTS ATELIER TRIO PACK',
    fabric: 'ALGODÓN PREMIUM 240G',
    price: 180000,
    priceFormatted: '₲ 180.000',
    image: '/img/products/shorts-set.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'santis-club-zip',
    tag: 'NUEVA COLECCIÓN',
    name: 'LE SANTI\'S CLUB 1/4 ZIP SWEATSHIRT',
    fabric: 'ALGODÓN BORDADO ECOUTEZ VOTRE COEUR',
    price: 280000,
    priceFormatted: '₲ 280.000',
    image: '/img/products/zip-santis.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'graffiti-art-tee',
    tag: 'STREET ARCHITECTS',
    name: 'GRAFFITI ART OVERSIZED TEE BLACK',
    fabric: '100% ALGODÓN HEAVYWEIGHT 240G',
    price: 190000,
    priceFormatted: '₲ 190.000',
    image: '/img/products/tee-graffiti.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'tracksuit-suede-set',
    tag: 'SUEDE EDITION',
    name: 'LE SANTS CLUB SUEDE TRACKSUIT',
    fabric: 'SUEDE TEXTURED EMBROIDERED SET',
    price: 390000,
    priceFormatted: '₲ 390.000',
    image: '/img/products/tracksuit-suede.webp',
    sizes: ['S', 'M', 'L', 'XL'],
  },
];

export default function LatestProductsCarousel() {
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

  const handleAddToCart = (product: PresentationProduct, e: React.MouseEvent) => {
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
    <section className="w-full bg-[#f6f8f9] text-[#17191c] py-20 px-6 sm:px-12 border-b border-[#b6b2a7]/40">
      <div className="max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-[#b6b2a7]/40">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-[#17191c]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#50524a]">
                LATEST DROPS — CÁPSULA ATELIER
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-[family-name:var(--font-bebas)] uppercase tracking-wider leading-none text-[#17191c]">
              NUEVAS PRENDAS DESTACADAS
            </h2>
          </div>

          <Link
            href="/catalog"
            className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#17191c] hover:text-[#50524a] transition-colors inline-flex items-center gap-2 border-b-2 border-[#17191c] pb-1 self-start md:self-end"
          >
            <span>VER TODO EL CATÁLOGO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Presentation Product Cards Carousel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS_DATA.slice(0, 4).map((product, idx) => {
            const isFav = !!wishlist[product.id];
            const currentSize = selectedSizes[product.id] || product.sizes[0];

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group flex flex-col justify-between"
              >
                {/* 1. Presentation Studio Card (Clean Off-White #f8f8f8 Canvas) */}
                <div
                  className="relative aspect-[3/4] w-full bg-[#f8f8f8] border border-zinc-200 overflow-hidden mb-4 transition-colors group-hover:border-black"
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

                  {/* Isolated Product Presentation Image */}
                  <div className="relative w-full h-full p-6 flex items-center justify-center">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      quality={95}
                      className="object-contain object-center p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
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

                {/* 2. Minimalist Metadata (Under Card) */}
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
