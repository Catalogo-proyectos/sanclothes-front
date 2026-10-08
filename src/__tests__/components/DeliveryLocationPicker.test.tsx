import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DeliveryLocationPicker from '@/components/checkout/DeliveryLocationPicker';

function stubGeolocation(impl: (ok: PositionCallback, fail: PositionErrorCallback) => void) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition: vi.fn(impl) },
  });
}

afterEach(() => {
  // @ts-expect-error -- limpiar el stub entre tests
  delete navigator.geolocation;
});

describe('DeliveryLocationPicker', () => {
  it('comparte la ubicación redondeada a 6 decimales', () => {
    stubGeolocation((ok) =>
      ok({ coords: { latitude: -25.28224567891, longitude: -57.56453212345, accuracy: 17.6 } } as GeolocationPosition),
    );
    const onChange = vi.fn();
    render(<DeliveryLocationPicker value={null} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /compartir mi ubicación/i }));

    expect(onChange).toHaveBeenCalledWith({ lat: -25.282246, lng: -57.564532, accuracy: 18 });
  });

  it('permiso denegado: explica y deja seguir sin ubicación', () => {
    stubGeolocation((_ok, fail) => fail({ code: 1 } as GeolocationPositionError));
    const onChange = vi.fn();
    render(<DeliveryLocationPicker value={null} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /compartir mi ubicación/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/no diste permiso/i);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('con ubicación: link al mapa y se puede quitar', () => {
    const onChange = vi.fn();
    render(<DeliveryLocationPicker value={{ lat: -25.28, lng: -57.56, accuracy: 20 }} onChange={onChange} />);

    expect(screen.getByRole('link', { name: /ver en el mapa/i })).toHaveAttribute('href', 'https://www.google.com/maps?q=-25.28,-57.56');
    fireEvent.click(screen.getByRole('button', { name: /quitar/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
