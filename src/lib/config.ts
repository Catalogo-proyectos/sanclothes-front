/**
 * Centralized environment configuration.
 * Validates environment variables and provides structured app config.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_HEALTH_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_ENV',
] as const;

// Ensure process.env is defined (fallback for client-side evaluation)
const env = process.env || {};

// Validate required env vars only in non-test runtime environment
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'production') {
  requiredEnvVars.forEach((envVar) => {
    if (!env[envVar]) {
      console.warn(`[Config Warning] Missing environment variable: ${envVar}. Falling back to default.`);
    }
  });
}

export const config = {
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    healthUrl: env.NEXT_PUBLIC_HEALTH_URL || 'http://localhost:3001/health',
    useMock: env.NEXT_PUBLIC_USE_MOCK === 'true' || env.NEXT_PUBLIC_USE_MOCK === undefined,
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
  logging: {
    level: (env.NEXT_PUBLIC_LOG_LEVEL || 'debug') as 'debug' | 'info' | 'warn' | 'error',
  },
} as const;
