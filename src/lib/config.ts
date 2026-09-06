

const requiredEnvVars = [
  'NEXT_PUBLIC_SANTCLOTHES_API_ORIGIN',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_ENV',
] as const;


const env = process.env || {};


if (typeof window !== 'undefined' || process.env.NODE_ENV === 'production') {
  requiredEnvVars.forEach((envVar) => {
    if (!env[envVar]) {
      console.warn(`[Config Warning] Missing environment variable: ${envVar}. Falling back to default.`);
    }
  });
}

// The deployed environment provides an origin, while apiCall consumes the
// versionless /api routes. Keep NEXT_PUBLIC_API_URL as a backwards-compatible
// override for local environments that already provide the full API base URL.
const configuredOrigin = env.NEXT_PUBLIC_SANTCLOTHES_API_ORIGIN?.replace(/\/$/, '');
const rawApiUrl = env.NEXT_PUBLIC_API_URL || (configuredOrigin ? `${configuredOrigin}/api` : 'http://localhost:5014/api');
const apiOrigin = configuredOrigin || rawApiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
const useBackend = env.NEXT_PUBLIC_USE_BACKEND === 'true';
const useMock = env.NEXT_PUBLIC_USE_MOCK === 'true' || (!useBackend && env.NEXT_PUBLIC_USE_MOCK !== 'false');

export const config = {
  api: {
    baseUrl: rawApiUrl,

    origin: apiOrigin,
    healthUrl: env.NEXT_PUBLIC_HEALTH_URL || `${apiOrigin}/health`,
    useMock,

    mediaOrigin: env.NEXT_PUBLIC_MEDIA_ORIGIN || '',
  },
  app: {
    url: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: (env.NEXT_PUBLIC_ENV || 'development') as 'development' | 'staging' | 'production',
  },
  features: {
    loyalty: env.NEXT_PUBLIC_FEATURE_LOYALTY === 'true',
    referrals: env.NEXT_PUBLIC_FEATURE_REFERRALS === 'true',
    sizeFinder: env.NEXT_PUBLIC_FEATURE_SIZE_FINDER === 'true',
    giftCards: env.NEXT_PUBLIC_FEATURE_GIFT_CARDS === 'true',
  },
  jwt: {
    storageKey: env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'trece13_auth_token',
  },

  turnstile: {
    siteKey: env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    get enabled() {
      return Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    },
  },

  google: {
    clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    get enabled() {
      return Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    },
  },
  logging: {
    level: (env.NEXT_PUBLIC_LOG_LEVEL || 'debug') as 'debug' | 'info' | 'warn' | 'error',
  },
} as const;
