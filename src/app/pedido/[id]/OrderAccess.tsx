'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { getOrderAccessToken, setOrderAccessToken } from '@/lib/auth';
import OrderPaymentPanel from '@/components/checkout/OrderPaymentPanel';

const noopSubscribe = () => () => {};
const hashToken = () => new URLSearchParams(window.location.hash.slice(1)).get('t');

/**
 * Token del link del email (`#t=...`): se guarda solo para esta pestaña antes de
 * que el panel pida el pedido, y después se borra de la barra de direcciones
 * (no queda en el historial ni se copia al compartir la URL).
 * Se guarda acá y no en un effect a propósito: los effects del panel (hijo)
 * corren antes que los de este componente, y el panel ya necesita el token.
 * Es idempotente: re-ejecutarlo escribe el mismo valor.
 */
function readAccess(orderId: string): boolean {
  const token = hashToken();
  if (token) setOrderAccessToken(orderId, token);
  return !!getOrderAccessToken(orderId);
}

export default function OrderAccess({ orderId }: { orderId: string }) {
  // null en el servidor (no hay sessionStorage); en el cliente, si hay acceso.
  const hasAccess = useSyncExternalStore<boolean | null>(noopSubscribe, () => readAccess(orderId), () => null);

  useEffect(() => {
    if (hashToken()) window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);

  if (hasAccess === null) return <p className="text-center text-xs text-slate-500">Cargando pedido...</p>;
  if (!hasAccess) {
    return (
      <p className="p-4 bg-slate-50 border border-slate-200 text-sm text-slate-700 rounded-xl">
        Para ver este pedido abrí el link del email que te mandamos al comprar (&quot;Ver pedido y subir comprobante&quot;).
      </p>
    );
  }
  return <OrderPaymentPanel orderId={orderId} />;
}
