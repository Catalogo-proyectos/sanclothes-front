'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Mail } from 'lucide-react';
import { getOrderAccessToken, setOrderAccessToken } from '@/lib/auth';
import OrderPaymentPanel from '@/components/checkout/OrderPaymentPanel';

const noopSubscribe = () => () => {};
const hashToken = () => new URLSearchParams(window.location.hash.slice(1)).get('t');

function readAccess(orderId: string): boolean {
  const token = hashToken();
  if (token) setOrderAccessToken(orderId, token);
  return !!getOrderAccessToken(orderId);
}

export default function OrderAccess({ orderId }: { orderId: string }) {
  
  const hasAccess = useSyncExternalStore<boolean | null>(noopSubscribe, () => readAccess(orderId), () => null);

  useEffect(() => {
    if (hashToken()) window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);

  if (hasAccess === null) {
    return (
      <div className="p-12 text-center border border-[#b6b2a7]/50 bg-white">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#50524a]">Cargando pedido…</span>
      </div>
    );
  }
  if (!hasAccess) {
    return (
      <div className="p-10 sm:p-14 text-center border border-[#b6b2a7]/60 bg-white space-y-4">
        <Mail aria-hidden className="w-10 h-10 text-[#b6b2a7] stroke-[1] mx-auto" />
        <h2 className="text-3xl font-[family-name:var(--font-bebas)] tracking-wider text-[#17191c] uppercase leading-none">
          Este pedido es privado
        </h2>
        <p className="text-xs font-mono text-[#50524a] uppercase tracking-wide max-w-md mx-auto leading-relaxed">
          Para ver este pedido abrí el link del email que te mandamos al comprar (&quot;Ver pedido y subir comprobante&quot;).
        </p>
      </div>
    );
  }
  return <OrderPaymentPanel orderId={orderId} />;
}
