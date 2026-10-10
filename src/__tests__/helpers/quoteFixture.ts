import type { CartItem } from '@/types/cart';
import type { CheckoutQuote } from '@/types/quote';

export function makeQuote(overrides: Partial<CheckoutQuote> = {}): CheckoutQuote {
  return {
    currency: 'PYG',
    identified: true,
    lines: [
      {
        productId: 'prod-1',
        sku: 'REM-M',
        size: 'M',
        qty: 1,
        kind: 'PRODUCT',
        rule: 'BASE',
        baseUnitPrice: 100_000,
        unitPrice: 100_000,
        lineTotal: 100_000,
      },
    ],
    subtotal: 100_000,
    discount: { applied: 'NONE', amount: 0, tier: null, coupon: null },
    shipping: { mode: 'FREE_ALWAYS', amount: 0, freeThreshold: null, remainingForFree: null },
    total: 100_000,
    warnings: [],
    quotedAt: '2026-10-03T12:00:00.000Z',
    ...overrides,
  };
}

export function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId: 'var-1',
    productId: 'prod-1',
    productName: 'Remera Test',
    sku: 'REM-M',
    size: 'M',
    cut: 'UNISEX',
    quantity: 1,
    
    unitPrice: 777_777,
    ...overrides,
  };
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
