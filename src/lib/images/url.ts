import { config } from '@/lib/config';


const KNOWN_MEDIA_HOSTS = [
  'https://api.santclothes.com.py',
  'http://localhost:5012',
  'http://localhost:5014',
  'http://127.0.0.1:5012',
  'http://127.0.0.1:5014',
] as const;


export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const clean = url.trim();
  if (!clean) return null;


  if (clean.startsWith('/') || clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }

  const mediaOrigin = config.api.mediaOrigin;
  if (!mediaOrigin) return clean;

  const origin = mediaOrigin.replace(/\/$/, '');

  for (const host of KNOWN_MEDIA_HOSTS) {
    if (clean.startsWith(host)) {
      const path = clean.slice(host.length);

      return origin === host ? clean : `${origin}${path}`;
    }
  }


  return clean;
}
