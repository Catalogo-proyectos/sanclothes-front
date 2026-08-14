import { config } from '@/lib/config';

/**
 * Hosts desde los que el backend pudo haber emitido una URL de imagen.
 *
 * El backend congela la URL absoluta en la base en el momento de la subida
 * (backend/src/lib/minio.ts:135-186), y el host depende de cómo estaba
 * configurado el almacenamiento en ese entorno:
 *
 *   - CDN_URL definido        → https://cdn.trecepy.com/catalog/<archivo>
 *   - MinIO sin CDN           → http://localhost:5012/catalog/<archivo>
 *   - MinIO caído (fallback)  → http://localhost:5014/uploads/catalog/<archivo>
 *
 * Una foto subida en desarrollo conserva `localhost` para siempre, incluso
 * mirada desde producción. Por eso reapuntamos el host en tiempo de render.
 */
const KNOWN_MEDIA_HOSTS = [
  'https://cdn.trecepy.com',
  'https://cdn.trece13.com',
  'https://api.santclothes.com.py',
  'http://localhost:5012',
  'http://localhost:5014',
  'http://127.0.0.1:5012',
  'http://127.0.0.1:5014',
] as const;

/**
 * Reapunta una URL de imagen del backend al host de media vigente.
 *
 * Devuelve `null` para entradas vacías para que quien la llame decida el
 * fallback (normalmente PLACEHOLDER_PRODUCT), en vez de propagar un string
 * vacío que `next/image` rechaza en runtime.
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const clean = url.trim();
  if (!clean) return null;

  // Assets locales del front (public/) y data/blob URLs pasan sin tocar.
  if (clean.startsWith('/') || clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }

  const mediaOrigin = config.api.mediaOrigin;
  if (!mediaOrigin) return clean;

  const origin = mediaOrigin.replace(/\/$/, '');

  for (const host of KNOWN_MEDIA_HOSTS) {
    if (clean.startsWith(host)) {
      const path = clean.slice(host.length);
      // Ya está en el host correcto: evitamos reconstruir el string.
      return origin === host ? clean : `${origin}${path}`;
    }
  }

  // Host desconocido (una imagen externa legítima, por ejemplo): se respeta.
  return clean;
}
