'use client';

import { useState } from 'react';
import type { DeliveryLocation } from '@/types/api';

type Status = 'idle' | 'locating' | 'error';

const ERROR_MESSAGES: Record<number, string> = {
  1: 'No diste permiso para usar tu ubicación. Podés habilitarlo en el navegador o seguir sin ella.',
  2: 'No pudimos obtener tu ubicación. Probá de nuevo o seguí sin ella.',
  3: 'Tardó demasiado en obtener tu ubicación. Probá de nuevo o seguí sin ella.',
};

/** Coordenadas con 6 decimales (~10 cm): más precisión no aporta nada. */
const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

/**
 * Ubicación de entrega opcional: el cliente la comparte desde el navegador y el
 * staff la abre en Google Maps desde el pedido. Nunca reemplaza la dirección.
 */
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200" data-testid="delivery-location">
        <div className="text-xs text-emerald-900">
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
      >
        {status === 'locating' ? 'Obteniendo ubicación…' : '📍 Compartir mi ubicación para la entrega (opcional)'}
      </button>
      <p className="text-[11px] text-slate-500">
        Ayuda al repartidor a encontrarte. Solo la usamos para este envío.
      </p>
      {status === 'error' && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
