/**
 * M4 — headers de seguridad para todas las rutas del storefront.
 *
 * Solo protecciones que no dependen de qué scripts carga la página:
 *   - anti-framing (clickjacking): CSP `frame-ancestors 'none'` + X-Frame-Options;
 *   - `base-uri`/`object-src` cerrados;
 *   - nosniff, Referrer-Policy, Permissions-Policy y HSTS. La geolocalización
 *     queda habilitada solo para este origen (el checkout ofrece compartir la
 *     ubicación de entrega); iframes y orígenes ajenos siguen bloqueados.
 *
 * Una CSP de scripts (`script-src`) NO va acá: la tienda carga Meta Pixel,
 * Turnstile y Google, y Next necesita nonces para no usar 'unsafe-inline'.
 * Eso es una decisión aparte; esta CSP no restringe scripts ni estilos.
 *
 * HSTS sin `includeSubDomains`/`preload`: no se fuerza HTTPS en subdominios que
 * esta app no controla.
 */
export interface HeaderEntry {
  key: string;
  value: string;
}

export const SECURITY_HEADERS: HeaderEntry[] = [
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];
