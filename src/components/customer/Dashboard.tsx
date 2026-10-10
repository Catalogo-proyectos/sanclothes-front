'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  MessageSquare,
  User,
  Receipt,
  ArrowRight,
  Crown,
  ShoppingBag,
  KeyRound,
  Send,
} from 'lucide-react';
import type { OrderSummaryItem, CustomerTier, TicketDetail } from '@/types/api';
import { formatCurrency, formatDate } from '@/utils/format';
import { apiCall } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/lib/config';
import PhoneInput from '@/components/common/PhoneInput';
import StatusBadge, { type StatusBadgeTone } from '@/components/common/StatusBadge';
import OrderTicketModal from '@/components/customer/OrderTicketModal';
import { toPyE164, toPyLocalDigits } from '@/lib/phone';

const ORDER_STATUS_CONFIG: Record<string, { label: string; tone: StatusBadgeTone; live: boolean }> = {
  pending: { label: 'Pendiente', tone: 'amber', live: true },
  processing: { label: 'En Proceso', tone: 'amber', live: true },
  confirmed: { label: 'Confirmado', tone: 'amber', live: true },
  shipped: { label: 'Enviado', tone: 'sky', live: true },
  delivered: { label: 'Entregado', tone: 'emerald', live: false },
  cancelled: { label: 'Cancelado', tone: 'red', live: false },
  returned: { label: 'Devuelto', tone: 'zinc', live: false },
};

export default function Dashboard() {
  const { isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'tickets' | 'profile'>('orders');

  const [orders, setOrders] = useState<OrderSummaryItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummaryItem | null>(null);
  const closeOrderTicket = useCallback(() => setSelectedOrder(null), []);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [tickets, setTickets] = useState<TicketDetail[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [tier, setTier] = useState<CustomerTier | null>(null);

  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
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
      const me = await apiCall<{ id: string; firstName: string; lastName: string; email: string; phone?: string }>('GET', '/me', undefined, true);
      setProfileForm({
        firstName: me.firstName || '',
        lastName: me.lastName || '',
        phone: toPyE164(toPyLocalDigits(me.phone || '')),
      });
    } catch { }
  }, []);

  const fetchTier = useCallback(async () => {
    if (!config.features.loyalty) return;
    try {
      const url = `${config.api.origin}/api/v1/me/tier`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        setTier(await res.json());
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const timeoutId = window.setTimeout(() => {
      void Promise.all([fetchOrders(), fetchTickets(), fetchProfile(), fetchTier()]);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isLoggedIn, fetchOrders, fetchTickets, fetchProfile, fetchTier]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    try {
      await apiCall('PATCH', '/me', profileForm, true);
      setProfileMsg('Perfil actualizado correctamente.');
    } catch (err) {
      setProfileMsg((err as Error).message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    setPwMsg('');
    try {
      await apiCall('POST', '/me/change-password', pwForm, true);
      setPwMsg('Contraseña actualizada con éxito.');
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#b6b2a7]/40 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#50524a] block">
            CLIENTE REGISTRADO · SANT CLUB
          </span>
          <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] uppercase tracking-wider text-[#17191c] leading-none">
            {profileForm.firstName ? `HOLA, ${profileForm.firstName.toUpperCase()} ${profileForm.lastName ? profileForm.lastName.toUpperCase() : ''}` : 'PANEL PRIVADO'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge tone="emerald">Sesión activa</StatusBadge>
        </div>
      </div>

{tier && tier.currentTier && (
        <div className="bg-[#17191c] text-white border border-[#17191c] p-6 sm:p-8 relative overflow-hidden shadow-md">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-6 pointer-events-none opacity-5 select-none">
            <span className="font-[family-name:var(--font-bebas)] text-[160px] leading-none text-white">SANT</span>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400 stroke-[2]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-400">
                  MEMBRESÍA EXCLUSIVA · SANT CLUB
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wider uppercase text-white leading-none">
                {tier.currentTier.name}
              </h3>
              <p className="text-xs font-mono text-zinc-300 tracking-wide">
                {tier.currentTier.discountPercentage}% DE DESCUENTO EN TODOS LOS DROPS Y COMPRAS
              </p>
            </div>

            {tier.nextTier && (
              <div className="md:text-right space-y-1.5 min-w-[240px]">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-400 block">
                  SIGUIENTE NIVEL: <span className="text-white font-bold">{tier.nextTier.name.toUpperCase()}</span>
                </span>
                <p className="text-xs font-mono text-zinc-300">
                  FALTAN <span className="font-bold text-white">{formatCurrency(tier.centsToNextTier)}</span>
                </p>
                <div className="w-full md:w-60 h-2 bg-zinc-800 border border-white/20 p-0.5 mt-2">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, tier.progressPercentage))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

<div className="flex border-b border-[#b6b2a7]/50 w-full sm:gap-8">
        {(['orders', 'tickets', 'profile'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const desktopLabel =
            tab === 'orders' ? 'Mis Pedidos' : tab === 'tickets' ? 'Soporte al Cliente' : 'Mi Perfil & Seguridad';
          const mobileLabel =
            tab === 'orders' ? 'Mis Pedidos' : tab === 'tickets' ? 'Soporte' : 'Mi Perfil';
          const Icon = tab === 'orders' ? Package : tab === 'tickets' ? MessageSquare : User;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 sm:flex-initial justify-center sm:justify-start pb-3 sm:pb-3.5 pt-1 text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.08em] sm:tracking-[0.16em] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 sm:gap-2 px-1 sm:px-0 ${isActive ? 'text-[#17191c]' : 'text-[#50524a]/70 hover:text-[#17191c]'
                }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75] shrink-0" />
              <span className="hidden sm:inline">{desktopLabel}</span>
              <span className="sm:hidden">{mobileLabel}</span>
              {tab === 'orders' && !loadingOrders && orders.length > 0 && (
                <span
                  className={`text-[9.5px] font-mono px-1.5 py-0.2 border shrink-0 ${isActive
                      ? 'bg-[#17191c] text-white border-[#17191c]'
                      : 'bg-white text-[#50524a] border-[#b6b2a7]'
                    }`}
                >
                  {orders.length}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId="dashboard-active-tab-bar"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#17191c]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

{activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-12 text-center border border-[#b6b2a7]/50 bg-white">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#50524a]">
                Consultando pedidos registrados en el atelier…
              </span>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 sm:p-16 text-center border border-[#b6b2a7]/60 bg-white space-y-5">
              <ShoppingBag className="w-10 h-10 text-[#b6b2a7] stroke-[1] mx-auto" />
              <div className="space-y-1.5">
                <h3 className="text-3xl font-[family-name:var(--font-bebas)] tracking-wider text-[#17191c] uppercase">
                  NO REGISTRÁS PEDIDOS AÚN
                </h3>
                <p className="text-xs font-mono text-[#50524a] uppercase tracking-wide max-w-sm mx-auto">
                  Descubrí nuestros drops de alto gramaje, moldería boxfit y confección nacional en Ciudad del Este.
                </p>
              </div>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-[#17191c] text-white text-xs font-bold uppercase tracking-[0.16em] px-6 py-3.5 hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
                label: order.status,
                tone: 'zinc' as const,
                live: false,
              };

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="group relative bg-white border border-[#b6b2a7] p-5 sm:p-7 transition-all duration-200 hover:border-[#17191c] hover:shadow-[0_8px_30px_rgba(23,25,28,0.06)] cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-bold text-sm sm:text-base text-[#17191c] tracking-wider">
                          PEDIDO #{order.orderNumber}
                        </span>
                        <StatusBadge tone={statusConfig.tone} live={statusConfig.live}>
                          {statusConfig.label}
                        </StatusBadge>
                      </div>

                      <p className="text-xs font-mono text-[#50524a] uppercase tracking-wide">
                        <span>FECHA: {formatDate(order.createdAt).toUpperCase()}</span>
                        <span className="mx-2 text-[#b6b2a7]">·</span>
                        <span>
                          {order.itemCount} {order.itemCount === 1 ? 'PRENDA' : 'PRENDAS'}
                        </span>
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-[#17191c]/10 pt-3 sm:pt-0 gap-2">
                      <span className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] text-[#17191c] tracking-wide leading-none">
                        {formatCurrency(order.total)}
                      </span>
                      <button
                        type="button"
                        aria-label={`Ver ticket del pedido ${order.orderNumber}`}
                        className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] border border-[#17191c] px-3.5 py-1.5 bg-transparent text-[#17191c] group-hover:bg-[#17191c] group-hover:text-white transition-colors cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>Ver Ticket</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedOrder && (
        <OrderTicketModal
          orderId={selectedOrder.id}
          statusLabel={ORDER_STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
          onClose={closeOrderTicket}
        />
      )}

{activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#17191c]/15 pb-2.5">
              <h3 className="font-[family-name:var(--font-bebas)] text-xl sm:text-2xl tracking-wider text-[#17191c] uppercase leading-none">
                TUS TICKETS & CONSULTAS
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#50524a]">
                ATENCIÓN DIRECTA
              </span>
            </div>

            {loadingTickets ? (
              <div className="p-8 text-center border border-[#b6b2a7]/50 bg-white text-xs font-mono text-[#50524a]">
                Cargando tickets de soporte…
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-10 text-center border border-[#b6b2a7]/50 bg-white space-y-2">
                <MessageSquare className="w-8 h-8 text-[#b6b2a7] stroke-[1] mx-auto" />
                <p className="text-xs font-mono uppercase tracking-wide text-[#50524a]">
                  No tenés tickets abiertos en este momento.
                </p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  className="bg-white border border-[#b6b2a7] p-5 space-y-2.5 hover:border-[#17191c] transition-colors"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#17191c] tracking-wider">
                      TICKET #{ticket.ticketNumber}
                    </span>
                    <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 border border-[#17191c] bg-[#17191c] text-white">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#17191c]">
                    {ticket.subject}
                  </p>
                </div>
              ))
            )}
          </div>

<div className="lg:col-span-6 bg-white border border-[#17191c] p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="space-y-1 border-b border-[#17191c]/10 pb-3">
              <h3 className="font-[family-name:var(--font-bebas)] text-2xl sm:text-3xl tracking-wider text-[#17191c] uppercase leading-none">
                CREAR NUEVO TICKET
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#50524a]">
                Respuesta directa del equipo atelier de Ciudad del Este.
              </p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#50524a] mb-1.5">
                  Asunto de la Consulta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Estado de mi envío / Cambio de talle"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-[#f6f8f9] border border-[#b6b2a7] px-3.5 py-2.5 text-xs text-[#17191c] placeholder:text-[#b6b2a7] focus:border-[#17191c] focus:bg-white focus:outline-none transition-colors rounded-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#50524a] mb-1.5">
                  Mensaje detallado
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describí tu consulta con el mayor detalle posible…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-[#f6f8f9] border border-[#b6b2a7] px-3.5 py-2.5 text-xs text-[#17191c] placeholder:text-[#b6b2a7] focus:border-[#17191c] focus:bg-white focus:outline-none transition-colors rounded-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingTicket}
                className="w-full py-3.5 bg-[#17191c] text-white text-xs font-bold uppercase tracking-[0.18em] hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5 stroke-[2]" />
                <span>{submittingTicket ? 'Enviando Ticket…' : 'Enviar Ticket al Atelier'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

{activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <div className="bg-white border border-[#b6b2a7] p-6 sm:p-8 space-y-5">
            <div className="space-y-1 border-b border-[#17191c]/10 pb-3">
              <h3 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wider text-[#17191c] uppercase leading-none">
                DATOS DEL PERFIL
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#50524a]">
                Información personal para envíos y facturación.
              </p>
            </div>

            {profileMsg && (
              <p className="text-xs font-mono uppercase tracking-wider text-[#17191c] bg-[#f6f8f9] border border-[#17191c] p-2.5">
                {profileMsg}
              </p>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#50524a] mb-1.5">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full bg-[#f6f8f9] border border-[#b6b2a7] px-3.5 py-2.5 text-xs text-[#17191c] focus:border-[#17191c] focus:bg-white focus:outline-none transition-colors rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#50524a] mb-1.5">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full bg-[#f6f8f9] border border-[#b6b2a7] px-3.5 py-2.5 text-xs text-[#17191c] focus:border-[#17191c] focus:bg-white focus:outline-none transition-colors rounded-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#50524a] mb-1.5"
                >
                  Celular / WhatsApp (opcional)
                </label>
                <PhoneInput
                  id="profile-phone"
                  value={profileForm.phone}
                  onChange={(phone) => setProfileForm((prev) => ({ ...prev, phone }))}
                  className="w-full bg-[#f6f8f9] border border-[#b6b2a7] px-3.5 py-2.5 text-xs text-[#17191c] focus:border-[#17191c] focus:bg-white focus:outline-none transition-colors rounded-none"
                  prefixClassName="text-xs font-mono text-[#50524a]"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3.5 bg-[#17191c] text-white text-xs font-bold uppercase tracking-[0.18em] hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? 'Guardando Cambios…' : 'Guardar Cambios'}
              </button>
            </form>
          </div>

<div className="bg-white border border-[#b6b2a7] p-6 sm:p-8 space-y-5">
            <div className="space-y-1 border-b border-[#17191c]/10 pb-3">
              <h3 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wider text-[#17191c] uppercase leading-none">
                SEGURIDAD & ACCESO
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#50524a]">
                Actualizá tu contraseña de acceso privado a SANT CLUB.
              </p>
            </div>

            {pwMsg && (
              <p className="text-xs font-mono uppercase tracking-wider text-[#17191c] bg-[#f6f8f9] border border-[#17191c] p-2.5">
                {pwMsg}
              </p>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#50524a] mb-1.5">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className="w-full bg-[#f6f8f9] border border-[#b6b2a7] px-3.5 py-2.5 text-xs text-[#17191c] focus:border-[#17191c] focus:bg-white focus:outline-none transition-colors rounded-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#50524a] mb-1.5">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="w-full bg-[#f6f8f9] border border-[#b6b2a7] px-3.5 py-2.5 text-xs text-[#17191c] focus:border-[#17191c] focus:bg-white focus:outline-none transition-colors rounded-none"
                />
                <p className="text-[10px] font-mono text-[#50524a] uppercase tracking-wide mt-1">
                  Mínimo 8 caracteres alfanuméricos.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingPw}
                className="w-full py-3.5 bg-[#17191c] text-white text-xs font-bold uppercase tracking-[0.18em] hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>{savingPw ? 'Actualizando…' : 'Cambiar Contraseña'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
