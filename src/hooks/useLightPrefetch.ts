'use client';

import { useState } from 'react';

interface NetworkInformationLike {
  saveData?: boolean;
}

/**
 * `prefetch` para links secundarios: en celular (o con ahorro de datos) se
 * desactiva para no competir con el hero; en desktop devuelve `undefined`
 * y Next mantiene su prefetch por defecto.
 *
 * Se resuelve en el estado inicial (no en un effect) para que el Link nunca
 * llegue a prefetchear en celular. `prefetch` no se refleja en el HTML, así
 * que no genera mismatch de hidratación.
 */
export function useLightPrefetch(): false | undefined {
  const [prefetch] = useState<false | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    return isMobile || connection?.saveData ? false : undefined;
  });
  return prefetch;
}
