'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  /** Token válido, o null cuando vence/falla (hay que resolverlo de nuevo). */
  onToken: (token: string | null) => void;
  /** Cambiarlo fuerza un desafío nuevo (los tokens son de un solo uso). */
  resetKey?: number;
}

/**
 * Captcha de Cloudflare Turnstile. Antes solo se renderizaba un <div> vacío y
 * nunca se cargaba el script: si el backend tenía TURNSTILE_SECRET_KEY, nadie
 * podía pedir el código OTP.
 */
export default function TurnstileWidget({ siteKey, onToken, resetKey = 0 }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const render = () => {
    if (!window.turnstile || !containerRef.current || widgetId.current) return;
    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onTokenRef.current(token),
      // Vencido o con error: sin token y con un desafío nuevo.
      'expired-callback': () => {
        onTokenRef.current(null);
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
      },
      'error-callback': () => onTokenRef.current(null),
    });
  };

  // Si el script ya estaba cargado (navegación del cliente), renderizar al montar.
  useEffect(() => {
    render();
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  useEffect(() => {
    if (resetKey > 0 && widgetId.current) {
      onTokenRef.current(null);
      window.turnstile?.reset(widgetId.current);
    }
  }, [resetKey]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={render}
      />
      <div ref={containerRef} className="flex justify-center" />
    </>
  );
}
