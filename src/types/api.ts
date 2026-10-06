



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
  // Catálogo v2
  createdAt?: string;
  styles: string[];
  /** Nombre visible del tipo de prenda (Chaquetas, Remeras…). */
  categoryName: string;
  color: string | null;
  bento: CatalogBento | null;
  /** Solo combos: sus prendas y los talles elegibles de cada una. */
  combo?: ComboInfo | null;
  /** Solo hype (antes del lanzamiento): fecha del lanzamiento para la cuenta regresiva. */
  hype?: { launchAt: string } | null;
}

export interface ComboItemInfo {
  productId: string;
  name: string;
  qty: number;
  image?: string;
  fixed: boolean;
  options: Array<{ token: string; label: string; stock: number }>;
}

export interface ComboInfo {
  items: ComboItemInfo[];
}

export interface CatalogBento {
  /** null = usar el nombre del tipo de prenda. */
  title: string | null;
  copy: string | null;
  /** null = usar la primera imagen del producto. */
  image: string | null;
  priority: number;
}

export interface CutInfo {
  code: string;
  name: string;
  productsCount: number;
}



export interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  price: number;
}



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


export interface RegisterConflictError {
  statusCode: number;
  error: string;
  message: string;
  isGuestAccount?: boolean;
}


export interface AuthResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresIn: number;
}




export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  addresses: unknown[];
}


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




export interface OrderSummaryItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  currency: 'PYG';
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  itemCount: number;
}


export interface OrderDetail {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  currency: string;
  paymentMethod?: string;
  totals: {
    subtotal: number;
    /** A2: descuento registrado; null en pedidos anteriores a A2 (sin desglose). */
    discount?: number | null;
    shipping: number;
    total: number;
    breakdownAvailable?: boolean;
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




export interface VerifyEmailRequest {
  email: string;
  turnstileToken?: string;
}


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


export interface CheckoutRequest {
  /** Sin precio: el backend precifica (A2). */
  items: Array<{
    sku: string;
    productId: string;
    size: string;
    qty: number;
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
  /** `quote.total` de la última quote READY. Solo se compara (409 PRICE_CHANGED), nunca es precio. */
  expectedTotal?: number;
  requestsInvoice?: boolean;
  invoiceData?: {
    ruc?: string;
    razonSocial?: string;
    direccionFiscal?: string;
  };
}


export interface CheckoutResponse {
  orderId: string;
  status: string;
  expiresAt: string;
  message: string;
  orderAccessToken: string;
  /** Desglose persistido del pedido (A2). */
  totals?: { subtotal: number; discount: number; shipping: number; total: number };
}


export interface CheckoutOrderDetail {
  id: string;
  totalAmount: number;
  /** A2: null = pedido anterior a A2. */
  subtotalAmount?: number | null;
  discountAmount?: number | null;
  shippingAmount?: number;
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


export interface ReceiptUploadResponse {
  success: true;
  url: string;
  message: string;
}



export interface CartSyncResponse {
  items: unknown[];
  updatedAt?: string;
}



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




export interface AuthErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}


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



export type PaginatedList<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
