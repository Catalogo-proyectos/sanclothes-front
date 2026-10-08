import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiError } from '@/lib/api';
import { deferred, makeCartItem, makeQuote } from '../helpers/quoteFixture';
import type { CheckoutQuote } from '@/types/quote';

const fetchCheckoutQuote = vi.fn();
vi.mock('@/lib/services/quote', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/services/quote')>();
  return { ...actual, fetchCheckoutQuote: (...args: unknown[]) => fetchCheckoutQuote(...args) };
});

// Identidad de checkout simulada: null hasta que el OTP la crea.
let identityToken: string | true | null = true;
const createOrder = vi.fn();
const confirmOtp = vi.fn();
vi.mock('@/lib/services/checkout', () => ({
  verifyEmail: vi.fn().mockResolvedValue(undefined),
  confirmOtp: (...args: unknown[]) => confirmOtp(...args),
  createOrder: (...args: unknown[]) => createOrder(...args),
  uploadReceipt: vi.fn(),
  fetchCheckoutOrder: vi.fn().mockReturnValue(new Promise(() => {})),
  getCheckoutIdentity: () => identityToken,
}));
vi.mock('@/lib/services/settings', () => ({
  fetchBankTransferInfo: vi.fn().mockResolvedValue(null),
}));

import CheckoutForm from '@/components/checkout/CheckoutForm';
import { verifyEmail } from '@/lib/services/checkout';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

const gs = (n: number) => new RegExp(n.toLocaleString('es-PY').replace(/\./g, '\\.'));
const confirmButton = () => screen.getByRole('button', { name: /confirmar/i });
const quoteSummary = () => screen.getByTestId('quote-summary');

function loginAs(email: string) {
  useAuth.setState({
    isLoggedIn: true,
    user: { userId: 'u1', email, firstName: 'Cliente', lastName: 'Test' },
  });
}

async function renderReady(quote: CheckoutQuote) {
  fetchCheckoutQuote.mockResolvedValue(quote);
  render(<CheckoutForm />);
  await waitFor(() => expect(quoteSummary()).toHaveAttribute('data-quote-status', 'ready'));
}

function fillForm() {
  const field = (name: string) => document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
  fireEvent.change(field('fullName'), { target: { value: 'Cliente Test' } });
  fireEvent.change(field('address'), { target: { value: 'Calle de prueba 1234' } });
}

function submit() {
  fireEvent.submit(confirmButton().closest('form')!);
}

beforeEach(() => {
  fetchCheckoutQuote.mockReset();
  createOrder.mockReset();
  confirmOtp.mockReset();
  identityToken = true;
  sessionStorage.clear();
  useCart.setState({ items: [makeCartItem()] });
  loginAs('cliente@example.com');
});

describe('CheckoutForm con quote del servidor', () => {
  it('renderiza subtotal, descuento, envío y total exactamente como los entrega el servidor', async () => {
    await renderReady(
      makeQuote({
        subtotal: 150_000,
        discount: { applied: 'TIER', amount: 30_000, tier: { name: 'Oro', percent: 20, amount: 30_000 }, coupon: null },
        shipping: { mode: 'FIXED', amount: 25_000, freeThreshold: null, remainingForFree: null },
        total: 145_000,
      }),
    );
    expect(screen.getByTestId('quote-subtotal')).toHaveTextContent(gs(150_000));
    expect(screen.getByTestId('quote-discount')).toHaveTextContent(gs(30_000));
    expect(screen.getByTestId('quote-shipping')).toHaveTextContent(gs(25_000));
    expect(screen.getByTestId('quote-total')).toHaveTextContent(gs(145_000));
    expect(quoteSummary()).toHaveTextContent(/Oro/);
  });

  it('el unitPrice local no determina el total: se muestra el del servidor', async () => {
    // El carrito dice 777.777; el servidor cobra 100.000.
    await renderReady(makeQuote({ subtotal: 100_000, total: 100_000 }));
    expect(screen.getByTestId('quote-total')).toHaveTextContent(gs(100_000));
    expect(quoteSummary()).not.toHaveTextContent(gs(777_777));
  });

  it('FREE_ALWAYS: envío gratis aunque el subtotal sea < 300.000 (desapareció el envío fijo de 20.000)', async () => {
    await renderReady(makeQuote({ subtotal: 100_000, total: 100_000 }));
    expect(screen.getByTestId('quote-shipping')).toHaveTextContent('Gratis');
    expect(screen.getByTestId('quote-shipping')).toHaveAttribute('data-shipping-mode', 'FREE_ALWAYS');
    expect(screen.queryByText(gs(20_000))).not.toBeInTheDocument();
  });

  it('FREE_OVER_AMOUNT: envío y cuánto falta, tal cual vienen del servidor', async () => {
    await renderReady(
      makeQuote({
        shipping: { mode: 'FREE_OVER_AMOUNT', amount: 20_000, freeThreshold: 300_000, remainingForFree: 200_000 },
        total: 120_000,
      }),
    );
    expect(screen.getByTestId('quote-shipping')).toHaveTextContent(gs(20_000));
    expect(screen.getByTestId('quote-free-shipping-hint')).toHaveTextContent(gs(200_000));
    expect(screen.getByTestId('quote-free-shipping-hint')).toHaveTextContent(gs(300_000));
  });

  it('FIXED: muestra el envío fijo del servidor', async () => {
    await renderReady(makeQuote({ shipping: { mode: 'FIXED', amount: 25_000, freeThreshold: null, remainingForFree: null }, total: 125_000 }));
    expect(screen.getByTestId('quote-shipping')).toHaveAttribute('data-shipping-mode', 'FIXED');
    expect(screen.getByTestId('quote-shipping')).toHaveTextContent(gs(25_000));
    expect(screen.queryByTestId('quote-free-shipping-hint')).not.toBeInTheDocument();
  });

  it('botón bloqueado mientras la quote carga', async () => {
    fetchCheckoutQuote.mockReturnValue(deferred<CheckoutQuote>().promise);
    render(<CheckoutForm />);
    expect(quoteSummary()).toHaveAttribute('data-quote-status', 'loading');
    expect(confirmButton()).toBeDisabled();
  });

  it('botón bloqueado con quote STALE (cambió el cupón) hasta recibir la nueva', async () => {
    await renderReady(makeQuote());
    expect(confirmButton()).toBeEnabled();

    fetchCheckoutQuote.mockReturnValue(deferred<CheckoutQuote>().promise);
    fireEvent.change(screen.getByLabelText(/cupón/i), { target: { value: 'promo10' } });
    fireEvent.click(screen.getByRole('button', { name: /aplicar/i }));
    expect(quoteSummary()).toHaveAttribute('data-quote-status', 'stale');
    expect(confirmButton()).toBeDisabled();
    // El cupón se manda normalizado al servidor; el frontend no lo valúa.
    await waitFor(() => expect(fetchCheckoutQuote.mock.calls.at(-1)![0].couponCode).toBe('PROMO10'));
  });

  it('error de quote bloquea el checkout y ofrece reintentar', async () => {
    fetchCheckoutQuote.mockRejectedValue(new ApiError('caído', 500, 'INTERNAL_ERROR'));
    render(<CheckoutForm />);
    await waitFor(() => expect(quoteSummary()).toHaveAttribute('data-quote-status', 'error'));
    expect(confirmButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('cupón aplicado: muestra el código y el monto del servidor', async () => {
    await renderReady(
      makeQuote({
        discount: {
          applied: 'COUPON',
          amount: 15_000,
          tier: null,
          coupon: { code: 'PROMO15', status: 'APPLIED', reason: null, message: null, amount: 15_000 },
        },
        total: 85_000,
      }),
    );
    const notice = screen.getByTestId('coupon-notice');
    expect(notice).toHaveAttribute('data-coupon-status', 'APPLIED');
    expect(notice).toHaveTextContent('PROMO15');
    expect(notice).toHaveTextContent(gs(15_000));
    expect(confirmButton()).toBeEnabled();
  });

  it('TIER_IS_GREATER: informa que el cupón no se usa y deja confirmar con el beneficio de nivel', async () => {
    await renderReady(
      makeQuote({
        discount: {
          applied: 'TIER',
          amount: 20_000,
          tier: { name: 'Oro', percent: 20, amount: 20_000 },
          coupon: {
            code: 'PROMO10',
            status: 'NOT_APPLIED',
            reason: 'TIER_IS_GREATER',
            message: 'Tu nivel de cliente ya te da un descuento mayor o igual: el cupón no se usa y lo conservás',
            amount: 10_000,
          },
        },
        total: 80_000,
      }),
    );
    const notice = screen.getByTestId('coupon-notice');
    expect(notice).toHaveAttribute('data-coupon-reason', 'TIER_IS_GREATER');
    expect(notice).toHaveTextContent(/no se usa y lo conservás/);
    expect(confirmButton()).toBeEnabled();
  });

  it('REQUIRES_IDENTITY: pide identificarse y bloquea la confirmación', async () => {
    await renderReady(
      makeQuote({
        identified: false,
        discount: {
          applied: 'NONE',
          amount: 0,
          tier: null,
          coupon: { code: 'PERSONAL', status: 'REQUIRES_IDENTITY', reason: 'REQUIRES_IDENTITY', message: 'Este cupón es personal: verificá tu email para usarlo', amount: 0 },
        },
      }),
    );
    expect(screen.getByTestId('coupon-notice')).toHaveTextContent(/verificá tu email/);
    expect(confirmButton()).toBeDisabled();
  });

  it('cupón INVALID: muestra la razón pública del servidor y bloquea', async () => {
    await renderReady(
      makeQuote({
        discount: {
          applied: 'NONE',
          amount: 0,
          tier: null,
          coupon: { code: 'VIEJO', status: 'INVALID', reason: 'COUPON_EXPIRED', message: 'Cupón vencido', amount: 0 },
        },
      }),
    );
    expect(screen.getByTestId('coupon-notice')).toHaveTextContent('Cupón vencido');
    expect(confirmButton()).toBeDisabled();
  });

  it('NON_POSITIVE_PRICE bloquea la compra sin mostrar un precio inventado', async () => {
    fetchCheckoutQuote.mockResolvedValue(
      makeQuote({ subtotal: 0, total: 0, warnings: [{ code: 'NON_POSITIVE_PRICE', productId: 'prod-1' }] }),
    );
    render(<CheckoutForm />);
    await waitFor(() => expect(quoteSummary()).toHaveAttribute('data-quote-status', 'price-issue'));
    expect(screen.queryByTestId('quote-total')).not.toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  it('crea el pedido con expectedTotal = quote.total y sin precios en los items', async () => {
    await renderReady(makeQuote({ total: 112_345 }));
    createOrder.mockResolvedValue({
      orderId: 'ord_1',
      status: 'Pedido Pendiente de Confirmación',
      expiresAt: '',
      message: 'ok',
      orderAccessToken: 'oat',
      totals: { subtotal: 112_345, discount: 0, shipping: 0, total: 112_345 },
    });
    fillForm();
    submit();
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(1));
    const request = createOrder.mock.calls[0]![0];
    expect(request.expectedTotal).toBe(112_345);
    expect(request.items[0]).not.toHaveProperty('unitPrice');
    await screen.findByText(/pedido generado con éxito/i);
  });

  it('409 PRICE_CHANGED: actualiza la quote, avisa, NO crea pedido ni reenvía, y exige confirmar de nuevo', async () => {
    await renderReady(makeQuote({ total: 100_000 }));
    const newQuote = makeQuote({
      shipping: { mode: 'FIXED', amount: 25_000, freeThreshold: null, remainingForFree: null },
      total: 125_000,
    });
    createOrder.mockRejectedValueOnce(
      new ApiError('El total de tu compra cambió.', 409, 'PRICE_CHANGED', { code: 'PRICE_CHANGED', quote: newQuote }),
    );
    fillForm();
    submit();

    const alert = await screen.findByTestId('price-changed');
    expect(alert).toHaveTextContent(gs(100_000));
    expect(alert).toHaveTextContent(gs(125_000));
    expect(screen.getByTestId('quote-total')).toHaveTextContent(gs(125_000));
    expect(screen.queryByText(/pedido generado con éxito/i)).not.toBeInTheDocument();
    // No hubo reenvío automático.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(confirmButton()).toHaveTextContent(/nuevo total/i);

    // Segunda confirmación, explícita, con el total nuevo.
    createOrder.mockResolvedValueOnce({ orderId: 'ord_2', status: 'x', expiresAt: '', message: 'ok', orderAccessToken: 'oat' });
    submit();
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
    expect(createOrder.mock.calls[1]![0].expectedTotal).toBe(125_000);
  });

  it('M5: la sesión se restaura después del primer render → pasa del email al formulario solo', async () => {
    useAuth.setState({ isLoggedIn: false, user: null });
    fetchCheckoutQuote.mockResolvedValue(makeQuote());
    render(<CheckoutForm />);
    expect(screen.getByRole('button', { name: /enviar código/i })).toBeInTheDocument();

    act(() => loginAs('cliente@example.com'));

    await waitFor(() => expect(screen.queryByRole('button', { name: /enviar código/i })).not.toBeInTheDocument());
    await waitFor(() => expect(fetchCheckoutQuote).toHaveBeenCalled());
  });

  it('OTP: el invitado pasa a identificado y se recotiza con su token', async () => {
    useAuth.setState({ isLoggedIn: false, user: null });
    identityToken = null;
    confirmOtp.mockImplementation(async () => {
      identityToken = 'otp-token';
      return { checkoutSessionToken: 'otp-token', guestCartToken: 'g', existingAccount: false, message: 'ok' };
    });
    fetchCheckoutQuote.mockResolvedValue(makeQuote());
    render(<CheckoutForm />);

    // Antes del OTP no hay quote que confirmar.
    expect(fetchCheckoutQuote).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'invitado@example.com' } });
    fireEvent.submit(screen.getByRole('button', { name: /enviar código/i }).closest('form')!);
    const otpInput = await screen.findByPlaceholderText('000000');
    fireEvent.change(otpInput, { target: { value: '123456' } });
    fireEvent.submit(otpInput.closest('form')!);

    await waitFor(() => expect(fetchCheckoutQuote).toHaveBeenCalled());
    expect(fetchCheckoutQuote.mock.calls.at(-1)![1].token).toBe('otp-token');
    await waitFor(() => expect(quoteSummary()).toHaveAttribute('data-quote-status', 'ready'));
  });
  it('M7: 403 EMAIL_VERIFICATION_REQUIRED lleva al OTP existente con el email de la cuenta y, verificado, se puede reintentar', async () => {
    await renderReady(makeQuote({ total: 100_000 }));
    createOrder.mockRejectedValueOnce(
      new ApiError('Verificá tu correo electrónico para poder completar la compra.', 403, 'EMAIL_VERIFICATION_REQUIRED', {
        code: 'EMAIL_VERIFICATION_REQUIRED',
      }),
    );
    fillForm();
    submit();

    // Pasa al paso de email, fijo en el correo de la cuenta (sin cerrar sesión).
    expect(await screen.findByTestId('verify-email-intro')).toHaveTextContent(/necesitamos confirmar que este correo es tuyo/);
    const emailInput = screen.getByDisplayValue('cliente@example.com');
    expect(emailInput).toHaveAttribute('readonly');
    expect(screen.queryByText(/pedido generado con éxito/i)).not.toBeInTheDocument();
    expect(useAuth.getState().isLoggedIn).toBe(true);

    fireEvent.submit(screen.getByRole('button', { name: /enviar código/i }).closest('form')!);
    await waitFor(() => expect(verifyEmail).toHaveBeenCalledWith('cliente@example.com', undefined));
    expect(screen.queryByRole('button', { name: /cambiar correo/i })).not.toBeInTheDocument();

    // OTP correcto: la identidad pasa a ser el token del OTP y se recotiza.
    confirmOtp.mockImplementation(async () => {
      identityToken = 'otp-token';
      return { checkoutSessionToken: 'otp-token', guestCartToken: 'g', existingAccount: true, message: 'ok' };
    });
    const otpInput = await screen.findByPlaceholderText('000000');
    fireEvent.change(otpInput, { target: { value: '123456' } });
    fireEvent.submit(otpInput.closest('form')!);

    expect(await screen.findByTestId('checkout-notice')).toHaveTextContent(/correo verificado/i);
    // No se muestra el aviso de "ya tenés una cuenta" a quien ya está logueado.
    expect(screen.queryByText(/podés iniciar sesión para un checkout más rápido/i)).not.toBeInTheDocument();
    await waitFor(() => expect(fetchCheckoutQuote.mock.calls.at(-1)![1].token).toBe('otp-token'));
    await waitFor(() => expect(quoteSummary()).toHaveAttribute('data-quote-status', 'ready'));

    // Reintento explícito: ahora el pedido se crea.
    createOrder.mockResolvedValueOnce({ orderId: 'ord_m7', status: 'x', expiresAt: '', message: 'ok', orderAccessToken: 'oat' });
    fillForm();
    submit();
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
    expect(createOrder.mock.calls[1]![0].customer.email).toBe('cliente@example.com');
  });
});
