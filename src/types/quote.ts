/**
 * Contrato de POST /api/checkout/quote (backend A2, lib/pricing/quote.ts).
 * El backend es la única fuente de verdad monetaria: estos importes se
 * muestran tal cual, nunca se recalculan en el storefront.
 */

export interface QuoteItemRequest {
  productId: string;
  sku: string;
  size: string;
  qty: number;
}

export interface QuoteRequest {
  items: QuoteItemRequest[];
  couponCode?: string;
}

export type QuoteLineRule = 'BASE' | 'PRODUCT_DISCOUNT' | 'QUANTITY_DISCOUNT' | 'FLASH_SALE' | 'COMBO';

export interface QuoteLine {
  productId: string;
  sku: string;
  size: string;
  qty: number;
  kind: 'PRODUCT' | 'COMBO';
  rule: QuoteLineRule;
  baseUnitPrice: number;
  unitPrice: number;
  lineTotal: number;
}

export type QuoteCouponStatus = 'APPLIED' | 'NOT_APPLIED' | 'INVALID' | 'REQUIRES_IDENTITY';

export interface QuoteCoupon {
  code: string;
  status: QuoteCouponStatus;
  /** APPLIED → null. NOT_APPLIED → TIER_IS_GREATER | NO_DISCOUNT. INVALID → código público (COUPON_EXPIRED, …). */
  reason: string | null;
  message: string | null;
  amount: number;
}

export type ShippingMode = 'FREE_ALWAYS' | 'FREE_OVER_AMOUNT' | 'FIXED';

export interface QuoteShipping {
  mode: ShippingMode;
  amount: number;
  freeThreshold: number | null;
  remainingForFree: number | null;
}

export interface QuoteWarning {
  code: 'NON_POSITIVE_PRICE' | string;
  productId: string;
}

export interface CheckoutQuote {
  currency: 'PYG';
  identified: boolean;
  lines: QuoteLine[];
  subtotal: number;
  discount: {
    applied: 'NONE' | 'TIER' | 'COUPON';
    amount: number;
    tier: { name: string; percent: number; amount: number } | null;
    coupon: QuoteCoupon | null;
  };
  shipping: QuoteShipping;
  total: number;
  warnings: QuoteWarning[];
  quotedAt: string;
}
