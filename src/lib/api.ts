import { config } from './config';
import { getStoredToken } from './auth';
import { MOCK_CUTS, MOCK_PRODUCTS } from '@/mocks/catalog';
import { toBackendProduct } from '@/mocks/toBackend';
import { MOCK_AUTH_RESPONSE, MOCK_USER, generateMockJWT } from '@/mocks/auth';
import { MOCK_ORDERS, MOCK_TICKETS, createMockOrder } from '@/mocks/checkout';
import { CheckoutRequest, CustomerProfile, TicketDetail, TicketMessage } from '@/types/api';

/**
 * Universal API Client with automatic Mock Data Router fallback.
 * When config.api.useMock === true, requests are handled by Mock Repositories.
 * When config.api.useMock === false, requests execute fetch() against Fastify backend.
 */
export async function apiCall<T = any>(
  method: string,
  path: string,
  body?: any,
  requireAuth: boolean = false
): Promise<T> {
  const normalizedMethod = method.toUpperCase();

  // If mock mode is ON, execute mock handlers
  if (config.api.useMock) {
    return handleMockRequest<T>(normalizedMethod, path, body, requireAuth);
  }

  // Real backend call
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized: No JWT token found in storage.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${config.api.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  const response = await fetch(url, {
    method: normalizedMethod,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMessage = errorJson.error;
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Mock Request Handler simulating backend REST endpoints with 150ms latency.
 */
async function handleMockRequest<T>(
  method: string,
  path: string,
  body?: any,
  requireAuth: boolean = false
): Promise<T> {
  // Simulate network latency
  await new Promise((res) => setTimeout(res, 150));

  if (requireAuth) {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized: Missing token in mock session.');
    }
  }

  // --- CATALOG ENDPOINTS ---
  if (method === 'GET' && path === '/catalog/cuts') {
    return MOCK_CUTS as unknown as T;
  }

  // El catálogo simulado emite el MISMO modelo que la API real (BackendProduct),
  // no el modelo de vista. Así el modo mock ejercita el adaptador y la capa de
  // slots de imagen en vez de saltárselos, que es justo donde se rompen las cosas
  // al conectar el backend de verdad.
  if (method === 'GET' && path.startsWith('/catalog/')) {
    const productId = path.replace('/catalog/', '');
    const product = MOCK_PRODUCTS.find((p) => p.productId === productId || p.slug === productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return toBackendProduct(product) as unknown as T;
  }

  if (method === 'GET' && (path === '/catalog' || path.startsWith('/catalog?'))) {
    const urlParams = new URLSearchParams(path.includes('?') ? path.split('?')[1] : '');
    const cut = urlParams.get('cut');
    const category = urlParams.get('category');

    let result = [...MOCK_PRODUCTS];
    if (cut) {
      const filteredByCut = result.filter((p) => p.cuts.includes(cut));
      if (filteredByCut.length > 0) result = filteredByCut;
    }
    if (category) {
      const lowerCat = category.toLowerCase();
      const filteredByCat = result.filter(
        (p) =>
          p.category.toLowerCase() === lowerCat ||
          p.category.toLowerCase().includes(lowerCat) ||
          p.slug.toLowerCase().includes(lowerCat) ||
          p.title.toLowerCase().includes(lowerCat)
      );
      if (filteredByCat.length > 0) {
        result = filteredByCat;
      }
    }
    return (result.length > 0 ? result : MOCK_PRODUCTS).map(toBackendProduct) as unknown as T;
  }

  // --- AUTH ENDPOINTS ---
  if (method === 'POST' && path === '/auth/login') {
    if (!body?.email || !body?.password) {
      throw new Error('Email and password are required');
    }
    if (body.password === 'wrong') {
      throw new Error('Invalid email or password');
    }
    return {
      ...MOCK_AUTH_RESPONSE,
      email: body.email,
    } as unknown as T;
  }

  if (method === 'POST' && path === '/auth/register') {
    if (!body?.email || !body?.password || !body?.firstName) {
      throw new Error('Missing required registration fields');
    }
    const token = generateMockJWT({
      userId: `user_${Date.now()}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName || '',
    });
    return {
      userId: `user_${Date.now()}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName || '',
      token,
      expiresIn: 86400,
    } as unknown as T;
  }

  if (method === 'POST' && path === '/auth/forgot-password') {
    return { message: 'Password reset email sent', resetTokenExpiry: 3600 } as unknown as T;
  }

  if (method === 'POST' && path.startsWith('/auth/reset-password')) {
    return { message: 'Password reset successful' } as unknown as T;
  }

  // --- CHECKOUT ENDPOINTS ---
  if (method === 'POST' && path === '/checkout') {
    if (!body?.items || body.items.length === 0) {
      throw new Error('Cart cannot be empty');
    }
    const newOrder = createMockOrder(body as CheckoutRequest);
    return newOrder as unknown as T;
  }

  if (method === 'GET' && path.startsWith('/checkout/')) {
    const orderId = path.replace('/checkout/', '');
    const order = MOCK_ORDERS.find((o) => o.orderId === orderId || o.orderNumber === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order as unknown as T;
  }

  // --- CUSTOMER & ORDERS ENDPOINTS ---
  if (method === 'GET' && path === '/me') {
    return MOCK_USER as unknown as T;
  }

  if (method === 'PATCH' && path === '/me') {
    Object.assign(MOCK_USER, body || {});
    return MOCK_USER as unknown as T;
  }

  if (method === 'POST' && path === '/me/password') {
    return { message: 'Password changed successfully' } as unknown as T;
  }

  if (method === 'GET' && (path === '/me/orders' || path.startsWith('/me/orders?'))) {
    return {
      items: MOCK_ORDERS.map((o) => ({
        orderId: o.orderId,
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
      total: MOCK_ORDERS.length,
      page: 1,
      limit: 20,
    } as unknown as T;
  }

  if (method === 'GET' && path.startsWith('/me/orders/')) {
    const orderId = path.replace('/me/orders/', '');
    const order = MOCK_ORDERS.find((o) => o.orderId === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Order not found');
    return order as unknown as T;
  }

  // --- SUPPORT TICKETS ENDPOINTS ---
  if (method === 'GET' && (path === '/me/tickets' || path.startsWith('/me/tickets?'))) {
    return {
      items: MOCK_TICKETS.map((t) => ({
        ticketId: t.ticketId,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        status: t.status,
        lastReplyAt: t.lastReplyAt,
        createdAt: t.createdAt,
      })),
      total: MOCK_TICKETS.length,
      page: 1,
      limit: 20,
    } as unknown as T;
  }

  if (method === 'POST' && path === '/me/tickets') {
    const newTicket: TicketDetail = {
      ticketId: `ticket_${Date.now()}`,
      ticketNumber: `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: body.subject || 'Soporte',
      status: 'Abierto',
      orderId: body.orderId || null,
      createdAt: new Date().toISOString(),
      messages: [
        {
          messageId: `msg_${Date.now()}`,
          sender: 'customer',
          message: body.message || '',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    MOCK_TICKETS.unshift(newTicket);
    return newTicket as unknown as T;
  }

  if (method === 'GET' && path.startsWith('/me/tickets/')) {
    const ticketId = path.replace('/me/tickets/', '');
    const ticket = MOCK_TICKETS.find((t) => t.ticketId === ticketId);
    if (!ticket) throw new Error('Ticket not found');
    return ticket as unknown as T;
  }

  if (method === 'POST' && path.includes('/messages')) {
    const parts = path.split('/');
    const ticketId = parts[3];
    const ticket = MOCK_TICKETS.find((t) => t.ticketId === ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const newMessage: TicketMessage = {
      messageId: `msg_${Date.now()}`,
      sender: 'customer',
      message: body.message,
      createdAt: new Date().toISOString(),
    };
    ticket.messages.push(newMessage);
    ticket.lastReplyAt = newMessage.createdAt;
    return newMessage as unknown as T;
  }

  throw new Error(`Mock endpoint not implemented for ${method} ${path}`);
}
