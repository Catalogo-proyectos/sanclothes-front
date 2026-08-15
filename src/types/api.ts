/**
 * API Data Transfer Objects & Domain Models for Santclothes Storefront.
 * Matches STOREFRONT-INTEGRATION.md (2026-08-14) against real backend handlers.
 */

// --- Catalog Types ---

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
  images: ProductImage[];
  imagesByCut?: Record<CutCode, ProductImage[]>;
  cuts: CutCode[];
  category: string;
  sizes: string[];
  stockStatus: StockStatus;
  rating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
  flashSale?: FlashSaleInfo | null;
  badge?: string | null;
  isFeatured?: boolean;
  isLimitedDrop?: boolean;
  tags?: string[];
}

export interface CutInfo {
  code: string;
  name: string;
  productsCount: number;
}

// --- Search (§4) ---

export interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  price: number;
}

// --- Reviews (§4) ---

export interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  comment?: string;
  guestName?: string;
  photoUrl?: string;
  status: string;
  createdAt: string;
}

// --- Auth Types (§3) ---

/** POST /auth/login response */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

/** POST /auth/register response */
export interface RegisterResponse {
  success: true;
  message: string;
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

/** POST /auth/google response */
export interface GoogleAuthResponse {
  token: string;
  isNewUser: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    role: string;
  };
}

/** Register 409 conflict error data */
export interface RegisterConflictError {
  statusCode: number;
  error: string;
  message: string;
  isGuestAccount?: boolean;
}

/**
 * @deprecated Use LoginResponse/RegisterResponse/GoogleAuthResponse instead.
 * Kept for backward compat with mock layer.
 */
export interface AuthResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresIn: number;
}

// --- Customer Profile (§3) ---

/** GET /me response */
export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  addresses: unknown[];
}

/** PATCH /me response */
export interface UpdateProfileResponse {
  success: true;
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
}

// --- Orders (§3) ---

/** GET /me/orders — flat array item */
export interface OrderSummaryItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  currency: 'PYG';
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  itemCount: number;
}

/** GET /me/orders/:id */
export interface OrderDetail {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  currency: string;
  paymentMethod?: string;
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
  };
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  returnReason?: string;
}

// --- Checkout (§6) ---

/** POST /checkout/verify-email */
export interface VerifyEmailRequest {
  email: string;
  turnstileToken?: string;
}

/** POST /checkout/confirm-otp */
export interface ConfirmOtpRequest {
  email: string;
  otp: string;
}

export interface ConfirmOtpResponse {
  checkoutSessionToken: string;
  guestCartToken: string;
  existingAccount: boolean;
  message: string;
}

/** POST /checkout request body */
export interface CheckoutRequest {
  items: Array<{
    sku: string;
    productId: string;
    size: string;
    qty: number;
    unitPrice: number;
  }>;
  customer: {
    email: string;
    fullName: string;
    phone: string;
  };
  shipping: {
    address: string;
    locality: string;
    province: string;
    postalCode: string;
  };
  wantsClubMembership: boolean;
  couponCode?: string;
  requestsInvoice?: boolean;
  invoiceData?: {
    ruc?: string;
    razonSocial?: string;
    direccionFiscal?: string;
  };
}

/** POST /checkout response */
export interface CheckoutResponse {
  orderId: string;
  status: string;
  expiresAt: string;
  message: string;
  orderAccessToken: string;
}

/** GET /checkout/:id (with orderAccessToken) */
export interface CheckoutOrderDetail {
  id: string;
  totalAmount: number;
  status: string;
  dropType?: string;
  paymentReceiptUrl: string | null;
  createdAt: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    sku: string;
  }>;
}

/** POST /checkout/:id/receipt response */
export interface ReceiptUploadResponse {
  success: true;
  url: string;
  message: string;
}

// --- Cart (§5) ---

export interface CartSyncResponse {
  items: unknown[];
  updatedAt?: string;
}

// --- Tiers (§7) ---

export interface CustomerTier {
  currentTier: {
    id: string;
    name: string;
    discountPercentage: number;
    earlyAccessHours: number;
  } | null;
  totalSpent: number;
  progressPercentage: number;
  centsToNextTier: number;
  nextTier: {
    id: string;
    name: string;
    discountPercentage: number;
    earlyAccessHours: number;
  } | null;
}

// --- Support Tickets (§3) ---

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

// --- Error Responses (§1) ---

/** Auth module errors */
export interface AuthErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}

/** Checkout/catalog/cart errors */
export interface ApiErrorResponse {
  error: string;
  code: string;
  sku?: string;
  productId?: string;
  minutesLeft?: number;
  variantId?: string;
  availableStock?: number;
  requestedQuantity?: number;
}

// --- Legacy aliases for backward compat ---

export type PaginatedList<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
