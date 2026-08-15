'use client';

import { useCallback, useEffect, useState } from 'react';
import { OrderSummaryItem, CustomerTier, TicketDetail } from '@/types/api';
import { formatCurrency, formatDate } from '@/utils/format';
import { apiCall } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/lib/config';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'En Proceso',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  returned: 'Devuelto',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-slate-100 text-slate-800',
};

export default function Dashboard() {
  const { isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'tickets' | 'profile'>('orders');

  // §3: GET /me/orders returns flat array (not paginated)
  const [orders, setOrders] = useState<OrderSummaryItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Tickets
  const [tickets, setTickets] = useState<TicketDetail[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // §7: Customer tier
  const [tier, setTier] = useState<CustomerTier | null>(null);

  // Profile editing
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Change password
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  // New ticket
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      // §3: flat array response
      const data = await apiCall<OrderSummaryItem[]>('GET', '/me/orders', undefined, true);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const data = await apiCall<{ items: TicketDetail[] }>('GET', '/me/tickets', undefined, true);
      setTickets(data?.items ?? []);
    } catch {
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      // §3: GET /me → { id, firstName, lastName, email, phone, addresses:[] }
      const me = await apiCall<{ id: string; firstName: string; lastName: string; email: string; phone?: string }>('GET', '/me', undefined, true);
      setProfileForm({
        firstName: me.firstName || '',
        lastName: me.lastName || '',
        phone: me.phone || '',
      });
    } catch { /* ignore */ }
  }, []);

  const fetchTier = useCallback(async () => {
    if (!config.features.loyalty) return;
    try {
      // §7: GET /api/v1/me/tier
      const url = `${config.api.origin}/api/v1/me/tier`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem(config.jwt.storageKey) || ''}` },
      });
      if (res.ok) {
        setTier(await res.json());
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchOrders();
    fetchTickets();
    fetchProfile();
    fetchTier();
  }, [isLoggedIn, fetchOrders, fetchTickets, fetchProfile, fetchTier]);

  // §3: PATCH /me
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await apiCall('PATCH', '/me', profileForm, true);
      setProfileMsg('Perfil actualizado.');
    } catch (err) {
      setProfileMsg((err as Error).message);
    } finally {
      setSavingProfile(false);
    }
  };

  // §3: POST /me/change-password (not /me/password)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    setPwMsg('');
    try {
      await apiCall('POST', '/me/change-password', pwForm, true);
      setPwMsg('Contraseña actualizada.');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwMsg((err as Error).message);
    } finally {
      setSavingPw(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newMessage) return;
    setSubmittingTicket(true);
    try {
      await apiCall('POST', '/me/tickets', {
        subject: newSubject,
        message: newMessage,
      }, true);
      setNewSubject('');
      setNewMessage('');
      fetchTickets();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase text-black">Mi Cuenta & Pedidos</h1>
        <p className="text-xs text-slate-500 mt-1">Gestión de historial de compras, perfil y soporte.</p>
      </div>

      {/* §7: Tier progress */}
      {tier && tier.currentTier && (
        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Tu nivel</p>
            <p className="text-lg font-black">{tier.currentTier.name}</p>
            <p className="text-xs text-slate-300">{tier.currentTier.discountPercentage}% de descuento</p>
          </div>
          {tier.nextTier && (
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Siguiente nivel</p>
              <p className="text-sm font-bold">{tier.nextTier.name}</p>
              <p className="text-xs text-slate-300">Faltan {formatCurrency(tier.centsToNextTier)}</p>
              <div className="w-32 h-1.5 bg-slate-600 rounded-full mt-1">
                <div className="h-full bg-white rounded-full" style={{ width: `${tier.progressPercentage}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        {(['orders', 'tickets', 'profile'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab === 'orders' ? 'Mis Pedidos' : tab === 'tickets' ? 'Soporte' : 'Mi Perfil'}
          </button>
        ))}
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-8 text-center text-xs text-slate-400 font-bold">Cargando pedidos...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl text-xs text-slate-500 font-medium">
              No registrás pedidos aún.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-black">{order.orderNumber}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      ORDER_STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-700'
                    }`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Fecha: {formatDate(order.createdAt)} | {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-black">{formatCurrency(order.total)}</p>
                  <p className="text-[10px] text-slate-400">{order.currency}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TICKETS TAB */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-slate-800">Tus Tickets</h3>
            {loadingTickets ? (
              <div className="p-4 text-xs text-slate-400">Cargando tickets...</div>
            ) : tickets.length === 0 ? (
              <p className="text-xs text-slate-500">No tenés tickets abiertos.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.ticketId} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-black">{ticket.ticketNumber}</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1">{ticket.subject}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-slate-800">Crear Nuevo Ticket de Soporte</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Asunto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Estado de mi envío"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Mensaje</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describí tu consulta..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button
                type="submit"
                disabled={submittingTicket}
                className="w-full py-2.5 bg-black text-white text-xs font-extrabold uppercase rounded-xl hover:bg-slate-800"
              >
                {submittingTicket ? 'Enviando...' : 'Enviar Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Edit profile */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-slate-800">Editar Perfil</h3>
            {profileMsg && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg">{profileMsg}</p>
            )}
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 bg-black text-white text-xs font-extrabold uppercase rounded-xl hover:bg-slate-800"
              >
                {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>

          {/* Change password — §3: POST /me/change-password */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-slate-800">Cambiar Contraseña</h3>
            {pwMsg && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg">{pwMsg}</p>
            )}
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-[10px] text-slate-400 mt-1">Mínimo 8 caracteres.</p>
              </div>
              <button
                type="submit"
                disabled={savingPw}
                className="w-full py-2.5 bg-black text-white text-xs font-extrabold uppercase rounded-xl hover:bg-slate-800"
              >
                {savingPw ? 'Guardando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
