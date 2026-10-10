'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { fetchCheckoutOrder } from '@/lib/services/checkout';
import { fetchBankTransferInfo, type BankTransferInfo } from '@/lib/services/settings';
import type { CheckoutOrderDetail } from '@/types/api';
import ReceiptUploader from '@/components/checkout/ReceiptUploader';
import StatusBadge, { type StatusBadgeTone } from '@/components/common/StatusBadge';
import { CARD_CUT } from '@/components/common/headerStyles';

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

function CopyButton({ value, label, dark = false }: { value: string; label: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

  const tone = dark
    ? 'border-white/30 text-zinc-300 hover:border-white hover:text-white focus-visible:outline-white'
    : 'border-[#b6b2a7] text-[#50524a] hover:border-[#17191c] hover:text-[#17191c] focus-visible:outline-[#17191c]';

  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(value).then(() => setCopied(true), () => { })}
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      className={`inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${tone}`}
    >
      {copied ? <Check aria-hidden className="h-3.5 w-3.5 text-emerald-500" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
    </button>
  );
}

function SlipRow({ label, children, copy }: { label: string; children: ReactNode; copy?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#17191c]/10 py-3 last:border-b-0">
      <div className="min-w-0 space-y-0.5">
        <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#50524a]">{label}</dt>
        <dd className="break-words text-sm font-bold text-[#17191c] select-all">{children}</dd>
      </div>
      {copy && <CopyButton value={copy} label={label.toLowerCase()} />}
    </div>
  );
}

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
    return (
      <p className="border border-red-300 bg-red-50 p-4 font-mono text-xs font-bold uppercase tracking-wide text-red-700">
        {loadError}
      </p>
    );
  }
  if (!order) {
    return (
      <div className="border border-[#b6b2a7]/50 bg-white p-12 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#50524a]">Cargando pedido…</span>
      </div>
    );
  }

  const waitingStaff = order.status === 'Pago Pendiente de Verificación';
  const rejected = order.status === 'Comprobante Rechazado';
  const confirmed = !waitingStaff && !rejected && order.status !== 'Pedido Pendiente de Confirmación';

  const expired = !waitingStaff && !!order.paymentDeadlineAt && timeLeft === null;
  const canUpload = !!order.canUploadReceipt && !expired;
  const amount = Math.round(order.totalAmount);
  const concept = `Pedido #${order.id}`;

  const state: { title: string; badge: string; tone: StatusBadgeTone; live: boolean } = waitingStaff
    ? { title: 'Verificando tu pago', badge: 'En verificación', tone: 'sky', live: true }
    : confirmed
      ? { title: 'Pago confirmado', badge: order.status, tone: 'emerald', live: false }
      : expired
        ? { title: 'Plazo cumplido', badge: 'Sin comprobante', tone: 'zinc', live: false }
        : rejected
          ? { title: 'Revisá tu comprobante', badge: 'Rechazado', tone: 'red', live: true }
          : { title: 'Esperando tu pago', badge: 'Pendiente de pago', tone: 'amber', live: true };

  const receiptTitle = waitingStaff
    ? 'Comprobante recibido'
    : confirmed
      ? 'Pedido en curso'
      : rejected
        ? 'Tu comprobante fue rechazado'
        : 'Subí tu comprobante de pago';

  return (
    <div className="@container space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[#b6b2a7]/40 pb-6 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#50524a]">
            Pago por transferencia · SIPAP / QR
          </span>
          <h2 className="font-[family-name:var(--font-bebas)] text-2xl uppercase leading-none tracking-wider text-[#17191c] sm:text-3xl">
            {state.title}
          </h2>
        </div>
        <StatusBadge tone={state.tone} live={state.live} className="self-start sm:self-auto">
          {state.badge}
        </StatusBadge>
      </div>

      <div className={`grid grid-cols-1 items-start gap-6 ${confirmed ? '' : '@3xl:grid-cols-[1.15fr_1fr]'}`}>
        {!confirmed && (
          <section aria-labelledby={`slip-${orderId}`} className="border border-[#b6b2a7] bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#17191c]/10 px-5 pb-3 pt-5 sm:px-7">
              <h3
                id={`slip-${orderId}`}
                className="font-[family-name:var(--font-bebas)] text-xl uppercase leading-none tracking-wider text-[#17191c] sm:text-2xl"
              >
                Datos para transferir
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#50524a]">Copiá cada dato</span>
            </div>

            <div className="flex items-end justify-between gap-3 bg-[#17191c] px-5 py-5 text-white sm:px-7">
              <div className="space-y-1">
                <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Monto total a transferir
                </span>
                <span className="block font-[family-name:var(--font-bebas)] text-4xl leading-none tracking-wide sm:text-5xl">
                  {formatCurrency(amount)}
                </span>
              </div>
              <CopyButton value={String(amount)} label="monto" dark />
            </div>

<dl className="px-5 py-2 sm:px-7">
              <SlipRow label="Concepto" copy={concept}>
                {concept}
              </SlipRow>
              {bankInfo && (
                <>
                  <SlipRow label="Banco">{bankInfo.bankName}</SlipRow>
                  <SlipRow label="Titular">{bankInfo.accountHolder}</SlipRow>
                  <SlipRow label={bankInfo.accountType || 'Número de cuenta'} copy={bankInfo.accountNumber}>
                    {bankInfo.accountNumber}
                  </SlipRow>
                  {bankInfo.ruc && (
                    <SlipRow label="RUC / CI" copy={bankInfo.ruc}>
                      {bankInfo.ruc}
                    </SlipRow>
                  )}
                  {bankInfo.alias && (
                    <SlipRow label="Alias SIPAP" copy={bankInfo.alias}>
                      {bankInfo.alias}
                    </SlipRow>
                  )}
                </>
              )}
            </dl>

            {(bankInfo?.notes || (bankInfoLoaded && !bankInfo)) && (
              <p className="border-t border-[#17191c]/10 px-5 py-4 text-xs leading-relaxed text-[#50524a] sm:px-7">
                {bankInfo?.notes || 'Te contactaremos por WhatsApp o email con los datos para completar la transferencia.'}
              </p>
            )}
          </section>
        )}

<section
          aria-labelledby={`receipt-${orderId}`}
          className="relative space-y-5 overflow-hidden bg-[#17191c] p-6 text-white shadow-md sm:p-8"
          style={{ clipPath: CARD_CUT }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[-20px] -top-3 scale-x-95 select-none whitespace-nowrap text-center font-[family-name:var(--font-bebas)] text-[clamp(5.5rem,22vw,8rem)] leading-none tracking-[-0.025em] text-white opacity-5"
          >
            SANT CLOTHES
          </span>

          <div className="relative space-y-2">
            <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
              Comprobante de pago
            </span>
            <h3
              id={`receipt-${orderId}`}
              className="font-[family-name:var(--font-bebas)] text-3xl uppercase leading-none tracking-wider sm:text-4xl"
            >
              {receiptTitle}
            </h3>
          </div>

          <div className="relative space-y-4">
            {waitingStaff ? (
              <p className="font-mono text-xs leading-relaxed text-zinc-300">
                Lo estamos verificando contra la cuenta. Tus prendas siguen reservadas y te avisamos por email apenas se confirme el pago.
              </p>
            ) : confirmed ? (
              <p className="font-mono text-xs uppercase tracking-wide text-zinc-300">Estado: {order.status}</p>
            ) : (
              <>
                {rejected && order.receiptRejectionReason && (
                  <p className="border-l-2 border-red-400 bg-red-500/15 px-3 py-2 font-mono text-xs font-bold text-red-200">
                    Motivo: {order.receiptRejectionReason}
                  </p>
                )}
                {canUpload && order.paymentDeadlineAt ? (
                  <p className="font-mono text-xs leading-relaxed text-zinc-300">
                    {rejected ? 'Subí uno válido' : 'Transferí y subí el comprobante'} antes del{' '}
                    <strong className="text-white">{deadlineLabel(order.paymentDeadlineAt)}</strong>
                    {timeLeft && (
                      <>
                        {' '}(quedan <strong className="text-white">{timeLeft}</strong>)
                      </>
                    )}
                    . Si no, el pedido se cancela y las prendas vuelven a estar disponibles.
                  </p>
                ) : (
                  <p className="font-mono text-xs text-zinc-300">Venció el plazo para subir el comprobante.</p>
                )}
              </>
            )}

            {canUpload && <ReceiptUploader orderId={orderId} hasReceipt={!!order.paymentReceiptUrl} onUploaded={load} />}
            {!canUpload && order.paymentReceiptUrl && (
              <ReceiptUploader orderId={orderId} hasReceipt readOnly onUploaded={load} />
            )}
          </div>

          <p className="relative border-t border-white/10 pt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-zinc-500">
            También te mandamos por email el link a esta página, por si cerrás esta pestaña.
          </p>
        </section>
      </div>
    </div>
  );
}
