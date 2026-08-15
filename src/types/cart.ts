/**
 * Shopping Cart State Types for Zustand Store.
 */

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  size: string;
  cut: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  maxStock?: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingCost: () => number;
  getTotal: () => number;
  /** §5: Push local cart to backend (best-effort) */
  syncToServer: (mode: 'user' | 'guest') => Promise<void>;
  /** §5: Pull cart from backend and replace local if non-empty */
  syncFromServer: (mode: 'user' | 'guest') => Promise<void>;
}
