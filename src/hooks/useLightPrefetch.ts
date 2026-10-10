'use client';

import { useState } from 'react';

interface NetworkInformationLike {
  saveData?: boolean;
}

export function useLightPrefetch(): false | undefined {
  const [prefetch] = useState<false | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    return isMobile || connection?.saveData ? false : undefined;
  });
  return prefetch;
}
