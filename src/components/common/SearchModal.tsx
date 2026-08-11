'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/mocks/catalog';
import { formatCurrency } from '@/utils/format';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_CHIPS = [
  { label: 'HOODIES 400G', query: 'hoodie' },
  { label: 'TRACKSUITS SUEDE', query: 'tracksuit' },
  { label: 'VARSITY JACKET', query: 'varsity' },
  { label: 'REMERAS OVERSIZED', query: 'remera' },
  { label: 'OLD MONEY', query: 'old money' },
];

const FALLBACK_PRODUCT_IMAGE = '/img/hero/IMG_4390.webp';

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens & handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter products based on search query
  const trimmedQuery = query.trim().toLowerCase();
  const filteredProducts = trimmedQuery
    ? MOCK_PRODUCTS.filter(
        (p) =>
          p.title.toLowerCase().includes(trimmedQuery) ||
          p.category.toLowerCase().includes(trimmedQuery) ||
          p.description.toLowerCase().includes(trimmedQuery)
      )
    : [];

  const featuredProducts = MOCK_PRODUCTS.slice(0, 4);

  const handleChipClick = (chipQuery: string) => {
    setQuery(chipQuery);
    inputRef.current?.focus();
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 bg-[#17191c]/70 backdrop-blur-md cursor-pointer"
        />

        {/* Search Modal Panel - Unified Single Background Color (bg-white) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative min-h-screen sm:min-h-[auto] w-full max-w-4xl mx-auto bg-white text-[#17191c] shadow-2xl border-b sm:border border-[#17191c]/10 sm:mt-12 sm:mb-12"
          style={{ borderRadius: '0px' }}
        >
          {/* Close Button (No header bar) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar buscador"
            className="absolute top-5 right-6 text-[#50524a] hover:text-[#17191c] p-2 transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* ── Search Input Section ── */}
          <div className="p-6 sm:p-8 pr-16 bg-white border-b border-[#17191c]/10">
            <div className="relative flex items-center border-b-2 border-[#17191c] pb-3 focus-within:border-black transition-colors">
              <Search className="w-6 h-6 text-[#17191c] shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="BUSCAR HOODIES, TRACKSUITS, REMERAS..."
                className="w-full bg-transparent text-[#17191c] text-lg sm:text-2xl font-[family-name:var(--font-bebas)] tracking-wider uppercase focus:outline-none placeholder:text-[#b6b2a7]"
              />
            </div>

            {/* Trending Quick Search Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-[#50524a] uppercase tracking-wider mr-1">
                TENDENCIAS:
              </span>
              {TRENDING_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleChipClick(chip.query)}
                  className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 border transition-all cursor-pointer ${
                    trimmedQuery === chip.query
                      ? 'bg-[#17191c] text-white border-[#17191c]'
                      : 'bg-[#f6f8f9] text-[#50524a] border-[#17191c]/10 hover:border-[#17191c] hover:text-[#17191c]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Search Results or Default Recommendations Section ── */}
          <div className="p-6 sm:p-8 bg-white min-h-[300px]">
            {trimmedQuery ? (
              /* Live Results */
              <div>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#17191c]/10">
                  <span className="text-xs font-mono font-bold tracking-wider text-[#17191c] uppercase">
                    {filteredProducts.length}{' '}
                    {filteredProducts.length === 1 ? 'RESULTADO ENCONTRADO' : 'RESULTADOS ENCONTRADOS'}
                  </span>
                  <span className="text-[11px] font-mono text-[#50524a] uppercase">
                    BÚSQUEDA: &quot;{query}&quot;
                  </span>
                </div>

                {filteredProducts.length === 0 ? (
                  /* Empty Results */
                  <div className="py-16 text-center space-y-4">
                    <p className="text-xs font-mono uppercase text-[#50524a] tracking-wide">
                      No encontramos coincidencias exactas para &quot;{query}&quot;.
                    </p>
                    <Link
                      href="/catalog"
                      onClick={onClose}
                      className="inline-flex items-center gap-2 bg-[#17191c] text-white text-xs font-mono font-bold tracking-widest uppercase px-6 py-3 hover:bg-[#50524a] transition-colors"
                    >
                      <span>VER TODO EL CATÁLOGO</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  /* Results Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => {
                      const imageSrc =
                        imageErrors[product.productId] || !product.images?.[0]?.url
                          ? FALLBACK_PRODUCT_IMAGE
                          : product.images[0].url;

                      return (
                        <Link
                          key={product.productId}
                          href={`/products/${product.productId}`}
                          onClick={onClose}
                          className="group bg-white border border-[#17191c]/10 p-3 flex flex-col justify-between hover:border-[#17191c] transition-all"
                        >
                          <div className="space-y-3">
                            <div className="relative aspect-[3/4] w-full bg-[#f6f8f9] overflow-hidden border border-[#17191c]/05">
                              <Image
                                src={imageSrc}
                                alt={product.title}
                                fill
                                sizes="(min-width: 640px) 25vw, 50vw"
                                quality={80}
                                onError={() => handleImageError(product.productId)}
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-[#50524a] uppercase tracking-wider block">
                                {product.category}
                              </span>
                              <h4 className="text-xs font-bold text-[#17191c] uppercase tracking-tight line-clamp-1 group-hover:underline">
                                {product.title}
                              </h4>
                            </div>
                          </div>
                          <div className="pt-3 mt-3 border-t border-[#17191c]/05 flex items-center justify-between text-xs font-mono">
                            <span className="font-extrabold text-[#17191c]">
                              {formatCurrency(product.discountPrice ?? product.price)}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#50524a] group-hover:text-[#17191c] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Default Featured Recommendations */
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredProducts.map((product) => {
                    const imageSrc =
                      imageErrors[product.productId] || !product.images?.[0]?.url
                        ? FALLBACK_PRODUCT_IMAGE
                        : product.images[0].url;

                    return (
                      <Link
                        key={product.productId}
                        href={`/products/${product.productId}`}
                        onClick={onClose}
                        className="group bg-white border border-[#17191c]/10 p-3 flex flex-col justify-between hover:border-[#17191c] transition-all"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-[3/4] w-full bg-[#f6f8f9] overflow-hidden border border-[#17191c]/05">
                            <Image
                              src={imageSrc}
                              alt={product.title}
                              fill
                              sizes="(min-width: 640px) 25vw, 50vw"
                              quality={80}
                              onError={() => handleImageError(product.productId)}
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-[#50524a] uppercase tracking-wider block">
                              {product.category}
                            </span>
                            <h4 className="text-xs font-bold text-[#17191c] uppercase tracking-tight line-clamp-1 group-hover:underline">
                              {product.title}
                            </h4>
                          </div>
                        </div>
                        <div className="pt-3 mt-3 border-t border-[#17191c]/05 flex items-center justify-between text-xs font-mono">
                          <span className="font-extrabold text-[#17191c]">
                            {formatCurrency(product.discountPrice ?? product.price)}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#50524a] group-hover:text-[#17191c] transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
