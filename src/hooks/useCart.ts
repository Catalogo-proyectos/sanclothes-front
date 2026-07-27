import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartState } from '@/types/cart';

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

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      },

      getShippingCost: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        // Free shipping for orders over Gs. 300.000
        return subtotal >= 300000 ? 0 : 20000;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getShippingCost();
      },
    }),
    {
      name: 'trece13_shopping_cart',
    }
  )
);
