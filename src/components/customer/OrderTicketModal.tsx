'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Printer, Receipt, X } from 'lucide-react';
import { apiCall } from '@/lib/api';
import { normalizeImageUrl } from '@/lib/images/url';
import { PLACEHOLDER_PRODUCT } from '@/lib/images/constants';
import { formatCurrency, formatDate } from '@/utils/format';
import type { OrderDetail } from '@/types/api';

interface OrderTicketModalProps {
  orderId: string;
  statusLabel: string;
  onClose: () => void;
}

/**
 * Ticket de compra de un pedido del cliente (GET /me/orders/:id).
 * "Imprimir / PDF" usa la impresión del navegador; el CSS de print en
 * globals.css deja visible solo #order-ticket-print.
 */
export default function OrderTicketModal({ orderId, statusLabel, onClose }: OrderTicketModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const titleId = useId();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiCall<OrderDetail>('GET', `/me/orders/${encodeURIComponent(orderId)}`, undefined, true)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || 'No se pudo cargar el pedido.');
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    closeButtonRef.current?.focus();
    return () => {
      (previouslyFocused.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const items = order?.items ?? [];
  const address = order?.shippingAddress;
  // El backend expone shipping = max(0, total - subtotal); si hubo cupón o
  // beneficio de tier, la diferencia restante es el descuento aplicado.
  const discount = order
    ? Math.max(0, order.totals.subtotal + order.totals.shipping - order.totals.total)
    : 0;
  const addressLine = address
    ? [address.street, address.city, address.postalCode].filter(Boolean).join(', ')
    : '';

  return createPortal(
    <div
      id="order-ticket-print"
      className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs print:static print:bg-white print:p-0 print:backdrop-blur-none"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-2xl relative print:max-h-none print:overflow-visible print:shadow-none print:border-0 print:rounded-none"
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Cerrar ticket de compra"
          className="absolute top-3 right-3 p-2 text-slate-500 transition-colors hover:text-black print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 pr-8">
          <Receipt className="w-5 h-5 text-black shrink-0" aria-hidden="true" />
          <h2 id={titleId} className="text-base sm:text-lg font-black uppercase tracking-wider">
            Ticket de compra
          </h2>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Sant Clothes</p>

        {error ? (
          <p className="mt-6 text-xs text-red-600">{error}</p>
        ) : !order ? (
          <p className="mt-6 text-xs text-slate-400 font-bold">Cargando pedido...</p>
        ) : (
          <>
            <dl className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400 uppercase font-bold text-[10px]">Pedido</dt>
                <dd className="font-extrabold text-black">{order.orderNumber}</dd>
              </div>
              <div>
                <dt className="text-slate-400 uppercase font-bold text-[10px]">Fecha</dt>
                <dd className="font-bold text-black">{formatDate(order.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-400 uppercase font-bold text-[10px]">Estado</dt>
                <dd className="font-bold text-black">{statusLabel}</dd>
              </div>
              {addressLine && (
                <div className="col-span-2">
                  <dt className="text-slate-400 uppercase font-bold text-[10px]">Entrega</dt>
                  <dd className="font-bold text-black">{addressLine}</dd>
                </div>
              )}
            </dl>

            <ul className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
              {items.map((item, index) => (
                <li key={`${item.productId}-${index}`} className="flex items-center gap-3 py-3">
                  <Image
                    src={normalizeImageUrl(item.image) || PLACEHOLDER_PRODUCT}
                    alt={item.name}
                    width={56}
                    height={56}
                    unoptimized
                    className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-black truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="text-xs font-extrabold text-black">{formatCurrency(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-bold text-black">{formatCurrency(order.totals.subtotal)}</dd>
              </div>
              {order.totals.shipping > 0 && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Envío</dt>
                  <dd className="font-bold text-black">{formatCurrency(order.totals.shipping)}</dd>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Descuentos</dt>
                  <dd className="font-bold text-emerald-700">−{formatCurrency(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <dt className="font-black uppercase">Total</dt>
                <dd className="font-black text-black">{formatCurrency(order.totals.total)}</dd>
              </div>
            </dl>

            {order.returnReason && (
              <p className="mt-4 text-[11px] text-slate-500">
                <span className="font-bold uppercase">Motivo de devolución:</span> {order.returnReason}
              </p>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white text-xs font-extrabold uppercase rounded-xl hover:bg-slate-800 print:hidden"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              Imprimir / Guardar PDF
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
