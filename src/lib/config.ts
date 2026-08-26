

const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_HEALTH_URL',
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

const rawApiUrl = env.NEXT_PUBLIC_API_URL || 'http://localhost:5014/api';


const apiOrigin = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const config = {
  api: {
    baseUrl: rawApiUrl,

    origin: apiOrigin,
    healthUrl: env.NEXT_PUBLIC_HEALTH_URL || 'http://localhost:5014/health',
    useMock: env.NEXT_PUBLIC_USE_MOCK === 'true' || env.NEXT_PUBLIC_USE_MOCK === undefined,

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
