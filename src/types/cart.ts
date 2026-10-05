

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  size: string;
  cut: string;
  quantity: number;
  /** Precio de catálogo al agregar: solo referencia visual, el backend precifica. */
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
  /** Precio de catálogo × cantidad. Referencia visual: el importe real es la quote del servidor. */
  getReferenceSubtotal: () => number;

  syncToServer: (mode: 'user' | 'guest') => Promise<void>;

  syncFromServer: (mode: 'user' | 'guest') => Promise<void>;
}
