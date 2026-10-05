'use client';

import { formatCurrency } from '@/utils/format';
import type { QuoteError, QuoteStatus } from '@/hooks/useCheckoutQuote';
import type { CheckoutQuote, QuoteCoupon } from '@/types/quote';

/**
 * Muestra los importes de la quote del servidor TAL CUAL: subtotal, descuento,
 * envío y total vienen del backend; acá solo se formatean, nunca se recalculan.
 */

const STYLES = {
  checkout: {
    root: 'space-y-2 text-xs text-slate-600',
    strong: 'font-bold text-black',
    total: 'flex justify-between text-sm font-black text-black pt-2 border-t',
    muted: 'text-[10px] text-slate-400',
    alert: 'p-3 rounded-xl text-xs font-bold',
  },
  drawer: {
    root: 'space-y-2 text-xs font-mono text-[#50524a]',
    strong: 'text-[#17191c] font-semibold',
    total: 'flex justify-between items-baseline pt-3 border-t border-[#17191c]/10 text-[#17191c]',
    muted: 'text-[10px] text-[#50524a]',
    alert: 'p-3 text-[11px] font-mono',
  },
} as const;

const COUPON_FALLBACK_MESSAGES: Record<string, string> = {
  TIER_IS_GREATER: 'Tu nivel de cliente ya te da un beneficio igual o mayor: el cupón no se usa y lo conservás.',
  NO_DISCOUNT: 'El cupón no genera descuento sobre este carrito.',
  REQUIRES_IDENTITY: 'Este cupón es personal: verificá tu email o iniciá sesión para usarlo.',
};

/** Mensaje público del cupón: el que entrega el backend (no se agrega información propia). */
export function couponMessage(coupon: QuoteCoupon): string | null {
  if (coupon.status === 'APPLIED') return null;
  return coupon.message || (coupon.reason ? COUPON_FALLBACK_MESSAGES[coupon.reason] ?? null : null) || 'El cupón no es válido.';
}

export function CouponNotice({ coupon, variant = 'checkout' }: { coupon: QuoteCoupon | null; variant?: keyof typeof STYLES }) {
  if (!coupon) return null;
  const s = STYLES[variant];
  if (coupon.status === 'APPLIED') {
    return (
      <p role="status" data-testid="coupon-notice" data-coupon-status="APPLIED" className={`${s.alert} bg-emerald-50 text-emerald-800`}>
        Cupón {coupon.code} aplicado: −{formatCurrency(coupon.amount)}
      </p>
    );
  }
  const tone =
    coupon.status === 'NOT_APPLIED'
      ? 'bg-blue-50 text-blue-800'
      : coupon.status === 'REQUIRES_IDENTITY'
        ? 'bg-amber-50 text-amber-800'
        : 'bg-red-50 text-red-700';
  return (
    <p
      role="status"
      data-testid="coupon-notice"
      data-coupon-status={coupon.status}
      data-coupon-reason={coupon.reason ?? ''}
      className={`${s.alert} ${tone}`}
    >
      {couponMessage(coupon)}
    </p>
  );
}

interface QuoteSummaryProps {
  status: QuoteStatus;
  quote: CheckoutQuote | null;
  error: QuoteError | null;
  hasPriceIssue: boolean;
  onRetry: () => void;
  variant?: keyof typeof STYLES;
}

export default function QuoteSummary({ status, quote, error, hasPriceIssue, onRetry, variant = 'checkout' }: QuoteSummaryProps) {
  const s = STYLES[variant];

  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <div className={s.root} data-testid="quote-summary" data-quote-status="loading" aria-busy="true">
        <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
        <p className={s.muted}>Calculando el total…</p>
      </div>
    );
  }

  if (status === 'error' || status === 'unavailable') {
    return (
      <div className={s.root} data-testid="quote-summary" data-quote-status={status}>
        <p role="alert" className={`${s.alert} bg-red-50 text-red-700`}>
          {status === 'unavailable'
            ? 'Uno de los productos del carrito ya no está disponible. Quitalo para continuar.'
            : 'No pudimos calcular el total de tu compra.'}
        </p>
        {status === 'error' && (
          <button type="button" onClick={onRetry} className="underline font-bold cursor-pointer">
            Reintentar
          </button>
        )}
        {error?.code && <span className="sr-only">{error.code}</span>}
      </div>
    );
  }

  if (!quote) return null;

  if (hasPriceIssue) {
    // M2: nunca se muestra ni se confirma un precio <= 0.
    return (
      <div className={s.root} data-testid="quote-summary" data-quote-status="price-issue">
        <p role="alert" className={`${s.alert} bg-red-50 text-red-700`}>
          Hay un problema con el precio de un producto del carrito. No es posible confirmar la compra por ahora; escribinos y lo resolvemos.
        </p>
      </div>
    );
  }

  const { discount, shipping } = quote;
  const stale = status === 'stale';

  return (
    <div className={`${s.root} ${stale ? 'opacity-50' : ''}`} data-testid="quote-summary" data-quote-status={status} aria-busy={stale}>
      {stale && <p className={s.muted}>Actualizando el total…</p>}
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span className={s.strong} data-testid="quote-subtotal">{formatCurrency(quote.subtotal)}</span>
      </div>
      {discount.amount > 0 && (
        <div className="flex justify-between">
          <span>
            {discount.applied === 'TIER'
              ? `Beneficio ${discount.tier?.name ?? 'de nivel'}${discount.tier ? ` (${discount.tier.percent}%)` : ''}:`
              : `Cupón ${discount.coupon?.code ?? ''}:`}
          </span>
          <span className="font-bold text-emerald-700" data-testid="quote-discount">−{formatCurrency(discount.amount)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Envío:</span>
        <span className={s.strong} data-testid="quote-shipping" data-shipping-mode={shipping.mode}>
          {shipping.amount === 0 ? 'Gratis' : formatCurrency(shipping.amount)}
        </span>
      </div>
      {shipping.mode === 'FREE_OVER_AMOUNT' && shipping.amount > 0 && shipping.remainingForFree !== null && (
        <p className={s.muted} data-testid="quote-free-shipping-hint">
          Te faltan {formatCurrency(shipping.remainingForFree)} para el envío gratis
          {shipping.freeThreshold !== null ? ` (desde ${formatCurrency(shipping.freeThreshold)})` : ''}.
        </p>
      )}
      <div className={s.total}>
        <span className={variant === 'drawer' ? 'text-xs font-bold uppercase' : ''}>Total:</span>
        <span
          className={variant === 'drawer' ? 'text-2xl font-[family-name:var(--font-bebas)] tracking-wider' : ''}
          data-testid="quote-total"
        >
          {formatCurrency(quote.total)}
        </span>
      </div>
      {!quote.identified && (
        <p className={s.muted}>Los beneficios de tu nivel de cliente y los cupones se aplican al identificarte en el checkout.</p>
      )}
    </div>
  );
}
