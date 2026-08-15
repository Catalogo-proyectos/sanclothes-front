import { CheckoutRequest, CheckoutResponse, TicketDetail } from '@/types/api';

/**
 * Mock order type used internally — the real CheckoutResponse is leaner,
 * but the mock layer needs richer data for the dashboard preview.
 */
interface MockOrder {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    sku: string;
  }>;
  createdAt: string;
  currency: 'PYG';
  itemCount: number;
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    orderId: 'ord_1',
    orderNumber: 'TR-10001',
    status: 'pending',
    total: 300000,
    currency: 'PYG',
    itemCount: 2,
    items: [
      {
        productId: 'prod_001',
        name: 'Remera Oversize TRECE13 Heavyweight',
        sku: 'REM-TR13-FEM-S',
        quantity: 2,
        price: 140000,
      },
    ],
    createdAt: '2026-07-18T12:00:00.000Z',
  },
  {
    orderId: 'ord_2',
    orderNumber: 'TR-10002',
    status: 'delivered',
    total: 320000,
    currency: 'PYG',
    itemCount: 1,
    items: [
      {
        productId: 'prod_005',
        name: 'Hoodie Acid Wash Drop #01',
        sku: 'HD-ACID-MAS-M',
        quantity: 1,
        price: 320000,
      },
    ],
    createdAt: '2026-07-10T14:30:00.000Z',
  },
];

export const MOCK_TICKETS: TicketDetail[] = [
  {
    ticketId: 'tkt_1',
    ticketNumber: 'TKT-2026-0001',
    subject: 'Consulta sobre envío de pedido TR-10001',
    status: 'Abierto',
    orderId: 'ord_1',
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
  const orderId = `ord_${Date.now()}`;

  MOCK_ORDERS.unshift({
    orderId,
    orderNumber: `TR-${10000 + MOCK_ORDERS.length + 1}`,
    status: 'pending',
    total: request.items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    currency: 'PYG',
    itemCount: request.items.reduce((sum, i) => sum + i.qty, 0),
    items: request.items.map((i) => ({
      productId: i.productId,
      name: 'Mock Product',
      quantity: i.qty,
      price: i.unitPrice,
      sku: i.sku,
    })),
    createdAt: new Date().toISOString(),
  });

  return {
    orderId,
    status: 'Pedido Pendiente de Confirmación',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    message: 'Orden creada exitosamente',
    orderAccessToken: `mock_oat_${orderId}`,
  };
}
