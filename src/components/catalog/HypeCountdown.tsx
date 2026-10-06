'use client';

import { useEffect, useState } from 'react';

interface HypeCountdownProps {
  launchAt: string;
  /** compact: una línea (tarjeta); full: bloques grandes (ficha). */
  variant?: 'compact' | 'full';
  /** Al llegar a cero (p. ej. recargar la ficha para mostrar los talles). */
  onLaunch?: () => void;
}

function remaining(launchAt: string, now: number) {
  const ms = Math.max(0, new Date(launchAt).getTime() - now);
  const s = Math.floor(ms / 1000);
  return { done: ms === 0, days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Cuenta regresiva de un lanzamiento hype. */
export default function HypeCountdown({ launchAt, variant = 'full', onLaunch }: HypeCountdownProps) {
  // null hasta montar: el server y el cliente no tienen la misma hora (evita hydration mismatch).
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const t = now === null ? null : remaining(launchAt, now);

  useEffect(() => {
    if (t?.done) onLaunch?.();
  }, [t?.done, onLaunch]);

  if (variant === 'compact') {
    return (
      <span className="font-mono font-bold tabular-nums" aria-live="off">
        {t === null ? '--:--:--' : t.done ? '¡YA DISPONIBLE!' : `${t.days > 0 ? `${t.days}D ` : ''}${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`}
      </span>
    );
  }

  const blocks: Array<[string, number | null]> = [
    ['DÍAS', t?.days ?? null],
    ['HORAS', t?.hours ?? null],
    ['MIN', t?.minutes ?? null],
    ['SEG', t?.seconds ?? null],
  ];

  return (
    <div className="grid grid-cols-4 gap-2" role="timer" aria-label="Tiempo restante para el lanzamiento">
      {blocks.map(([label, value]) => (
        <div key={label} className="border border-[#17191c]/15 bg-white py-3 text-center">
          <span className="block text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-[0.04em] tabular-nums text-[#17191c]">
            {value === null ? '--' : pad(value)}
          </span>
          <span className="block text-[9px] font-mono font-bold tracking-[0.2em] text-zinc-500">{label}</span>
        </div>
      ))}
    </div>
  );
}
