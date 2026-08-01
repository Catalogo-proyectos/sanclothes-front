'use client';

import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/format';
import Image from 'next/image';
import Link from 'next/link';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getSubtotal, getShippingCost, getTotal } = useCart();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b flex items-center justify-between bg-slate-50">
            <h2 className="text-lg font-extrabold uppercase tracking-wider text-black">
              Tu Carrito ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-black rounded-full transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-slate-500 font-medium">Tu carrito está vacío.</p>
                <button
                  onClick={onClose}
                  className="inline-block bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 items-center"
                >
                  {item.image && (
                    // Miniatura de 80px: con <img> el navegador se descargaba
                    // la foto de producto entera (hasta 662 KB) por cada línea
                    // del carrito. next/image sirve la variante de 96px.
                    <Image
                      src={item.image}
                      alt={item.productName}
                      width={80}
                      height={80}
                      quality={75}
                      sizes="80px"
                      className="w-20 h-20 object-cover rounded-lg bg-slate-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Talle: <span className="font-semibold">{item.size}</span> | Corte:{' '}
                      <span className="font-semibold">{item.cut}</span>
                    </p>
                    <p className="text-sm font-extrabold text-black mt-1">
                      {formatCurrency(item.unitPrice)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-300"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-slate-400 hover:text-red-500 text-xs p-1"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t bg-slate-50 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-black">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Envío (Asunción/Interior)</span>
                <span className="font-bold text-black">
                  {shipping === 0 ? '¡GRATIS!' : formatCurrency(shipping)}
                </span>
              </div>
              {subtotal < 300000 && (
                <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg text-center">
                  💡 Sumá <span className="font-bold">{formatCurrency(300000 - subtotal)}</span> más para obtener Envío Gratis.
                </p>
              )}
              <div className="flex justify-between text-base font-extrabold text-black pt-2 border-t">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(total)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full mt-4 bg-black text-white text-center py-3.5 rounded-xl font-bold uppercase tracking-wider block hover:bg-slate-800 transition-colors shadow-lg"
              >
                Iniciar Compra 🛒
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
