'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/format';
import { ApiError } from '@/lib/api';
import { config } from '@/lib/config';
import {
  verifyEmail,
  confirmOtp,
  createOrder,
  uploadReceipt,
} from '@/lib/services/checkout';
import type { CheckoutResponse, ConfirmOtpResponse } from '@/types/api';

type CheckoutStep = 'email' | 'otp' | 'form' | 'success';

export default function CheckoutForm() {
  const { items, getSubtotal, getShippingCost, getTotal, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();

  // §6: Guest checkout steps: email → otp → form. Logged-in users skip to form.
  const [step, setStep] = useState<CheckoutStep>(isLoggedIn ? 'form' : 'email');

  // Email & OTP state
  const [guestEmail, setGuestEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpResponse, setOtpResponse] = useState<ConfirmOtpResponse | null>(null);

  // Form state
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

  // Receipt upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptError, setReceiptError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };

  // ── Step 1: Verify email (§6.1) ──
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Turnstile token is optional (§2.3)
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

  // ── Step 2: Confirm OTP (§6.2) ──
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

  // ── Step 3: Submit order (§6.3) ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('El carrito está vacío');
      return;
    }

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
          unitPrice: i.unitPrice,
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
        couponCode: formData.couponCode || undefined,
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
      clearCart();
      setStep('success');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'INSUFFICIENT_STOCK') {
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

  // ── Receipt upload (§6 / §2.4) ──
  const handleReceiptUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !createdOrder) return;

    // §6: JPG/PNG/WebP/GIF/PDF, max 5MB
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

  // ── SUCCESS VIEW ──
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
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700">
            <div>
              <p className="text-slate-400">Banco:</p>
              <p className="font-bold text-black">Basa / Itaú</p>
            </div>
            <div>
              <p className="text-slate-400">Titular:</p>
              <p className="font-bold text-black">TRECE13 S.R.L.</p>
            </div>
            <div>
              <p className="text-slate-400">RUC:</p>
              <p className="font-bold text-black">80123456-7</p>
            </div>
            <div>
              <p className="text-slate-400">Monto Total a Transferir:</p>
              <p className="font-black text-emerald-700 text-sm">{formatCurrency(getTotal())}</p>
            </div>
          </div>
        </div>

        {/* Receipt upload (§6 POST /checkout/:id/receipt) */}
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

  // ── EMAIL STEP (guest only) ──
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

          {/* §2.3: Turnstile only on this endpoint, render widget if site key is configured */}
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

  // ── OTP STEP ──
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

  // ── CHECKOUT FORM STEP ──
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
          {/* §6.3: customer.fullName (2-100 chars) */}
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
              {/* §6.3: phone validation — PY format */}
              <label className={labelClass}>Teléfono / WhatsApp *</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+595 981 ..."
                value={formData.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* §6.3: shipping.address min 10 chars */}
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
              {/* §6.3: postalCode 4-8 alphanumeric */}
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

          {/* §6.3: wantsClubMembership required */}
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

          {/* Coupon code — no preview/validation (§6.3) */}
          <div>
            <label className={labelClass}>Código de Cupón (Opcional)</label>
            <input
              type="text"
              name="couponCode"
              placeholder="DESCUENTO10"
              value={formData.couponCode}
              onChange={handleChange}
              className={inputClass}
            />
            <p className="text-[10px] text-slate-400 mt-1">
              El cupón se valida al confirmar el pedido.
            </p>
          </div>

          {/* Invoice data (optional) */}
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
                  <input type="text" name="invoiceRuc" required minLength={1} value={formData.invoiceRuc} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Razón Social *</label>
                  <input type="text" name="invoiceRazonSocial" required minLength={1} value={formData.invoiceRazonSocial} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Dirección Fiscal *</label>
                  <input type="text" name="invoiceDireccionFiscal" required minLength={1} value={formData.invoiceDireccionFiscal} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full py-4 bg-black text-white font-extrabold uppercase rounded-2xl shadow-xl hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Procesando Orden...' : 'Confirmar Pedido'}
          </button>
        </form>
      </div>

      {/* Summary Box */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 h-fit">
        <h3 className="font-extrabold text-sm uppercase text-black border-b pb-3">Resumen de Compra</h3>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-xs">
              <div>
                <p className="font-bold text-black">{item.productName}</p>
                <p className="text-slate-500">Talle: {item.size} x {item.quantity}</p>
              </div>
              <span className="font-bold">{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-bold text-black">{formatCurrency(getSubtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío:</span>
            <span className="font-bold text-black">{formatCurrency(getShippingCost())}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-black pt-2 border-t">
            <span>Total:</span>
            <span>{formatCurrency(getTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
