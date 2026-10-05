import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from '@/hooks/useCart';

describe('useCart Zustand Store', () => {
  beforeEach(() => {
    useCart.getState().clearCart();
  });

  it('should initialize with empty cart', () => {
    const { items, getItemCount, getReferenceSubtotal } = useCart.getState();
    expect(items).toEqual([]);
    expect(getItemCount()).toBe(0);
    expect(getReferenceSubtotal()).toBe(0);
  });

  it('should add item and update item count', () => {
    const { addItem } = useCart.getState();
    addItem({
      variantId: 'var_001',
      productId: 'prod_01',
      productName: 'Remera Oversize',
      sku: 'REM-S',
      size: 'S',
      cut: 'FEMENINO',
      unitPrice: 150000,
      quantity: 2,
    });

    const { items, getItemCount, getReferenceSubtotal } = useCart.getState();
    expect(items).toHaveLength(1);
    expect(getItemCount()).toBe(2);
    expect(getReferenceSubtotal()).toBe(300000);
  });

  it('should increment quantity when adding existing variant', () => {
    const { addItem } = useCart.getState();
    addItem({
      variantId: 'var_001',
      productId: 'prod_01',
      productName: 'Remera Oversize',
      sku: 'REM-S',
      size: 'S',
      cut: 'FEMENINO',
      unitPrice: 150000,
      quantity: 1,
    });

    addItem({
      variantId: 'var_001',
      productId: 'prod_01',
      productName: 'Remera Oversize',
      sku: 'REM-S',
      size: 'S',
      cut: 'FEMENINO',
      unitPrice: 150000,
      quantity: 2,
    });

    const { items, getItemCount } = useCart.getState();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
    expect(getItemCount()).toBe(3);
  });

  it('should update quantity and remove item if quantity <= 0', () => {
    const { addItem, updateQuantity } = useCart.getState();
    addItem({
      variantId: 'var_001',
      productId: 'prod_01',
      productName: 'Remera Oversize',
      sku: 'REM-S',
      size: 'S',
      cut: 'FEMENINO',
      unitPrice: 150000,
      quantity: 3,
    });

    updateQuantity('var_001', 0);
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('no calcula envío ni total: el importe a cobrar sale de la quote del servidor', () => {
    const { addItem } = useCart.getState();

    addItem({
      variantId: 'var_001',
      productId: 'prod_01',
      productName: 'Remera Oversize',
      sku: 'REM-S',
      size: 'S',
      cut: 'FEMENINO',
      unitPrice: 150000,
      quantity: 1,
    });

    const state = useCart.getState() as unknown as Record<string, unknown>;
    // La regla vieja (Gs. 20.000 de envío por debajo de Gs. 300.000) desapareció.
    expect(state.getShippingCost).toBeUndefined();
    expect(state.getTotal).toBeUndefined();
    // Lo único que queda es la referencia visual de catálogo.
    expect(useCart.getState().getReferenceSubtotal()).toBe(150000);
  });
});
