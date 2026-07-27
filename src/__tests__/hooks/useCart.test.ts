import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from '@/hooks/useCart';

describe('useCart Zustand Store', () => {
  beforeEach(() => {
    useCart.getState().clearCart();
  });

  it('should initialize with empty cart', () => {
    const { items, getItemCount, getSubtotal } = useCart.getState();
    expect(items).toEqual([]);
    expect(getItemCount()).toBe(0);
    expect(getSubtotal()).toBe(0);
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

    const { items, getItemCount, getSubtotal } = useCart.getState();
    expect(items).toHaveLength(1);
    expect(getItemCount()).toBe(2);
    expect(getSubtotal()).toBe(300000);
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

  it('should calculate shipping correctly (free over 300,000 Gs.)', () => {
    const { addItem, getShippingCost } = useCart.getState();
    
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

    // 150.000 < 300.000 -> Shipping = 20.000 Gs.
    expect(getShippingCost()).toBe(20000);

    addItem({
      variantId: 'var_002',
      productId: 'prod_01',
      productName: 'Remera Oversize',
      sku: 'REM-M',
      size: 'M',
      cut: 'FEMENINO',
      unitPrice: 160000,
      quantity: 1,
    });

    // 310.000 >= 300.000 -> Free shipping = 0 Gs.
    expect(getShippingCost()).toBe(0);
  });
});
