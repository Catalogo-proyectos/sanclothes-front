import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartState } from '@/types/cart';
import { fetchUserCart, saveUserCart, fetchGuestCart, saveGuestCart } from '@/lib/services/cart';
import { CART_STORAGE_KEY, migrateLegacyStorageKey } from '@/lib/storage-keys';

// Antes de que zustand hidrate el carrito desde localStorage.
migrateLegacyStorageKey(CART_STORAGE_KEY);

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.variantId === newItem.variantId);

        const qtyToAdd = newItem.quantity ?? 1;

        if (existingIndex > -1) {
          const updatedItems = [...items];
          const currentQty = updatedItems[existingIndex].quantity;
          const maxStock = newItem.maxStock ?? 99;
          updatedItems[existingIndex].quantity = Math.min(currentQty + qtyToAdd, maxStock);

          set({ items: updatedItems });
        } else {
          set({
            items: [
              ...items,
              {
                ...newItem,
                quantity: qtyToAdd,
              },
            ],
          });
        }
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Referencia visual (precio de catálogo × cantidad) mientras no hay una
      // quote del servidor. Nunca es el importe a cobrar: subtotal, descuentos,
      // envío y total salen de POST /checkout/quote (useCheckoutQuote).
      getReferenceSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      },


      syncToServer: async (mode: 'user' | 'guest') => {
        const { items } = get();
        try {
          if (mode === 'user') {
            await saveUserCart(items);
          } else {
            await saveGuestCart(items);
          }
        } catch {

        }
      },

      syncFromServer: async (mode: 'user' | 'guest') => {
        try {
          const res = mode === 'user'
            ? await fetchUserCart()
            : await fetchGuestCart();
          if (res.items && Array.isArray(res.items) && res.items.length > 0) {
            set({ items: res.items as CartItem[] });
          }
        } catch {

        }
      },
    }),
    {
      name: CART_STORAGE_KEY,
    }
  )
);
