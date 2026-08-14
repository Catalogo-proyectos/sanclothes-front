/**
 * API Data Transfer Objects & Domain Models for TRECE13 Storefront.
 * Matches backend Fastify specification contracts.
 */

// --- Catalog Types ---

/**
 * Los cortes son dinámicos: el admin los da de alta en la tabla `cuts` del
 * backend (CLASSIC, OVERSIZED, FEMENINO, MASCULINO, …), así que el front no
 * puede cerrar la unión sin quedar desactualizado cada vez que agregan uno.
 */
export type CutCode = string;
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface ProductImage {
  url: string;
  alt: string;
  cutVariant?: CutCode;
}

export interface ProductVariant {
  variantId: string;
  sku: string;
  cut: CutCode;
  size: string;
  price: number;
  stock: number;
}

export interface FlashSaleInfo {
  discountPercent: number;
  endsAt: string;
}

export interface CatalogProduct {
  productId: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  discountPrice: number | null;
  /** Imágenes del corte por defecto, ya normalizadas al host de media vigente. */
  images: ProductImage[];
  /**
   * Imágenes agrupadas por corte. Es lo que permite reemplazar toda la galería
   * cuando el cliente cambia de corte en la ficha, sin volver a pedir el producto.
   */
  imagesByCut?: Record<CutCode, ProductImage[]>;
  cuts: CutCode[];
  category: string;
  sizes: string[];
  stockStatus: StockStatus;
  rating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
  flashSale?: FlashSaleInfo | null;
  /** Etiqueta del admin (NUEVO, ÚLTIMAS UNIDADES…). */
  badge?: string | null;
  /** Marcado en el admin para el Bento Grid 2×2 de la portada. */
  isFeatured?: boolean;
  isLimitedDrop?: boolean;
  tags?: string[];
}

export interface CutInfo {
  code: CutCode;
  label: string;
  productCount: number;
}

// --- Auth Types ---

export interface AuthResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresIn: number;
}

export interface CustomerProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  createdAt?: string;
  isVIP?: boolean;
  isUnsubscribed?: boolean;
}

// --- Checkout & Orders ---

export interface CheckoutItemRequest {
  variantId: string;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItemRequest[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  benefitId?: string | null;
  referralCode?: string | null;
}

export interface OrderItemDetail {
  variantId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  items: OrderItemDetail[];
  createdAt: string;
  paidAt?: string | null;
  guestAutoLoginToken?: string;
  paymentRef?: string | null;
  customer?: Partial<CustomerProfile>;
  notes?: string;
}

export interface OrderSummaryItem {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// --- Support Tickets ---

export interface TicketMessage {
  messageId: string;
  sender: 'customer' | 'support';
  message: string;
  createdAt: string;
}

export interface TicketSummary {
  ticketId: string;
  ticketNumber: string;
  subject: string;
  status: 'Abierto' | 'En Proceso' | 'Resuelto' | 'Cerrado';
  lastReplyAt?: string;
  createdAt?: string;
}

export interface TicketDetail extends TicketSummary {
  orderId?: string | null;
  messages: TicketMessage[];
}

// --- Error Responses ---

export interface ApiErrorResponse {
  error: string;
  code: string;
  variantId?: string;
  availableStock?: number;
  requestedQuantity?: number;
}
