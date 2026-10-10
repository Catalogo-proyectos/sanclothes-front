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

const discount = order
    ? order.totals.discount ?? Math.max(0, order.totals.subtotal + order.totals.shipping - order.totals.total)
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
        className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-none border border-[#17191c] shadow-2xl relative print:max-h-none print:overflow-visible print:shadow-none print:border-0 print:rounded-none"
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Cerrar ticket de compra"
          className="absolute top-4 right-4 p-2 text-[#50524a] transition-colors hover:text-[#17191c] cursor-pointer print:hidden"
        >
          <X className="w-5 h-5 stroke-[1.75]" />
        </button>

        <div className="flex items-center gap-2.5 pr-8">
          <Receipt className="w-5 h-5 text-[#17191c] shrink-0" aria-hidden="true" />
          <h2 id={titleId} className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-[#17191c] leading-none">
            Ticket de compra
          </h2>
        </div>
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#50524a] mt-1">
          SANT CLOTHES · ATELIER CIUDAD DEL ESTE
        </p>

        {error ? (
          <p className="mt-6 text-xs text-red-600 font-mono">{error}</p>
        ) : !order ? (
          <p className="mt-6 text-xs text-[#50524a] font-mono uppercase tracking-wider">Cargando pedido…</p>
        ) : (
          <>
            <dl className="mt-6 grid grid-cols-2 gap-3 text-xs border-y border-[#17191c]/15 py-4">
              <div>
                <dt className="text-[#50524a] uppercase font-bold text-[10px] font-mono tracking-wider">Pedido</dt>
                <dd className="font-mono font-bold text-sm text-[#17191c]">#{order.orderNumber}</dd>
              </div>
              <div>
                <dt className="text-[#50524a] uppercase font-bold text-[10px] font-mono tracking-wider">Fecha</dt>
                <dd className="font-mono text-xs text-[#17191c]">{formatDate(order.createdAt).toUpperCase()}</dd>
              </div>
              <div>
                <dt className="text-[#50524a] uppercase font-bold text-[10px] font-mono tracking-wider">Estado</dt>
                <dd className="font-bold text-xs text-[#17191c] uppercase">{statusLabel}</dd>
              </div>
              {addressLine && (
                <div className="col-span-2">
                  <dt className="text-[#50524a] uppercase font-bold text-[10px] font-mono tracking-wider">Entrega</dt>
                  <dd className="font-medium text-xs text-[#17191c]">{addressLine}</dd>
                </div>
              )}
            </dl>

            <ul className="mt-4 divide-y divide-[#17191c]/10 border-b border-[#17191c]/15">
              {items.map((item, index) => (
                <li key={`${item.productId}-${index}`} className="flex items-center gap-3.5 py-3">
                  <Image
                    src={normalizeImageUrl(item.image) || PLACEHOLDER_PRODUCT}
                    alt={item.name}
                    width={56}
                    height={56}
                    unoptimized
                    className="w-14 h-14 rounded-none border border-[#17191c]/15 object-cover bg-neutral-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#17191c] uppercase truncate">{item.name}</p>
                    <p className="text-[11px] font-mono text-[#50524a]">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="text-xs font-mono font-bold text-[#17191c]">{formatCurrency(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-[#50524a] font-mono uppercase text-[11px]">Subtotal</dt>
                <dd className="font-mono font-bold text-[#17191c]">{formatCurrency(order.totals.subtotal)}</dd>
              </div>
              {order.totals.shipping > 0 && (
                <div className="flex justify-between">
                  <dt className="text-[#50524a] font-mono uppercase text-[11px]">Envío</dt>
                  <dd className="font-mono font-bold text-[#17191c]">{formatCurrency(order.totals.shipping)}</dd>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-[#50524a] font-mono uppercase text-[11px]">Descuentos</dt>
                  <dd className="font-mono font-bold text-emerald-700">−{formatCurrency(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-3 border-t border-[#17191c] text-sm">
                <dt className="font-bold uppercase tracking-wider text-[#17191c]">Total</dt>
                <dd className="font-[family-name:var(--font-bebas)] text-2xl text-[#17191c] tracking-wide leading-none">
                  {formatCurrency(order.totals.total)}
                </dd>
              </div>
            </dl>

            {order.returnReason && (
              <p className="mt-4 text-[11px] text-[#50524a] font-mono">
                <span className="font-bold uppercase">Motivo de devolución:</span> {order.returnReason}
              </p>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#17191c] text-white text-xs font-bold uppercase tracking-[0.18em] hover:bg-neutral-800 rounded-none transition-colors cursor-pointer print:hidden shadow-xs"
            >
              <Printer className="w-4 h-4 stroke-[2]" aria-hidden="true" />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
