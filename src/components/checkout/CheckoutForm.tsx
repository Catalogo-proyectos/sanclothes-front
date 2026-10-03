'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCheckoutQuote } from '@/hooks/useCheckoutQuote';
import QuoteSummary, { CouponNotice } from '@/components/checkout/QuoteSummary';
import { formatCurrency } from '@/utils/format';
import { ApiError } from '@/lib/api';
import { config } from '@/lib/config';
import PhoneInput from '@/components/common/PhoneInput';
import {
  verifyEmail,
  confirmOtp,
  createOrder,
  uploadReceipt,
  fetchCheckoutOrder,
  getCheckoutIdentityToken,
} from '@/lib/services/checkout';
import { normalizeCouponCode } from '@/lib/services/quote';
import { fetchBankTransferInfo, type BankTransferInfo } from '@/lib/services/settings';
import type { CheckoutResponse, ConfirmOtpResponse } from '@/types/api';
import type { CheckoutQuote } from '@/types/quote';

type CheckoutStep = 'email' | 'otp' | 'form' | 'success';

export default function CheckoutForm() {
  const { items, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();


  const [step, setStep] = useState<CheckoutStep>(isLoggedIn ? 'form' : 'email');


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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<CheckoutResponse | null>(null);
  // El carrito se vacía al crear el pedido: el total se guarda antes y después se
  // reemplaza por el del backend (incluye cupones y beneficios de tier).
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  // Cupón que se cotiza (se aplica con el botón, no en cada tecla).
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);
  // 409 PRICE_CHANGED: el total cambió y el cliente tiene que volver a confirmar.
  const [priceChange, setPriceChange] = useState<{ previousTotal: number; newTotal: number; signature: string } | null>(null);
  const [bankInfo, setBankInfo] = useState<BankTransferInfo | null>(null);
  const [bankInfoLoaded, setBankInfoLoaded] = useState(false);

  useEffect(() => {
    if (step !== 'success' || !createdOrder) return;
    let cancelled = false;
    fetchBankTransferInfo().then((info) => {
      if (cancelled) return;
      setBankInfo(info);
      setBankInfoLoaded(true);
    });
    fetchCheckoutOrder(createdOrder.orderId)
      .then((order) => {
        if (!cancelled && Number.isFinite(order.totalAmount)) setOrderTotal(Math.round(order.totalAmount));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [step, createdOrder]);


  // Identidad de la quote = la misma con la que se crea el pedido (token OTP o
  // sesión). Solo existe en el paso del formulario: ahí ya hubo OTP o login, y
  // al pasar de anónimo a identificado cambia el token, así que se recotiza.
  const identityToken = step === 'form' ? getCheckoutIdentityToken() : null;
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptError, setReceiptError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };


  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {

      await verifyEmail(guestEmail);
      setStep('otp');
    } catch (err) {
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
      setOtpResponse(res);

      if (res.existingAccount) {
        setError('Ya tenés una cuenta con ese email. Podés iniciar sesión para un checkout más rápido.');
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
    // Solo se confirma contra la última quote READY del servidor.
    if (!canSubmit || !quote) return;
    const confirmedQuote: CheckoutQuote = quote;
    const confirmedSignature = quoteState.signature;

    setLoading(true);
    setError('');

    try {
      const customerEmail = isLoggedIn ? user?.email || '' : guestEmail;

      const order = await createOrder({
        // Sin precios: el backend precifica con el mismo motor de la quote.
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
        },
        wantsClubMembership: formData.wantsClubMembership,
        couponCode: appliedCoupon,
        // Total que el cliente vio y aceptó. El backend solo lo compara.
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
      // Monto del servidor: el desglose persistido (o la quote aceptada, que es la misma).
      setOrderTotal(order.totals?.total ?? confirmedQuote.total);
      setPriceChange(null);
      clearCart();
      setStep('success');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 && err.code === 'PRICE_CHANGED' && err.data?.quote) {
          // No se creó el pedido: se muestra la quote nueva y el cliente tiene
          // que confirmar otra vez, a mano. Nunca se reenvía solo.
          const newQuote = err.data.quote as CheckoutQuote;
          quoteState.replaceQuote(newQuote, confirmedSignature);
          setPriceChange({ previousTotal: confirmedQuote.total, newTotal: newQuote.total, signature: confirmedSignature });
        } else if (err.code === 'INVALID_PRODUCT' || err.code?.startsWith('COUPON_')) {
          setError((err as Error).message);
          quoteState.refresh();
        } else if (err.code === 'INSUFFICIENT_STOCK') {
          setError(`Sin stock suficiente para SKU: ${err.data?.sku || 'desconocido'}`);
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


  const handleReceiptUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !createdOrder) return;


    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setReceiptError('El archivo supera los 5MB permitidos.');
      return;
    }

    setReceiptUploading(true);
    setReceiptError('');

    try {
      await uploadReceipt(createdOrder.orderId, file);
      setReceiptUploaded(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'INVALID_ORDER_STATUS') {
        setReceiptError('La orden no acepta comprobantes en su estado actual.');
      } else {
        setReceiptError((err as Error).message);
      }
    } finally {
      setReceiptUploading(false);
    }
  };

  const inputClass = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-black outline-none';
  const labelClass = 'block text-xs font-bold uppercase text-slate-600 mb-1';


  if (step === 'success' && createdOrder) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black uppercase text-black">Pedido Generado Con Éxito</h2>
          <p className="text-sm text-slate-600">
            ID de Orden: <span className="font-extrabold text-black">{createdOrder.orderId}</span>
          </p>
          <p className="text-xs text-slate-500">{createdOrder.message}</p>
        </div>

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
              <p className="font-black text-emerald-700 text-sm">
                {orderTotal !== null ? formatCurrency(orderTotal) : '—'}
              </p>
            </div>
          </div>
          {bankInfo?.notes && <p className="text-xs text-slate-600">{bankInfo.notes}</p>}
          {bankInfoLoaded && !bankInfo && (
            <p className="text-xs text-slate-600">
              Te contactaremos por WhatsApp o email con los datos para completar la transferencia.
            </p>
          )}
        </div>


        <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3">
          <h4 className="font-bold text-sm">Subir Comprobante de Pago</h4>
          <p className="text-xs text-slate-300">
            Adjuntá el comprobante de transferencia (JPG, PNG, WebP, GIF o PDF, máx 5MB).
          </p>

          {receiptError && (
            <p className="p-2 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg">{receiptError}</p>
          )}

          {receiptUploaded ? (
            <div className="p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold rounded-xl text-center">
              Comprobante enviado para verificación por nuestro equipo.
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                className="text-xs text-slate-300"
              />
              <button
                onClick={handleReceiptUpload}
                disabled={receiptUploading}
                className="bg-white text-black text-xs font-extrabold px-4 py-2 rounded-xl hover:bg-slate-200 disabled:opacity-50"
              >
                {receiptUploading ? 'Subiendo...' : 'Subir'}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Link
            href="/dashboard"
            className="flex-1 bg-black text-white text-center py-3.5 rounded-xl font-bold uppercase text-xs hover:bg-slate-800"
          >
            Ver Mi Pedido en Dashboard
          </Link>
        </div>
      </div>
    );
  }


  if (step === 'email') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl space-y-6">
        <h2 className="text-xl font-black uppercase text-black text-center">Checkout — Verificar Email</h2>
        <p className="text-xs text-slate-500 text-center">
          Ingresá tu correo para recibir un código de verificación.
        </p>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl">{error}</div>
        )}

        <form onSubmit={handleVerifyEmail} className="space-y-4">
          <div>
            <label className={labelClass}>Correo Electrónico *</label>
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className={inputClass}
            />
          </div>


          {config.turnstile.enabled && (
            <div id="turnstile-widget" className="flex justify-center" />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white font-extrabold uppercase rounded-2xl shadow-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Código OTP'}
          </button>

          <p className="text-[10px] text-slate-400 text-center">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-black font-bold underline">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </div>
    );
  }


  if (step === 'otp') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl space-y-6">
        <h2 className="text-xl font-black uppercase text-black text-center">Verificar Código OTP</h2>
        <p className="text-xs text-slate-500 text-center">
          Enviamos un código de 6 dígitos a <span className="font-bold text-black">{guestEmail}</span>
        </p>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl">{error}</div>
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
            className="w-full py-4 bg-black text-white font-extrabold uppercase rounded-2xl shadow-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar Código'}
          </button>

          <button
            type="button"
            onClick={() => { setStep('email'); setError(''); setOtp(''); }}
            className="w-full text-xs text-slate-500 hover:text-black transition-colors"
          >
            ← Cambiar correo
          </button>
        </form>
      </div>
    );
  }


  return (
    <div className="max-w-5xl mx-auto my-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
        <h2 className="text-xl font-black uppercase text-black">Datos de Envío y Contacto</h2>

        {otpResponse?.existingAccount && (
          <div className="p-3 bg-blue-50 text-blue-800 text-xs font-bold rounded-xl">
            Ya tenés una cuenta asociada a este email.{' '}
            <Link href={`/login?email=${encodeURIComponent(guestEmail)}`} className="underline">
              Iniciar sesión
            </Link>{' '}
            para un checkout más rápido.
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-3 gap-4">
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


          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              name="wantsClubMembership"
              id="clubMembership"
              checked={formData.wantsClubMembership}
              onChange={handleChange}
              className="w-4 h-4 accent-black"
            />
            <label htmlFor="clubMembership" className="text-xs font-bold text-slate-700">
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
                className="px-4 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl disabled:opacity-40"
              >
                Aplicar
              </button>
              {appliedCoupon && (
                <button type="button" onClick={handleRemoveCoupon} className="px-3 text-xs font-bold text-slate-500 underline">
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
              <label htmlFor="requestsInvoice" className="text-xs font-bold text-slate-700">
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
            <div role="alert" data-testid="price-changed" className="p-3 bg-amber-50 text-amber-900 text-xs font-bold rounded-xl">
              El total de tu compra cambió de {formatCurrency(activePriceChange.previousTotal)} a{' '}
              {formatCurrency(activePriceChange.newTotal)}. Revisá el resumen y confirmá de nuevo si estás de acuerdo.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full py-4 bg-black text-white font-extrabold uppercase rounded-2xl shadow-xl hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4"
          >
            {loading
              ? 'Procesando Orden...'
              : activePriceChange && canSubmit
                ? `Confirmar con el nuevo total (${formatCurrency(activePriceChange.newTotal)})`
                : 'Confirmar Pedido'}
          </button>
          {!loading && !canSubmit && items.length > 0 && (
            <p className="text-[10px] text-slate-500 text-center" data-testid="confirm-blocked-reason">
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


      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 h-fit">
        <h3 className="font-extrabold text-sm uppercase text-black border-b pb-3">Resumen de Compra</h3>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item, index) => {
            // Con quote READY, el importe de la línea es el del servidor (incluye
            // flash y descuentos por cantidad); si no, referencia de catálogo.
            const serverLine = quoteStatus === 'ready' ? quote?.lines[index] : undefined;
            return (
              <div key={item.variantId} className="flex justify-between text-xs">
                <div>
                  <p className="font-bold text-black">{item.productName}</p>
                  <p className="text-slate-500">Talle: {item.size} x {item.quantity}</p>
                </div>
                <span className={serverLine ? 'font-bold' : 'font-bold text-slate-400'}>
                  {formatCurrency(serverLine ? serverLine.lineTotal : item.unitPrice * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-3">
          <QuoteSummary
            status={quoteStatus}
            quote={quote}
            error={quoteState.error}
            hasPriceIssue={quoteState.hasPriceIssue}
            onRetry={quoteState.refresh}
          />
        </div>
      </div>
    </div>
  );
}
