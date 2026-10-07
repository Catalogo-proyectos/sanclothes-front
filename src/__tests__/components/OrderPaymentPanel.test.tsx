import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { CheckoutOrderDetail } from '@/types/api';

const fetchCheckoutOrder = vi.fn();
const uploadReceipt = vi.fn();
vi.mock('@/lib/services/checkout', () => ({
  fetchCheckoutOrder: (...args: unknown[]) => fetchCheckoutOrder(...args),
  uploadReceipt: (...args: unknown[]) => uploadReceipt(...args),
  openReceipt: vi.fn(),
}));
vi.mock('@/lib/services/settings', () => ({
  fetchBankTransferInfo: vi.fn().mockResolvedValue(null),
}));

import OrderPaymentPanel from '@/components/checkout/OrderPaymentPanel';
import OrderAccess from '@/app/pedido/[id]/OrderAccess';
import { getOrderAccessToken } from '@/lib/auth';

const inTwoHours = () => new Date(Date.now() + 2 * 3600_000).toISOString();

function order(overrides: Partial<CheckoutOrderDetail> = {}): CheckoutOrderDetail {
  return {
    id: '42',
    totalAmount: 150_000,
    status: 'Pedido Pendiente de Confirmación',
    paymentReceiptUrl: null,
    createdAt: new Date().toISOString(),
    paymentDeadlineAt: inTwoHours(),
    receiptUploadedAt: null,
    receiptRejectionReason: null,
    canUploadReceipt: true,
    items: [],
    ...overrides,
  };
}

describe('OrderPaymentPanel', () => {
  beforeEach(() => {
    fetchCheckoutOrder.mockReset();
    uploadReceipt.mockReset();
  });

  it('el botón abre el selector y sube apenas se elige el archivo', async () => {
    fetchCheckoutOrder
      .mockResolvedValueOnce(order())
      .mockResolvedValueOnce(order({ status: 'Pago Pendiente de Verificación', paymentDeadlineAt: null, paymentReceiptUrl: '/r' }));
    uploadReceipt.mockResolvedValue({ success: true });
    const { container } = render(<OrderPaymentPanel orderId="42" />);

    const button = await screen.findByRole('button', { name: /subir comprobante/i });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');
    fireEvent.click(button);
    expect(click).toHaveBeenCalled();

    const file = new File(['png'], 'comprobante.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(uploadReceipt).toHaveBeenCalledWith('42', file));
    expect(await screen.findByText(/comprobante recibido/i)).toBeInTheDocument();
  });

  it('muestra el concepto de la transferencia y el plazo', async () => {
    fetchCheckoutOrder.mockResolvedValue(order());
    render(<OrderPaymentPanel orderId="42" />);
    expect(await screen.findByText('Pedido #42')).toBeInTheDocument();
    expect(screen.getByText(/quedan/i)).toBeInTheDocument();
  });

  it('rechazado: muestra el motivo y deja subir otro', async () => {
    fetchCheckoutOrder.mockResolvedValue(
      order({ status: 'Comprobante Rechazado', receiptRejectionReason: 'El monto no coincide', paymentReceiptUrl: '/r' })
    );
    render(<OrderPaymentPanel orderId="42" />);
    expect(await screen.findByText(/el monto no coincide/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reemplazar comprobante/i })).toBeInTheDocument();
  });

  it('vencido: no ofrece subir', async () => {
    fetchCheckoutOrder.mockResolvedValue(order({ canUploadReceipt: false, paymentDeadlineAt: new Date(Date.now() - 1000).toISOString() }));
    render(<OrderPaymentPanel orderId="42" />);
    expect(await screen.findByText(/venció el plazo/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /subir comprobante/i })).not.toBeInTheDocument();
  });

  it('vence con la página abierta: deja de ofrecer subir aunque el servidor dijera que sí', async () => {
    fetchCheckoutOrder.mockResolvedValue(order({ canUploadReceipt: true, paymentDeadlineAt: new Date(Date.now() - 1000).toISOString() }));
    render(<OrderPaymentPanel orderId="42" />);
    expect(await screen.findByText(/venció el plazo/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /subir comprobante/i })).not.toBeInTheDocument();
  });

  it('rechaza un archivo que no es imagen ni PDF sin llamar al servidor', async () => {
    fetchCheckoutOrder.mockResolvedValue(order());
    const { container } = render(<OrderPaymentPanel orderId="42" />);
    await screen.findByRole('button', { name: /subir comprobante/i });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] } });
    expect(await screen.findByText(/formato no permitido/i)).toBeInTheDocument();
    expect(uploadReceipt).not.toHaveBeenCalled();
  });
});

describe('/pedido/[id] (link del email)', () => {
  it('guarda el token del fragmento y lo saca de la URL', async () => {
    fetchCheckoutOrder.mockResolvedValue(order());
    window.history.replaceState(null, '', '/pedido/42#t=tok-123');
    render(<OrderAccess orderId="42" />);
    expect(getOrderAccessToken('42')).toBe('tok-123');
    await waitFor(() => expect(window.location.hash).toBe(''));
    expect(await screen.findByText('Pedido #42')).toBeInTheDocument();
  });

  it('sin token: explica cómo entrar', () => {
    window.history.replaceState(null, '', '/pedido/99');
    render(<OrderAccess orderId="99" />);
    expect(screen.getByText(/abrí el link del email/i)).toBeInTheDocument();
  });
});
