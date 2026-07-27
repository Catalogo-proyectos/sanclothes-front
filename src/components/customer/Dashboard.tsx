'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { OrderSummaryItem, TicketDetail } from '@/types/api';
import { formatCurrency, formatDate } from '@/utils/format';
import { apiCall } from '@/lib/api';

export default function Dashboard() {
  const { data: ordersData, loading: loadingOrders } = useFetch<{ items: OrderSummaryItem[] }>('GET', '/me/orders', true);
  const { data: ticketsData, loading: loadingTickets, refetch: refetchTickets } = useFetch<{ items: TicketDetail[] }>('GET', '/me/tickets', true);

  const [activeTab, setActiveTab] = useState<'orders' | 'tickets'>('orders');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

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
      refetchTickets();
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
        <p className="text-xs text-slate-500 mt-1">Gestión de historial de compras y tickets de asistencia técnica.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'orders' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Mis Pedidos 📦
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'tickets' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Tickets de Soporte 💬
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-8 text-center text-xs text-slate-400 font-bold">Cargando pedidos...</div>
          ) : !ordersData?.items || ordersData.items.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl text-xs text-slate-500 font-medium">
              No registrás pedidos aún.
            </div>
          ) : (
            ordersData.items.map((order) => (
              <div key={order.orderId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-black">{order.orderNumber}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      order.status === 'Pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Fecha: {formatDate(order.createdAt)} | {order.itemCount} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-black">{formatCurrency(order.total)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ticket List */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-slate-800">Tus Tickets</h3>
            {loadingTickets ? (
              <div className="p-4 text-xs text-slate-400">Cargando tickets...</div>
            ) : !ticketsData?.items || ticketsData.items.length === 0 ? (
              <p className="text-xs text-slate-500">No tenés tickets abiertos.</p>
            ) : (
              ticketsData.items.map((ticket) => (
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

          {/* New Ticket Form */}
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
    </div>
  );
}
