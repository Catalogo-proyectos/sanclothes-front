'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCheckoutQuote } from '@/hooks/useCheckoutQuote';
import QuoteSummary, { CouponNotice } from '@/components/checkout/QuoteSummary';
import { formatCurrency } from '@/utils/format';
import { ApiError } from '@/lib/api';
import { config } from '@/lib/config';
import PhoneInput from '@/components/common/PhoneInput';
import DeliveryLocationPicker from '@/components/checkout/DeliveryLocationPicker';
import type { DeliveryLocation } from '@/types/api';
import {
  verifyEmail,
  confirmOtp,
  createOrder,
  getCheckoutIdentity,
} from '@/lib/services/checkout';
import { normalizeCouponCode } from '@/lib/services/quote';
import type { CheckoutResponse, ConfirmOtpResponse } from '@/types/api';
import TurnstileWidget from '@/components/checkout/TurnstileWidget';
import OrderPaymentPanel from '@/components/checkout/OrderPaymentPanel';
import type { CheckoutQuote } from '@/types/quote';
import { CARD_CUT } from '@/components/common/headerStyles';

type CheckoutStep = 'email' | 'otp' | 'form' | 'success';

export default function CheckoutForm() {
  const { items, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();

const [chosenStep, setStep] = useState<CheckoutStep | null>(null);
  const step: CheckoutStep = chosenStep ?? (isLoggedIn ? 'form' : 'email');

const [guestEmail, setGuestEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpResponse, setOtpResponse] = useState<ConfirmOtpResponse | null>(null);

const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    locality: 'Asunción',
    province: 'Central',
    postalCode: '1429',
    wantsClubMembership: false,
    couponCode: '',
    requestsInvoice: false,
    invoiceRuc: '',
    invoiceRazonSocial: '',
    invoiceDireccionFiscal: '',
  });

  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<CheckoutResponse | null>(null);

const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [notice, setNotice] = useState('');
  
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);
  
  const [priceChange, setPriceChange] = useState<{ previousTotal: number; newTotal: number; signature: string } | null>(null);

const identityToken = step === 'form' ? getCheckoutIdentity() : null;
  const quoteState = useCheckoutQuote({
    items,
    couponCode: appliedCoupon,
    token: identityToken,
    enabled: step === 'form',
  });
  const { quote, status: quoteStatus } = quoteState;
  const quoteCoupon = quoteStatus === 'ready' ? quote?.discount.coupon ?? null : null;
  const couponBlocked = quoteCoupon?.status === 'INVALID' || quoteCoupon?.status === 'REQUIRES_IDENTITY';
  const canSubmit = quoteState.canConfirm && !couponBlocked && items.length > 0;
  const activePriceChange = priceChange && priceChange.signature === quoteState.signature ? priceChange : null;

  const handleApplyCoupon = () => {
    setAppliedCoupon(normalizeCouponCode(formData.couponCode));
  };

  const handleRemoveCoupon = () => {
    setFormData((prev) => ({ ...prev, couponCode: '' }));
    setAppliedCoupon(undefined);
  };

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };

const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (config.turnstile.enabled && !turnstileToken) {
      setError('Completá la verificación de seguridad para continuar.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await verifyEmail(guestEmail, turnstileToken ?? undefined);
      setStep('otp');
    } catch (err) {
      
      if (config.turnstile.enabled) setTurnstileReset((n) => n + 1);
      if (err instanceof ApiError && err.code === 'INVALID_EMAIL') {
        setError('El correo electrónico no es válido.');
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await confirmOtp(guestEmail, otp);

      if (verifyingAccount) {

setVerifyingAccount(false);
        setNotice('Correo verificado. Ya podés confirmar tu compra.');
      } else {
        setOtpResponse(res);
        if (res.existingAccount) {
          setError('Ya tenés una cuenta con ese email. Podés iniciar sesión para un checkout más rápido.');
        }
      }

      setStep('form');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'TOO_MANY_FAILED_OTP_ATTEMPTS') {
          setError('Demasiados intentos fallidos. Esperá 15 minutos e intentá de nuevo.');
        } else if (err.code === 'INVALID_OTP') {
          setError('El código OTP no es correcto. Revisá tu correo.');
        } else {
          setError((err as Error).message);
        }
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('El carrito está vacío');
      return;
    }
    
    if (!canSubmit || !quote) return;
    const confirmedQuote: CheckoutQuote = quote;
    const confirmedSignature = quoteState.signature;

    setLoading(true);
    setError('');

    try {
      const customerEmail = isLoggedIn ? user?.email || '' : guestEmail;

      const order = await createOrder({
        
        items: items.map((i) => ({
          sku: i.sku,
          productId: i.productId,
          size: i.size,
          qty: i.quantity,
        })),
        customer: {
          email: customerEmail,
          fullName: formData.fullName,
          phone: formData.phone,
        },
        shipping: {
          address: formData.address,
          locality: formData.locality,
          province: formData.province,
          postalCode: formData.postalCode,
          ...(deliveryLocation ? { location: deliveryLocation } : {}),
        },
        wantsClubMembership: formData.wantsClubMembership,
        couponCode: appliedCoupon,
        
        expectedTotal: confirmedQuote.total,
        requestsInvoice: formData.requestsInvoice || undefined,
        invoiceData: formData.requestsInvoice
          ? {
              ruc: formData.invoiceRuc || undefined,
              razonSocial: formData.invoiceRazonSocial || undefined,
              direccionFiscal: formData.invoiceDireccionFiscal || undefined,
            }
          : undefined,
      });

      setCreatedOrder(order);
      setPriceChange(null);
      clearCart();
      setStep('success');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 && err.code === 'PRICE_CHANGED' && err.data?.quote) {

const newQuote = err.data.quote as CheckoutQuote;
          quoteState.replaceQuote(newQuote, confirmedSignature);
          setPriceChange({ previousTotal: confirmedQuote.total, newTotal: newQuote.total, signature: confirmedSignature });
        } else if (err.code === 'INVALID_PRODUCT' || err.code?.startsWith('COUPON_')) {
          setError((err as Error).message);
          quoteState.refresh();
        } else if (err.code === 'INSUFFICIENT_STOCK') {
          setError(`Sin stock suficiente para SKU: ${err.data?.sku || 'desconocido'}`);
        } else if (err.status === 403 && err.code === 'EMAIL_VERIFICATION_REQUIRED') {

setGuestEmail(user?.email || '');
          setVerifyingAccount(true);
          setNotice('');
          setOtp('');
          setError('');
          setStep('email');
        } else if (err.code === 'EMAIL_MISMATCH') {
          setError('El email no coincide con el verificado. Volvé a iniciar el checkout.');
        } else if (err.code === 'EXPIRED_CHECKOUT_SESSION') {
          setError('La sesión de checkout expiró. Volvé a verificar tu email.');
          setStep('email');
        } else {
          setError((err as Error).message);
        }
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

const inputClass = 'w-full border border-[#d0d1d2] bg-[#f6f8f9] px-3.5 py-3 font-mono text-xs text-[#17191c] outline-none transition-colors placeholder:text-zinc-400 focus:border-[#17191c] focus:bg-white focus:ring-1 focus:ring-[#17191c] disabled:bg-zinc-100 disabled:text-zinc-500';
  const labelClass = 'mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#50524a]';
  const primaryButtonClass = 'w-full bg-[#17191c] px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40';

if (step === 'success' && createdOrder) {
    return (
      <div className="mx-auto my-4 max-w-4xl space-y-7 border border-[#d0d1d2] bg-white p-6 shadow-sm sm:p-9">
        <div className="text-center space-y-2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">Pedido confirmado</span>
          <h2 className="font-[family-name:var(--font-bebas)] text-4xl uppercase tracking-wider text-[#17191c]">Pedido generado con éxito</h2>
          <p className="font-mono text-xs text-zinc-600">
            ID de orden: <span className="font-bold text-black">{createdOrder.orderId}</span>
          </p>
          <p className="font-mono text-xs text-zinc-500">{createdOrder.message}</p>
        </div>

        <OrderPaymentPanel orderId={String(createdOrder.orderId)} />

        {isLoggedIn && (
          <div className="flex gap-4 border-t border-zinc-200 pt-6">
            <Link
              href="/dashboard"
              className="flex-1 bg-[#17191c] py-4 text-center font-mono text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-black"
            >
              Ver Mis Pedidos
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (step === 'email') {
    return (
      <div className="mx-auto my-4 max-w-lg space-y-6 border border-[#d0d1d2] bg-white p-6 shadow-sm sm:p-9">
        <div className="space-y-2 text-center">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">01 / Identificación</span>
          <h2 className="font-[family-name:var(--font-bebas)] text-3xl uppercase tracking-wider text-[#17191c]">
          {verifyingAccount ? 'Verificá tu correo para comprar' : 'Checkout — Verificar Email'}
          </h2>
        </div>
        <p className="text-center font-mono text-xs leading-relaxed text-zinc-500" data-testid="verify-email-intro">
          {verifyingAccount
            ? 'Para comprar con tu cuenta necesitamos confirmar que este correo es tuyo. Te enviamos un código de verificación.'
            : 'Ingresá tu correo para recibir un código de verificación.'}
        </p>

        {error && (
          <div className="border-l-2 border-red-500 bg-red-50 p-3 font-mono text-xs font-bold text-red-700">{error}</div>
        )}

        <form onSubmit={handleVerifyEmail} className="space-y-4">
          <div>
            <label className={labelClass}>Correo Electrónico *</label>
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}

              readOnly={verifyingAccount}
              className={verifyingAccount ? `${inputClass} bg-slate-100 text-slate-500` : inputClass}
            />
          </div>

{config.turnstile.enabled && (
            <TurnstileWidget siteKey={config.turnstile.siteKey} onToken={setTurnstileToken} resetKey={turnstileReset} />
          )}

          <button
            type="submit"
            disabled={loading}
            className={primaryButtonClass}
          >
            {loading ? 'Enviando...' : 'Enviar Código OTP'}
          </button>

          {!verifyingAccount && (
            <p className="text-center font-mono text-[10px] text-zinc-500">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-black font-bold underline">
                Iniciar sesión
              </Link>
            </p>
          )}
        </form>
      </div>
    );
  }

if (step === 'otp') {
    return (
      <div className="mx-auto my-4 max-w-lg space-y-6 border border-[#d0d1d2] bg-white p-6 shadow-sm sm:p-9">
        <div className="space-y-2 text-center">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">02 / Seguridad</span>
          <h2 className="font-[family-name:var(--font-bebas)] text-3xl uppercase tracking-wider text-[#17191c]">Verificar código OTP</h2>
        </div>
        <p className="text-center font-mono text-xs text-zinc-500">
          Enviamos un código de 6 dígitos a <span className="font-bold text-black">{guestEmail}</span>
        </p>

        {error && (
          <div className="border-l-2 border-red-500 bg-red-50 p-3 font-mono text-xs font-bold text-red-700">{error}</div>
        )}

        <form onSubmit={handleConfirmOtp} className="space-y-4">
          <div>
            <label className={labelClass}>Código OTP *</label>
            <input
              type="text"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={`${inputClass} text-center text-lg tracking-[0.3em] font-mono`}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={primaryButtonClass}
          >
            {loading ? 'Verificando...' : 'Verificar Código'}
          </button>

          {!verifyingAccount && (
            <button
              type="button"
              onClick={() => { setStep('email'); setError(''); setOtp(''); setTurnstileToken(null); }}
              className="w-full font-mono text-xs text-zinc-500 transition-colors hover:text-black"
            >
              ← Cambiar correo
            </button>
          )}
        </form>
      </div>
    );
  }

return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)] lg:items-start">
      <div className="space-y-7 border border-[#d0d1d2] bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-end justify-between gap-4 border-b border-[#17191c]/10 pb-5">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">03 / Entrega</span>
            <h2 className="mt-1 font-[family-name:var(--font-bebas)] text-3xl uppercase leading-none tracking-wider text-[#17191c] sm:text-4xl">Datos de envío y contacto</h2>
          </div>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400 sm:block">Campos obligatorios *</span>
        </div>

        {otpResponse?.existingAccount && (
          <div className="border-l-2 border-sky-500 bg-sky-50 p-3 font-mono text-xs font-bold text-sky-800">
            Ya tenés una cuenta asociada a este email.{' '}
            <Link href={`/login?email=${encodeURIComponent(guestEmail)}`} className="underline">
              Iniciar sesión
            </Link>{' '}
            para un checkout más rápido.
          </div>
        )}

        {notice && (
          <div role="status" data-testid="checkout-notice" className="border-l-2 border-emerald-500 bg-emerald-50 p-3 font-mono text-xs font-bold text-emerald-800">
            {notice}
          </div>
        )}

        {error && (
          <div className="border-l-2 border-red-500 bg-red-50 p-3 font-mono text-xs font-bold text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className={labelClass}>Nombre Completo *</label>
            <input
              type="text"
              name="fullName"
              required
              minLength={2}
              maxLength={100}
              value={formData.fullName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                disabled
                value={isLoggedIn ? user?.email || '' : guestEmail}
                className={`${inputClass} bg-slate-100 text-slate-500`}
              />
            </div>
            <div>

              <label htmlFor="checkout-phone" className={labelClass}>Celular / WhatsApp *</label>
              <PhoneInput
                id="checkout-phone"
                value={formData.phone}
                onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
                required
                className={inputClass}
                prefixClassName="text-xs font-medium text-slate-500"
              />
            </div>
          </div>

<div>
            <label className={labelClass}>Dirección de Entrega *</label>
            <input
              type="text"
              name="address"
              required
              minLength={10}
              placeholder="Calle y número de casa / depto"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Localidad *</label>
              <input
                type="text"
                name="locality"
                required
                value={formData.locality}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Departamento *</label>
              <input
                type="text"
                name="province"
                required
                value={formData.province}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>

              <label className={labelClass}>Código Postal *</label>
              <input
                type="text"
                name="postalCode"
                required
                minLength={4}
                maxLength={8}
                pattern="[A-Za-z0-9]{4,8}"
                value={formData.postalCode}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <DeliveryLocationPicker value={deliveryLocation} onChange={setDeliveryLocation} />

<div className="flex items-center gap-3 border border-[#d0d1d2] bg-[#f6f8f9] p-4">
            <input
              type="checkbox"
              name="wantsClubMembership"
              id="clubMembership"
              checked={formData.wantsClubMembership}
              onChange={handleChange}
              className="w-4 h-4 accent-black"
            />
            <label htmlFor="clubMembership" className="font-mono text-xs font-bold text-[#50524a]">
              Quiero unirme al SANT CLUB (beneficios y descuentos exclusivos)
            </label>
          </div>

<div>
            <label htmlFor="checkout-coupon" className={labelClass}>Código de Cupón (Opcional)</label>
            <div className="flex gap-2">
              <input
                id="checkout-coupon"
                type="text"
                name="couponCode"
                placeholder="DESCUENTO10"
                value={formData.couponCode}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyCoupon();
                  }
                }}
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={!normalizeCouponCode(formData.couponCode) || normalizeCouponCode(formData.couponCode) === appliedCoupon}
                className="bg-[#17191c] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-black disabled:opacity-40"
              >
                Aplicar
              </button>
              {appliedCoupon && (
                <button type="button" onClick={handleRemoveCoupon} className="px-3 font-mono text-xs font-bold text-zinc-500 underline">
                  Quitar
                </button>
              )}
            </div>
            <div className="mt-2">
              {normalizeCouponCode(formData.couponCode) && normalizeCouponCode(formData.couponCode) !== appliedCoupon && (
                <p className="text-[10px] text-slate-500 mb-1">Tocá &quot;Aplicar&quot; para que el cupón se tenga en cuenta en el total.</p>
              )}
              <CouponNotice coupon={quoteCoupon} />
            </div>
          </div>

<div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="requestsInvoice"
                id="requestsInvoice"
                checked={formData.requestsInvoice}
                onChange={handleChange}
                className="w-4 h-4 accent-black"
              />
              <label htmlFor="requestsInvoice" className="font-mono text-xs font-bold text-[#50524a]">
                Solicitar factura
              </label>
            </div>

            {formData.requestsInvoice && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-7">
                <div>
                  <label className={labelClass}>RUC *</label>
                  <input type="text" name="invoiceRuc" required value={formData.invoiceRuc} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Razón Social *</label>
                  <input type="text" name="invoiceRazonSocial" required value={formData.invoiceRazonSocial} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Dirección Fiscal *</label>
                  <input type="text" name="invoiceDireccionFiscal" required value={formData.invoiceDireccionFiscal} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            )}
          </div>

          {activePriceChange && (
            <div role="alert" data-testid="price-changed" className="border-l-2 border-amber-500 bg-amber-50 p-3 font-mono text-xs font-bold text-amber-900">
              El total de tu compra cambió de {formatCurrency(activePriceChange.previousTotal)} a{' '}
              {formatCurrency(activePriceChange.newTotal)}. Revisá el resumen y confirmá de nuevo si estás de acuerdo.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className={`${primaryButtonClass} mt-4`}
          >
            {loading
              ? 'Procesando Orden...'
              : activePriceChange && canSubmit
                ? `Confirmar con el nuevo total (${formatCurrency(activePriceChange.newTotal)})`
                : 'Confirmar Pedido'}
          </button>
          {!loading && !canSubmit && items.length > 0 && (
            <p className="text-center font-mono text-[10px] text-zinc-500" data-testid="confirm-blocked-reason">
              {couponBlocked
                ? 'Corregí o quitá el cupón para continuar.'
                : quoteStatus === 'loading' || quoteStatus === 'stale'
                  ? 'Calculando el total actualizado…'
                  : quoteState.error?.status === 401
                    ? 'Tu sesión de checkout venció.'
                    : 'No es posible confirmar la compra con el total actual.'}
              {quoteState.error?.status === 401 && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setOtp(''); }}
                    className="underline font-bold text-black"
                  >
                    Verificar el email de nuevo
                  </button>
                </>
              )}
            </p>
          )}
        </form>
      </div>

<aside
        className="relative h-fit space-y-5 overflow-hidden bg-[#17191c] p-6 text-white shadow-md lg:sticky lg:top-24"
        style={{ clipPath: CARD_CUT }}
      >
        <span aria-hidden className="pointer-events-none absolute -right-4 -top-7 select-none font-[family-name:var(--font-bebas)] text-[110px] leading-none text-white opacity-[0.035]">SANT</span>
        <div className="relative border-b border-white/15 pb-4">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-zinc-500">Tu selección</span>
          <h3 className="mt-1 font-[family-name:var(--font-bebas)] text-3xl uppercase leading-none tracking-wider">Resumen de compra</h3>
        </div>

        <div className="relative max-h-64 space-y-4 overflow-y-auto pr-1">
          {items.map((item, index) => {

const serverLine = quoteStatus === 'ready' ? quote?.lines[index] : undefined;
            return (
              <div key={item.variantId} className="flex justify-between gap-4 font-mono text-xs">
                <div>
                  <p className="font-bold text-white">{item.productName}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500">Talle: {item.size} × {item.quantity}</p>
                </div>
                <span className={serverLine ? 'shrink-0 font-bold text-white' : 'shrink-0 font-bold text-zinc-500'}>
                  {formatCurrency(serverLine ? serverLine.lineTotal : item.unitPrice * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="relative border-t border-white/15 pt-4">
          <QuoteSummary
            status={quoteStatus}
            quote={quote}
            error={quoteState.error}
            hasPriceIssue={quoteState.hasPriceIssue}
            onRetry={quoteState.refresh}
            variant="dark"
          />
        </div>
      </aside>
    </div>
  );
}
