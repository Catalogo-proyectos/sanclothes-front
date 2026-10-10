

import { AUTH_TOKEN_KEY } from './storage-keys';

const publicEnv = {
  NEXT_PUBLIC_SANTCLOTHES_API_ORIGIN: process.env.NEXT_PUBLIC_SANTCLOTHES_API_ORIGIN,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_HEALTH_URL: process.env.NEXT_PUBLIC_HEALTH_URL,
  NEXT_PUBLIC_MEDIA_ORIGIN: process.env.NEXT_PUBLIC_MEDIA_ORIGIN,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
  NEXT_PUBLIC_FEATURE_LOYALTY: process.env.NEXT_PUBLIC_FEATURE_LOYALTY,
  NEXT_PUBLIC_FEATURE_REFERRALS: process.env.NEXT_PUBLIC_FEATURE_REFERRALS,
  NEXT_PUBLIC_FEATURE_SIZE_FINDER: process.env.NEXT_PUBLIC_FEATURE_SIZE_FINDER,
  NEXT_PUBLIC_FEATURE_GIFT_CARDS: process.env.NEXT_PUBLIC_FEATURE_GIFT_CARDS,
  NEXT_PUBLIC_JWT_STORAGE_KEY: process.env.NEXT_PUBLIC_JWT_STORAGE_KEY,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
};

const requiredEnvVars = [
  'NEXT_PUBLIC_SANTCLOTHES_API_ORIGIN',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_ENV',
] as const;

if (typeof window !== 'undefined' || process.env.NODE_ENV === 'production') {
  requiredEnvVars.forEach((envVar) => {
    if (!publicEnv[envVar]) {
      console.warn(`[Config Warning] Missing environment variable: ${envVar}. Falling back to default.`);
    }
  });
}

const configuredOrigin = publicEnv.NEXT_PUBLIC_SANTCLOTHES_API_ORIGIN?.replace(/\/$/, '');
const rawApiUrl = publicEnv.NEXT_PUBLIC_API_URL || (configuredOrigin ? `${configuredOrigin}/api` : 'http://localhost:5014/api');
const apiOrigin = configuredOrigin || rawApiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
export const config = {
  api: {
    baseUrl: rawApiUrl,

    origin: apiOrigin,
    healthUrl: publicEnv.NEXT_PUBLIC_HEALTH_URL || `${apiOrigin}/health`,
    mediaOrigin: publicEnv.NEXT_PUBLIC_MEDIA_ORIGIN || '',
  },
  app: {
    url: publicEnv.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: (publicEnv.NEXT_PUBLIC_ENV || 'development') as 'development' | 'staging' | 'production',
  },
  features: {
    loyalty: publicEnv.NEXT_PUBLIC_FEATURE_LOYALTY === 'true',
    referrals: publicEnv.NEXT_PUBLIC_FEATURE_REFERRALS === 'true',
    sizeFinder: publicEnv.NEXT_PUBLIC_FEATURE_SIZE_FINDER === 'true',
    giftCards: publicEnv.NEXT_PUBLIC_FEATURE_GIFT_CARDS === 'true',
  },
  jwt: {
    storageKey: publicEnv.NEXT_PUBLIC_JWT_STORAGE_KEY || AUTH_TOKEN_KEY,
  },

  turnstile: {
    siteKey: publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    get enabled() {
      return Boolean(publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    },
  },

  google: {
    clientId: publicEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    get enabled() {
      return Boolean(publicEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    },
  },
  logging: {
    level: (publicEnv.NEXT_PUBLIC_LOG_LEVEL || 'debug') as 'debug' | 'info' | 'warn' | 'error',
  },
} as const;
