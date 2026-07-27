import { CheckoutRequest, CheckoutResponse, OrderSummaryItem, TicketDetail } from '@/types/api';

export const MOCK_ORDERS: CheckoutResponse[] = [
  {
    orderId: 'order_xyz789',
    orderNumber: 'ORD-2026-001',
    status: 'Pendiente de Pago',
    subtotal: 280000,
    tax: 0,
    shipping: 20000,
    discount: 0,
    total: 300000,
    items: [
      {
        variantId: 'var_001',
        productName: 'Remera Oversize TRECE13 Heavyweight',
        sku: 'REM-TR13-FEM-S',
        quantity: 2,
        unitPrice: 140000,
        subtotal: 280000,
      },
    ],
    createdAt: '2026-07-18T12:00:00.000Z',
    customer: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'customer@example.com',
      phone: '+595981234567',
      address: 'Av. España 1420',
      city: 'Asunción',
    },
  },
  {
    orderId: 'order_xyz790',
    orderNumber: 'ORD-2026-002',
    status: 'Pagado',
    subtotal: 320000,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 320000,
    items: [
      {
        variantId: 'var_005',
        productName: 'Hoodie Acid Wash Drop #01',
        sku: 'HD-ACID-MAS-M',
        quantity: 1,
        unitPrice: 320000,
        subtotal: 320000,
      },
    ],
    createdAt: '2026-07-10T14:30:00.000Z',
    paidAt: '2026-07-10T15:00:00.000Z',
    customer: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'customer@example.com',
    },
  },
];

export const MOCK_TICKETS: TicketDetail[] = [
  {
    ticketId: 'ticket_abc123',
    ticketNumber: 'TKT-2026-0001',
    subject: 'Consulta sobre envío de pedido ORD-2026-001',
    status: 'Abierto',
    orderId: 'order_xyz789',
    createdAt: '2026-07-18T14:00:00.000Z',
    lastReplyAt: '2026-07-18T15:30:00.000Z',
    messages: [
      {
        messageId: 'msg_001',
        sender: 'customer',
        message: 'Hola, envié el comprobante de transferencia bancaria por WhatsApp. ¿Cuándo despachan?',
        createdAt: '2026-07-18T14:00:00.000Z',
      },
      {
        messageId: 'msg_002',
        sender: 'support',
        message: '¡Hola Juan! Verificamos tu pago y el pedido se encuentra en preparación para despacho hoy.',
        createdAt: '2026-07-18T15:30:00.000Z',
      },
    ],
  },
];

export function createMockOrder(request: CheckoutRequest): CheckoutResponse {
  const orderId = `order_mock_${Date.now()}`;
  const orderNumber = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;

  const items = request.items.map((item, idx) => ({
    variantId: item.variantId,
    productName: idx % 2 === 0 ? 'Remera Oversize TRECE13 Heavyweight' : 'Hoodie Acid Wash Drop #01',
    sku: `SKU-MOCK-${item.variantId}`,
    quantity: item.quantity,
    unitPrice: 150000,
    subtotal: item.quantity * 150000,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = 25000;
  const total = subtotal + shipping;

  const newOrder: CheckoutResponse = {
    orderId,
    orderNumber,
    status: 'Pendiente de Pago',
    subtotal,
    tax: 0,
    shipping,
    discount: 0,
    total,
    items,
    createdAt: new Date().toISOString(),
    customer: {
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,
      address: request.address,
      city: request.city,
    },
    guestAutoLoginToken: `mock_guest_token_${orderId}`,
  };

  MOCK_ORDERS.unshift(newOrder);
  return newOrder;
}
