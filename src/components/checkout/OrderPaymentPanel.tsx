'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatCurrency } from '@/utils/format';
import { fetchCheckoutOrder } from '@/lib/services/checkout';
import { fetchBankTransferInfo, type BankTransferInfo } from '@/lib/services/settings';
import type { CheckoutOrderDetail } from '@/types/api';
import ReceiptUploader from '@/components/checkout/ReceiptUploader';

/** "1 h 23 min" / "12 min" hasta `deadline`; null si ya pasó. */
function useTimeLeft(deadline: string | null | undefined): string | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!deadline) return;
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [deadline]);
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - now;
  if (ms <= 0) return null;
  const totalMin = Math.ceil(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

const deadlineLabel = (deadline: string) =>
  new Date(deadline).toLocaleString('es-PY', {
    timeZone: 'America/Asuncion',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * Datos para transferir + estado del comprobante de un pedido. Lo usan la
 * pantalla post-checkout y la página /pedido/[id] del link del email.
 */
export default function OrderPaymentPanel({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<CheckoutOrderDetail | null>(null);
  const [loadError, setLoadError] = useState('');
  const [bankInfo, setBankInfo] = useState<BankTransferInfo | null>(null);
  const [bankInfoLoaded, setBankInfoLoaded] = useState(false);

  const load = useCallback(() => {
    fetchCheckoutOrder(orderId)
      .then((o) => {
        setOrder(o);
        setLoadError('');
      })
      .catch((err: Error) => setLoadError(err.message || 'No se pudo cargar el pedido.'));
  }, [orderId]);

  useEffect(() => {
    load();
    fetchBankTransferInfo().then((info) => {
      setBankInfo(info);
      setBankInfoLoaded(true);
    });
  }, [load]);

  const timeLeft = useTimeLeft(order?.paymentDeadlineAt);

  if (loadError) {
    return <p className="p-4 bg-red-50 text-red-700 text-sm font-bold rounded-xl">{loadError}</p>;
  }
  if (!order) {
    return <p className="text-center text-xs text-slate-500">Cargando pedido...</p>;
  }

  const waitingStaff = order.status === 'Pago Pendiente de Verificación';
  const rejected = order.status === 'Comprobante Rechazado';
  const confirmed = !waitingStaff && !rejected && order.status !== 'Pedido Pendiente de Confirmación';
  // El plazo también se chequea acá: la página puede quedar abierta después de vencer.
  const expired = !waitingStaff && !!order.paymentDeadlineAt && timeLeft === null;
  const canUpload = !!order.canUploadReceipt && !expired;

  return (
    <div className="space-y-6">
      {!confirmed && (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">Datos para Pago por Transferencia (SIPAP / QR)</h3>
          {/* Los datos bancarios se cargan en el admin (Configuración → Datos para transferencia). */}
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700">
            {bankInfo && (
              <>
                <div>
                  <p className="text-slate-400">Banco:</p>
                  <p className="font-bold text-black">{bankInfo.bankName}</p>
                </div>
                <div>
                  <p className="text-slate-400">Titular:</p>
                  <p className="font-bold text-black">{bankInfo.accountHolder}</p>
                </div>
                <div>
                  <p className="text-slate-400">{bankInfo.accountType || 'Número de cuenta'}:</p>
                  <p className="font-bold text-black select-all">{bankInfo.accountNumber}</p>
                </div>
                {bankInfo.ruc && (
                  <div>
                    <p className="text-slate-400">RUC / CI:</p>
                    <p className="font-bold text-black select-all">{bankInfo.ruc}</p>
                  </div>
                )}
                {bankInfo.alias && (
                  <div>
                    <p className="text-slate-400">Alias SIPAP:</p>
                    <p className="font-bold text-black select-all">{bankInfo.alias}</p>
                  </div>
                )}
              </>
            )}
            <div>
              <p className="text-slate-400">Monto Total a Transferir:</p>
              <p className="font-black text-emerald-700 text-sm">{formatCurrency(Math.round(order.totalAmount))}</p>
            </div>
            <div>
              <p className="text-slate-400">Concepto de la transferencia:</p>
              <p className="font-black text-black text-sm select-all">Pedido #{order.id}</p>
            </div>
          </div>
          {bankInfo?.notes && <p className="text-xs text-slate-600">{bankInfo.notes}</p>}
          {bankInfoLoaded && !bankInfo && (
            <p className="text-xs text-slate-600">Te contactaremos por WhatsApp o email con los datos para completar la transferencia.</p>
          )}
        </div>
      )}

      <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
        {waitingStaff ? (
          <>
            <h4 className="font-bold text-sm">✓ Comprobante recibido</h4>
            <p className="text-xs text-slate-300">
              Lo estamos verificando contra la cuenta. Tus prendas siguen reservadas y te avisamos por email apenas se confirme el pago.
            </p>
          </>
        ) : confirmed ? (
          <>
            <h4 className="font-bold text-sm">Pedido en curso</h4>
            <p className="text-xs text-slate-300">Estado: {order.status}</p>
          </>
        ) : (
          <>
            <h4 className="font-bold text-sm">{rejected ? 'Tu comprobante fue rechazado' : 'Subí tu comprobante de pago'}</h4>
            {rejected && order.receiptRejectionReason && (
              <p className="p-2 bg-red-500/20 text-red-200 text-xs font-bold rounded-lg">Motivo: {order.receiptRejectionReason}</p>
            )}
            {canUpload && order.paymentDeadlineAt ? (
              <p className="text-xs text-slate-300">
                {rejected ? 'Subí uno válido' : 'Transferí y subí el comprobante'} antes del{' '}
                <strong className="text-white">{deadlineLabel(order.paymentDeadlineAt)}</strong>
                {timeLeft && <> (quedan {timeLeft})</>}. Si no, el pedido se cancela y las prendas vuelven a estar disponibles.
              </p>
            ) : (
              <p className="text-xs text-slate-300">Venció el plazo para subir el comprobante.</p>
            )}
          </>
        )}

        {canUpload && <ReceiptUploader orderId={orderId} hasReceipt={!!order.paymentReceiptUrl} onUploaded={load} />}
        {!canUpload && order.paymentReceiptUrl && <ReceiptUploader orderId={orderId} hasReceipt readOnly onUploaded={load} />}
        <p className="text-[11px] text-slate-400">También te mandamos por email el link a esta página, por si cerrás esta pestaña.</p>
      </div>
    </div>
  );
}
