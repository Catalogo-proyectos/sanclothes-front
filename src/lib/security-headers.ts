

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
