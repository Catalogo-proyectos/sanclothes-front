'use client';

import { useState } from 'react';
import type { DeliveryLocation } from '@/types/api';

type Status = 'idle' | 'locating' | 'error';

const ERROR_MESSAGES: Record<number, string> = {
  1: 'No diste permiso para usar tu ubicación. Podés habilitarlo en el navegador o seguir sin ella.',
  2: 'No pudimos obtener tu ubicación. Probá de nuevo o seguí sin ella.',
  3: 'Tardó demasiado en obtener tu ubicación. Probá de nuevo o seguí sin ella.',
};

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

export default function DeliveryLocationPicker({
  value,
  onChange,
}: {
  value: DeliveryLocation | null;
  onChange: (location: DeliveryLocation | null) => void;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const locate = () => {
    if (!supported) {
      setStatus('error');
      setError('Tu navegador no permite compartir la ubicación.');
      return;
    }
    setStatus('locating');
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          lat: round6(position.coords.latitude),
          lng: round6(position.coords.longitude),
          accuracy: Math.min(100_000, Math.round(position.coords.accuracy)),
        });
        setStatus('idle');
      },
      (err) => {
        setStatus('error');
        setError(ERROR_MESSAGES[err.code] ?? ERROR_MESSAGES[2]!);
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  };

  if (value) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-l-2 border-emerald-500 bg-emerald-50 p-4" data-testid="delivery-location">
        <div className="font-mono text-xs text-emerald-900">
          <p className="font-bold">📍 Ubicación de entrega agregada</p>
          <p className="mt-0.5 text-emerald-700">
            Precisión aproximada: ±{value.accuracy ?? '?'} m.{' '}
            <a
              href={`https://www.google.com/maps?q=${value.lat},${value.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              Ver en el mapa
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs font-bold text-emerald-900 underline"
        >
          Quitar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={locate}
        disabled={status === 'locating'}
        className="flex w-full items-center justify-center gap-2 border border-[#d0d1d2] bg-white px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#17191c] transition-colors hover:bg-[#f6f8f9] disabled:opacity-60"
      >
        {status === 'locating' ? 'Obteniendo ubicación…' : '📍 Compartir mi ubicación para la entrega'}
      </button>
      {status === 'error' && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
