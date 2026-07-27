'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/format';
import { apiCall } from '@/lib/api';
import { CheckoutResponse } from '@/types/api';
import Link from 'next/link';

export default function CheckoutForm() {
  const { items, getSubtotal, getShippingCost, getTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Asunción',
    state: 'Central',
    zipCode: '1429',
    country: 'Paraguay',
    referralCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<CheckoutResponse | null>(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const checkoutItems = items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      }));

      const order = await apiCall<CheckoutResponse>('POST', '/checkout', {
        items: checkoutItems,
        ...formData,
      });

      setCreatedOrder(order);
      clearCart();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-5xl">🎉</span>
          <h2 className="text-2xl font-black uppercase text-black">¡Pedido Generado Con Éxito!</h2>
          <p className="text-sm text-slate-600">
            Número de Orden: <span className="font-extrabold text-black">{createdOrder.orderNumber}</span>
          </p>
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
              <p className="font-black text-emerald-700 text-sm">{formatCurrency(createdOrder.total)}</p>
            </div>
          </div>
        </div>

        {/* Upload Proof */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3">
          <h4 className="font-bold text-sm">Subir Comprobante de Pago</h4>
          <p className="text-xs text-slate-300">
            Una vez realizada la transferencia, podés adjuntar el comprobante o foto aquí para validación inmediata.
          </p>

          {receiptUploaded ? (
            <div className="p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold rounded-xl text-center">
              ✓ Comprobante enviado para verificación por nuestro equipo.
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              <input type="file" accept="image/*,.pdf" className="text-xs text-slate-300" />
              <button
                onClick={() => setReceiptUploaded(true)}
                className="bg-white text-black text-xs font-extrabold px-4 py-2 rounded-xl hover:bg-slate-200"
              >
                Subir
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

  return (
    <div className="max-w-5xl mx-auto my-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
        <h2 className="text-xl font-black uppercase text-black">Datos de Envío y Contacto</h2>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nombre *</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Apellido *</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Teléfono / WhatsApp *</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+595 981 ..."
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Dirección de Entrega *</label>
            <input
              type="text"
              name="address"
              required
              placeholder="Calle y número de casa / depto"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Ciudad *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Código de Referido (Opcional)</label>
              <input
                type="text"
                name="referralCode"
                placeholder="FRIEND10"
                value={formData.referralCode}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full py-4 bg-black text-white font-extrabold uppercase rounded-2xl shadow-xl hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Procesando Orden...' : 'Confirmar Pedido 🚀'}
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
