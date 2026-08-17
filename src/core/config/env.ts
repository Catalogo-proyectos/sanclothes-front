const env = process.env;
const apiOrigin = (env.NEXT_PUBLIC_SANTCLOTHES_API_ORIGIN || env.NEXT_PUBLIC_API_URL || 'http://localhost:5014')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

export const coreConfig = {
  apiBaseUrl: `${apiOrigin}/api`,
  apiOrigin,
  /** Explicit connection flag. Backend is opt-in so local development remains usable. */
  useBackend: env.NEXT_PUBLIC_USE_BACKEND === 'true',
} as const;
