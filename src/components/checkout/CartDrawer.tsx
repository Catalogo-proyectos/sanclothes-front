'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/format';

/** Free Shipping threshold in PYG (₲ 300.000) */
const FREE_SHIPPING_THRESHOLD = 300000;
const FALLBACK_IMAGE = '/img/hero/IMG_4390.webp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getSubtotal, getShippingCost, getTotal } = useCart();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  // Free shipping progress
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleImageError = (variantId: string) => {
    setImageErrors((prev) => ({ ...prev, [variantId]: true }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] cursor-pointer"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 350 }}
              className="w-screen max-w-md bg-[#ffffff] text-[#17191c] shadow-2xl flex flex-col pointer-events-auto border-l border-[#17191c]/10"
            >
              {/* ── 1. Clean Header ── */}
              <div className="px-6 py-5 border-b border-[#17191c]/10 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-[family-name:var(--font-bebas)] tracking-wider uppercase leading-none text-[#17191c]">
                    CARRITO
                  </h2>
                  <span className="text-xs font-mono text-[#50524a]">({itemCount})</span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar carrito"
                  className="p-1.5 text-[#50524a] hover:text-[#17191c] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* ── 3. Cart Items (Clean List) ── */}
              <div className="flex-1 overflow-y-auto px-6 divide-y divide-[#17191c]/08">
                {items.length === 0 ? (
                  /* Empty State */
                  <div className="py-24 text-center space-y-4 flex flex-col items-center justify-center h-full">
                    <ShoppingBag className="w-10 h-10 text-[#b6b2a7] stroke-[1]" />
                    <div className="space-y-1">
                      <h3 className="text-xl font-[family-name:var(--font-bebas)] tracking-wider text-[#17191c] uppercase">
                        TU CARRITO ESTÁ VACÍO
                      </h3>
                      <p className="text-xs font-mono text-[#50524a] max-w-xs mx-auto">
                        Explorá nuestro catálogo y descubrí las nuevas prendas atelier.
                      </p>
                    </div>

                    <Link
                      href="/catalog"
                      onClick={onClose}
                      className="inline-flex items-center justify-center gap-2 bg-[#17191c] text-white text-xs font-mono font-bold tracking-widest uppercase px-6 py-3 hover:bg-[#50524a] transition-colors mt-4"
                    >
                      <span>EXPLORAR CATÁLOGO</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  /* Items List */
                  items.map((item) => {
                    const hasError = imageErrors[item.variantId];
                    const imageSrc = hasError || !item.image ? FALLBACK_IMAGE : item.image;

                    return (
                      <div key={item.variantId} className="py-5 flex gap-4 items-start">
                        {/* Thumbnail */}
                        <Link
                          href={`/products/${item.productId}`}
                          onClick={onClose}
                          className="relative w-16 h-20 bg-[#f6f8f9] shrink-0 border border-[#17191c]/10 overflow-hidden group/img cursor-pointer"
                        >
                          <Image
                            src={imageSrc}
                            alt={item.productName}
                            fill
                            sizes="64px"
                            quality={80}
                            onError={() => handleImageError(item.variantId)}
                            className="object-cover object-center group-hover/img:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${item.productId}`}
                              onClick={onClose}
                              className="truncate group/title"
                            >
                              <h4 className="text-xs font-bold text-[#17191c] uppercase tracking-tight truncate group-hover/title:underline transition-all">
                                {item.productName}
                              </h4>
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(item.variantId)}
                              className="text-[#b6b2a7] hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                            </button>
                          </div>

                          <p className="text-[11px] font-mono text-[#50524a]">
                            TALLE: <span className="text-[#17191c] font-semibold">{item.size}</span> · {item.cut}
                          </p>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-mono font-bold text-[#17191c]">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </span>

                            {/* Clean Quantity Selector */}
                            <div className="flex items-center gap-2 border border-[#17191c]/20 px-2 py-0.5 text-xs font-mono">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="text-[#50524a] hover:text-[#17191c] transition-colors cursor-pointer"
                                aria-label="Disminuir"
                              >
                                <Minus className="w-3 h-3 stroke-[1.5]" />
                              </button>
                              <span className="w-4 text-center font-bold text-[#17191c]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                className="text-[#50524a] hover:text-[#17191c] transition-colors cursor-pointer"
                                aria-label="Aumentar"
                              >
                                <Plus className="w-3 h-3 stroke-[1.5]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── 4. Clean Footer Summary ── */}
              {items.length > 0 && (
                <div className="p-6 border-t border-[#17191c]/10 bg-white space-y-4">
                  <div className="space-y-2 text-xs font-mono text-[#50524a]">
                    <div className="flex justify-between">
                      <span>SUBTOTAL</span>
                      <span className="text-[#17191c] font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 border-t border-[#17191c]/10">
                    <span className="text-xs font-mono font-bold uppercase text-[#17191c]">
                      TOTAL ESTIMADO
                    </span>
                    <span className="text-2xl font-[family-name:var(--font-bebas)] tracking-wider text-[#17191c]">
                      {formatCurrency(total)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="w-full bg-[#17191c] hover:bg-[#50524a] text-white text-center py-3.5 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>FINALIZAR COMPRA</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
