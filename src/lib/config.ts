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
    baseUrl: env.NEXT_PUBLIC_API_URL || 'http://localhost:5014/api',
    healthUrl: env.NEXT_PUBLIC_HEALTH_URL || 'http://localhost:5014/health',
    useMock: env.NEXT_PUBLIC_USE_MOCK === 'true' || env.NEXT_PUBLIC_USE_MOCK === undefined,
    /**
     * Host vigente de media. Las URLs de imagen se congelan en la base al subirlas
     * y traen el host del entorno donde se subió la foto (cdn.trecepy.com,
     * localhost:5012 de MinIO o localhost:5014/uploads del fallback local).
     * normalizeImageUrl() las reapunta acá. Vacío = usar la URL tal cual vino.
     */
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
  logging: {
    level: (env.NEXT_PUBLIC_LOG_LEVEL || 'debug') as 'debug' | 'info' | 'warn' | 'error',
  },
} as const;
