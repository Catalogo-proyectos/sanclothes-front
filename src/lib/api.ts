import { config } from './config';
import { getStoredToken } from './auth';
import type { CheckoutRequest, TicketDetail, TicketMessage } from '@/types/api';


export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}



export async function apiCall<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  requireAuth: boolean | string = false
): Promise<T> {
  const normalizedMethod = method.toUpperCase();


  if (config.api.useMock) {
    return handleMockRequest<T>(normalizedMethod, path, body, !!requireAuth);
  }


  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = typeof requireAuth === 'string' ? requireAuth : getStoredToken();
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
    let errorCode: string | undefined;
    let errorData: Record<string, unknown> | undefined;
    try {
      const errorJson = await response.json();

      errorMessage = errorJson.message || errorJson.error || errorMessage;
      errorCode = errorJson.code || undefined;
      errorData = errorJson;
    } catch {

    }
    const err = new ApiError(errorMessage, response.status, errorCode, errorData);
    throw err;
  }

  return response.json();
}


async function handleMockRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  requireAuth: boolean = false
): Promise<T> {
  const [catalogMocks, backendAdapter, authMocks, checkoutMocks] = await Promise.all([
    import('@/mocks/catalog'),
    import('@/mocks/toBackend'),
    import('@/mocks/auth'),
    import('@/mocks/checkout'),
  ]);
  const { MOCK_CUTS, MOCK_PRODUCTS } = catalogMocks;
  const { toBackendProduct } = backendAdapter;
  const { MOCK_USER, generateMockJWT } = authMocks;
  const { MOCK_ORDERS, MOCK_TICKETS, createMockOrder } = checkoutMocks;
  const payload = (body ?? {}) as Record<string, unknown>;

  await new Promise((res) => setTimeout(res, 150));

  if (requireAuth) {
    const token = getStoredToken();
    if (!token) {
      throw new Error('Unauthorized: Missing token in mock session.');
    }
  }



  if (method === 'GET' && path === '/catalog/cuts') {
    return { cuts: MOCK_CUTS } as unknown as T;
  }





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


  if (method === 'POST' && path === '/auth/login') {
    const email = String(payload.email ?? '');
    const password = String(payload.password ?? '');
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    if (password === 'wrong') {
      throw new Error('Invalid email or password');
    }
    const token = generateMockJWT({ email });
    return {
      token,
      user: { id: 'user_trece_001', firstName: 'Juan', lastName: 'Pérez', email, role: 'customer' },
    } as unknown as T;
  }

  if (method === 'POST' && path === '/auth/register') {
    const email = String(payload.email ?? '');
    const password = String(payload.password ?? '');
    const firstName = String(payload.firstName ?? '');
    const lastName = String(payload.lastName ?? '');
    if (!email || !password || !firstName) {
      throw new Error('Missing required registration fields');
    }
    const userId = `user_${Date.now()}`;
    const token = generateMockJWT({ userId, email, firstName, lastName });
    return {
      success: true,
      message: 'Cuenta creada exitosamente',
      token,
      user: { id: userId, firstName, lastName, email, role: 'customer' },
    } as unknown as T;
  }

  if (method === 'POST' && path === '/auth/google') {
    const token = generateMockJWT({ email: 'google@example.com', firstName: 'Google', lastName: 'User' });
    return {
      token,
      isNewUser: false,
      user: { id: 'user_google_001', firstName: 'Google', lastName: 'User', email: 'google@example.com', role: 'customer' },
    } as unknown as T;
  }

  if (method === 'POST' && path === '/auth/forgot-password') {
    return { success: true, message: 'Si el correo existe, se envió un enlace de recuperación.' } as unknown as T;
  }

  if (method === 'POST' && path === '/auth/reset-password') {
    return { success: true, message: 'Contraseña actualizada exitosamente.' } as unknown as T;
  }


  if (method === 'POST' && path === '/checkout/verify-email') {
    return { success: true, message: 'Si el correo es válido, se envió un código OTP.' } as unknown as T;
  }

  if (method === 'POST' && path === '/checkout/confirm-otp') {
    return {
      checkoutSessionToken: `mock_cst_${Date.now()}`,
      guestCartToken: `mock_gct_${Date.now()}`,
      existingAccount: false,
      message: 'OTP verificado exitosamente.',
    } as unknown as T;
  }

  if (method === 'POST' && path === '/checkout') {
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error('Cart cannot be empty');
    }
    const newOrder = createMockOrder(payload as unknown as CheckoutRequest);
    return newOrder as unknown as T;
  }

  if (method === 'GET' && path.startsWith('/checkout/')) {
    const orderId = path.replace('/checkout/', '').replace('/receipt', '');
    const order = MOCK_ORDERS.find((o) => o.orderId === orderId || o.orderNumber === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return {
      id: order.orderId,
      totalAmount: order.total,
      status: order.status,
      paymentReceiptUrl: null,
      createdAt: order.createdAt,
      items: order.items,
    } as unknown as T;
  }


  if (method === 'GET' && path === '/me') {
    return MOCK_USER as unknown as T;
  }

  if (method === 'PATCH' && path === '/me') {
    Object.assign(MOCK_USER, payload);
    return { success: true, message: 'Perfil actualizado', user: MOCK_USER } as unknown as T;
  }

  if (method === 'POST' && path === '/me/change-password') {
    return { success: true, message: 'Contraseña actualizada exitosamente' } as unknown as T;
  }


  if (method === 'GET' && (path === '/me/orders' || path.startsWith('/me/orders?'))) {
    return MOCK_ORDERS.map((o) => ({
      id: o.orderId,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      total: o.total,
      currency: o.currency,
      status: o.status,
      itemCount: o.itemCount,
    })) as unknown as T;
  }

  if (method === 'GET' && path.startsWith('/me/orders/')) {
    const orderId = path.replace('/me/orders/', '');
    const order = MOCK_ORDERS.find((o) => o.orderId === orderId || o.orderNumber === orderId);
    if (!order) throw new Error('Order not found');
    return order as unknown as T;
  }


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
      subject: String(payload.subject || 'Soporte'),
      status: 'Abierto',
      orderId: payload.orderId ? String(payload.orderId) : null,
      createdAt: new Date().toISOString(),
      messages: [
        {
          messageId: `msg_${Date.now()}`,
          sender: 'customer',
          message: String(payload.message || ''),
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
      message: String(payload.message || ''),
      createdAt: new Date().toISOString(),
    };
    ticket.messages.push(newMessage);
    ticket.lastReplyAt = newMessage.createdAt;
    return newMessage as unknown as T;
  }

  throw new Error(`Mock endpoint not implemented for ${method} ${path}`);
}
