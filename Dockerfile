# syntax=docker/dockerfile:1
# ============================================================================
# SANCLOTHES STOREFRONT — Next.js 16 (App Router) + pnpm 11
# Build multi-stage: deps → builder → runner (server standalone)
# ============================================================================

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH"
RUN npm install --global pnpm@11.8.0
WORKDIR /app

# Env vars públicas. Se inlinan en el build y se leen en runtime (SSR):
# compose las pasa como ARG en cada `docker build`.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_HEALTH_URL
ARG NEXT_PUBLIC_MEDIA_ORIGIN
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ENV
ARG NEXT_PUBLIC_FEATURE_LOYALTY
ARG NEXT_PUBLIC_FEATURE_REFERRALS
ARG NEXT_PUBLIC_FEATURE_SIZE_FINDER
ARG NEXT_PUBLIC_FEATURE_GIFT_CARDS
ARG NEXT_PUBLIC_LOG_LEVEL
ARG NEXT_PUBLIC_JWT_STORAGE_KEY
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_SANTCLOTHES_API_ORIGIN

ENV NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
    NEXT_PUBLIC_HEALTH_URL="$NEXT_PUBLIC_HEALTH_URL" \
    NEXT_PUBLIC_MEDIA_ORIGIN="$NEXT_PUBLIC_MEDIA_ORIGIN" \
    NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
    NEXT_PUBLIC_ENV="$NEXT_PUBLIC_ENV" \
    NEXT_PUBLIC_FEATURE_LOYALTY="$NEXT_PUBLIC_FEATURE_LOYALTY" \
    NEXT_PUBLIC_FEATURE_REFERRALS="$NEXT_PUBLIC_FEATURE_REFERRALS" \
    NEXT_PUBLIC_FEATURE_SIZE_FINDER="$NEXT_PUBLIC_FEATURE_SIZE_FINDER" \
    NEXT_PUBLIC_FEATURE_GIFT_CARDS="$NEXT_PUBLIC_FEATURE_GIFT_CARDS" \
    NEXT_PUBLIC_LOG_LEVEL="$NEXT_PUBLIC_LOG_LEVEL" \
    NEXT_PUBLIC_JWT_STORAGE_KEY="$NEXT_PUBLIC_JWT_STORAGE_KEY" \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY="$NEXT_PUBLIC_TURNSTILE_SITE_KEY" \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID="$NEXT_PUBLIC_GOOGLE_CLIENT_ID" \
    NEXT_PUBLIC_SANTCLOTHES_API_ORIGIN="$NEXT_PUBLIC_SANTCLOTHES_API_ORIGIN"

# ----------------------------------------------------------------------------
# DEPS — dependencias completas (dev + prod) contra el lockfile
# ----------------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ----------------------------------------------------------------------------
# BUILDER — compila la app. NEXT_PUBLIC_* quedan inlineados en el artefacto.
# ----------------------------------------------------------------------------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ----------------------------------------------------------------------------
# RUNNER — solo lo mínimo: server standalone + assets estáticos
# ----------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs --home-dir /app nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
