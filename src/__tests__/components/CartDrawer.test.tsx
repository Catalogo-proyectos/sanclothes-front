import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { deferred, makeCartItem, makeQuote } from '../helpers/quoteFixture';
import type { CheckoutQuote } from '@/types/quote';

const fetchCheckoutQuote = vi.fn();
vi.mock('@/lib/services/quote', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/services/quote')>();
  return { ...actual, fetchCheckoutQuote: (...args: unknown[]) => fetchCheckoutQuote(...args) };
});

import CartDrawer from '@/components/checkout/CartDrawer';
import { useCart } from '@/hooks/useCart';

beforeEach(() => {
  fetchCheckoutQuote.mockReset();
  localStorage.clear();
  sessionStorage.clear();
  useCart.setState({ items: [makeCartItem({ unitPrice: 150_000, quantity: 2 })] });
});

describe('CartDrawer', () => {
  it('mientras cotiza: solo el subtotal de referencia, sin un total armado localmente', () => {
    fetchCheckoutQuote.mockReturnValue(deferred<CheckoutQuote>().promise);
    render(<CartDrawer isOpen onClose={() => {}} />);
    expect(screen.getByTestId('reference-subtotal')).toHaveTextContent('300.000');
    expect(screen.queryByTestId('quote-total')).not.toBeInTheDocument();
  });

  it('con quote READY: muestra el total del servidor y deja de mostrar la referencia', async () => {
    fetchCheckoutQuote.mockResolvedValue(
      makeQuote({
        identified: false,
        lines: [{ ...makeQuote().lines[0]!, qty: 2, unitPrice: 90_000, lineTotal: 180_000, rule: 'QUANTITY_DISCOUNT' }],
        subtotal: 180_000,
        total: 180_000,
      }),
    );
    render(<CartDrawer isOpen onClose={() => {}} />);
    await waitFor(() => expect(screen.getByTestId('quote-total')).toHaveTextContent('180.000'));
    expect(screen.queryByTestId('reference-subtotal')).not.toBeInTheDocument();
    
    expect(fetchCheckoutQuote.mock.calls[0]![1].token).toBeNull();
    expect(screen.getByText(/al identificarte en el checkout/i)).toBeInTheDocument();
    
    expect(screen.queryByText(/300\.000/)).not.toBeInTheDocument();
  });

  it('cerrado: no cotiza', () => {
    render(<CartDrawer isOpen={false} onClose={() => {}} />);
    expect(fetchCheckoutQuote).not.toHaveBeenCalled();
  });
});
