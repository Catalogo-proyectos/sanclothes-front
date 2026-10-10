import { describe, expect, it } from 'vitest';
import nextConfig from '../../../next.config';
import { SECURITY_HEADERS } from '@/lib/security-headers';

const header = (key: string) => SECURITY_HEADERS.find((h) => h.key === key)?.value;

describe('headers de seguridad del storefront (M4)', () => {
  it('protege contra framing, sniffing y fuga de referrer', () => {
    expect(header('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(header('X-Frame-Options')).toBe('DENY');
    expect(header('X-Content-Type-Options')).toBe('nosniff');
    expect(header('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header('Strict-Transport-Security')).toMatch(/^max-age=\d+/);
  });

  it('geolocalización solo para este origen; cámara y micrófono bloqueados', () => {
    const policy = header('Permissions-Policy');
    expect(policy).toContain('geolocation=(self)');
    expect(policy).toContain('camera=()');
    expect(policy).toContain('microphone=()');
  });

  it('la CSP no restringe scripts (eso requiere nonces y es una decisión aparte)', () => {
    expect(header('Content-Security-Policy')).not.toMatch(/script-src|default-src/);
  });

  it('next.config los aplica a todas las rutas', async () => {
    const rules = await nextConfig.headers!();
    const all = rules.find((r) => r.source === '/:path*');
    expect(all?.headers).toEqual(SECURITY_HEADERS);
    
    expect(rules.some((r) => r.source === '/img/:path*')).toBe(true);
  });
});
