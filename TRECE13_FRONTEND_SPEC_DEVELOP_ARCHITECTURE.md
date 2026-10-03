# TRECE13 Ecommerce Platform — Frontend Specification & Development Architecture

**Project**: TRECE13 Ecommerce Platform (Streetwear Drop-Based Ecommerce + CRM)  
**Frontend Stack**: Next.js 14+ (with supply-chain security measures)  
**Package Manager**: pnpm  
**Container**: Docker Compose (production-ready)  
**Target Audience**: Frontend Junior Developer (AI-assisted)  
**Date**: 2026-07-19

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Module Structure](#architecture--module-structure)
3. [Tech Stack & Dependencies](#tech-stack--dependencies)
4. [Project Setup](#project-setup)
5. [Environment Configuration](#environment-configuration)
6. [Public API Endpoints](#public-api-endpoints)
7. [Frontend Module Breakdown](#frontend-module-breakdown)
8. [Authentication & JWT Flow](#authentication--jwt-flow)
9. [State Management](#state-management)
10. [API Integration Patterns](#api-integration-patterns)
11. [Docker Compose Configuration](#docker-compose-configuration)
12. [Development Workflow](#development-workflow)
13. [AI-Assisted Development Tips](#ai-assisted-development-tips)

---

## Overview

### Scope
This document guides the development of the **TRECE13 public storefront frontend** using Next.js. The storefront will:
- Display product catalog (paginated, filtered by cut and category)
- Support product detail pages with variants and size recommendations
- Implement a shopping cart and checkout flow
- Provide customer authentication (register, login, password reset)
- Display customer order history and order detail
- Support customer support ticket management
- Integrate with the backend Fastify API via REST endpoints

### Key Principles
- **Supply-chain security**: Use pinned, verified dependencies; audit regularly with `npm audit` and `pnpm audit`.
- **Environment-first**: All API URLs, ports, and configuration live in `.env` files; no hardcoded values.
- **AI-friendly**: Code is structured for Claude/AI integration; inline JSDoc comments guide AI context.
- **Modular**: Each domain has its own feature folder with clear separation of concerns.

---

## Architecture & Module Structure

### Directory Layout

```
storefront/
├── public/                          # Static assets (favicon, brand images, etc.)
│   └── images/
├── src/
│   ├── app/                         # Next.js 14 App Router
│   │   ├── layout.tsx               # Root layout (HTML shell, providers)
│   │   ├── page.tsx                 # Home page / catalog landing
│   │   ├── globals.css              # Global styles
│   │   ├── (catalog)/               # Catalog & product detail routes
│   │   │   ├── page.tsx             # GET /catalog (product listing)
│   │   │   └── products/
│   │   │       └── [productId]/
│   │   │           └── page.tsx     # GET /products/:productId (detail)
│   │   ├── (auth)/                  # Auth routes
│   │   │   ├── register/page.tsx    # POST /auth/register
│   │   │   ├── login/page.tsx       # POST /auth/login
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx         # POST /auth/forgot-password
│   │   │   └── reset-password/
│   │   │       └── page.tsx         # POST /auth/reset-password?nonce=...&token=...
│   │   ├── (customer)/              # Customer-protected routes
│   │   │   ├── dashboard/page.tsx   # Customer profile, order history
│   │   │   ├── orders/[orderId]/
│   │   │   │   └── page.tsx         # GET /orders/:orderId (customer view)
│   │   │   ├── support/
│   │   │   │   └── page.tsx         # Support tickets CRUD
│   │   │   └── account/page.tsx     # Profile edit, password change
│   │   ├── checkout/
│   │   │   └── page.tsx             # POST /checkout (atomic order creation)
│   │   └── unsubscribe/
│   │       └── page.tsx             # GET /unsubscribe?token=... (public)
│   ├── components/                  # Reusable React components
│   │   ├── common/
│   │   │   ├── Header.tsx           # Top nav, cart icon, auth state
│   │   │   ├── Footer.tsx           # Footer with links
│   │   │   ├── Navbar.tsx           # Navigation bar
│   │   │   └── CartIcon.tsx         # Floating cart badge
│   │   ├── catalog/
│   │   │   ├── ProductCard.tsx      # Product preview card
│   │   │   ├── ProductGrid.tsx      # Grid layout with products
│   │   │   ├── ProductDetail.tsx    # Detail view (images, variants, add-to-cart)
│   │   │   ├── FilterBar.tsx        # Cut, category, price filters
│   │   │   └── CutBreadcrumb.tsx    # Cut selector breadcrumb
│   │   ├── auth/
│   │   │   ├── RegisterForm.tsx     # Register form with validation
│   │   │   ├── LoginForm.tsx        # Login form with JWT storage
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   └── ProtectedRoute.tsx   # Wrapper for auth-required routes
│   │   ├── checkout/
│   │   │   ├── Cart.tsx             # Cart drawer/modal
│   │   │   ├── CartItem.tsx         # Single cart item with qty/remove
│   │   │   ├── CheckoutForm.tsx     # Order creation form (address, contact)
│   │   │   ├── OrderSummary.tsx     # Order total, discounts breakdown
│   │   │   └── ReceiptUpload.tsx    # File upload (payment proof)
│   │   ├── customer/
│   │   │   ├── OrderCard.tsx        # Order card (status, summary)
│   │   │   ├── OrderDetail.tsx      # Full order detail
│   │   │   ├── TicketForm.tsx       # Support ticket creation
│   │   │   ├── TicketThread.tsx     # Ticket chat thread
│   │   │   └── ProfileForm.tsx      # Profile/password edit
│   │   └── loading/
│   │       ├── SkeletonCard.tsx     # Reusable skeleton loader
│   │       └── LoadingSpinner.tsx   # Spinner component
│   ├── lib/
│   │   ├── api.ts                   # API client (fetch wrapper with JWT)
│   │   ├── auth.ts                  # JWT storage (localStorage) & parsing
│   │   ├── cart.ts                  # Client-side cart logic (Zustand)
│   │   ├── errors.ts                # Error handling utilities
│   │   └── constants.ts             # API URLs, routes, etc. (from .env)
│   ├── hooks/
│   │   ├── useAuth.ts               # Auth state hook (JWT + user data)
│   │   ├── useCart.ts               # Cart state hook (Zustand)
│   │   ├── useFetch.ts              # Data fetching hook (with error handling)
│   │   ├── usePagination.ts         # Pagination state helper
│   │   └── useLocalStorage.ts       # LocalStorage hook
│   ├── types/
│   │   ├── api.ts                   # API response types (generated from backend)
│   │   ├── cart.ts                  # Cart item & state types
│   │   ├── auth.ts                  # JWT payload, user types
│   │   └── form.ts                  # Form input types (register, login, etc.)
│   ├── styles/
│   │   ├── colors.css               # Color palette (CSS variables)
│   │   ├── typography.css           # Font scales
│   │   ├── layout.css               # Grid, flexbox utilities
│   │   └── animations.css           # Transitions, keyframes
│   └── utils/
│       ├── format.ts                # Number/date formatting (PYG currency)
│       ├── validation.ts            # Form validation rules
│       └── helpers.ts               # Utility functions
├── .env.local                       # Local env (git-ignored)
├── .env.example                     # Template for .env vars
├── .env.production                  # Production env
├── .env.staging                     # Staging env
├── Dockerfile                       # Multi-stage Docker build
├── compose.yml                      # Docker Compose for local + prod
├── pnpm-lock.yaml                   # Lockfile (commit to repo)
├── package.json                     # Dependencies
├── next.config.js                   # Next.js config
├── tsconfig.json                    # TypeScript config
└── .gitignore                       # Git ignore rules
```

### Architectural Layers

```
┌─────────────────────────────────────┐
│   UI Components (React/TSX)          │
│   (ProductCard, CheckoutForm, etc.)  │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   Hooks & State (Zustand)            │
│   (useAuth, useCart, useFetch)       │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   API Client Layer (lib/api.ts)      │
│   (Fetch + JWT + Error Handling)     │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   Backend REST API (Fastify)         │
│   (Catalog, Auth, Checkout, etc.)    │
└─────────────────────────────────────┘
```

---

## Tech Stack & Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "zustand": "^4.4.0",
    "axios": "^1.7.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.50.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.2.0"
  }
}
```

### Why Each Dependency?

| Package | Purpose | Notes |
|---------|---------|-------|
| `next` | React framework with SSR/SSG | Latest stable version; vetted for supply-chain security |
| `react` / `react-dom` | UI library | Pinned to 18.3.0 for consistency |
| `typescript` | Type safety | Strict mode for contract safety |
| `zustand` | State management | Lightweight alternative to Redux; perfect for cart/auth state |
| `axios` | HTTP client | Promise-based; better error handling than `fetch` |
| `zod` | Runtime schema validation | Validates API responses; catches backend contract changes |
| `react-hook-form` | Form state | Minimal re-renders; integrates well with Zod |
| `clsx` | Conditional CSS | Utility for className merging |
| `tailwindcss` | CSS framework | Utility-first; ships with Next.js support |

### Security Considerations

- **Pinned versions**: No `^` or `~` prefixes; lock exact versions in `package.json`.
- **Audit command**: Run `pnpm audit` before deployment.
- **Dependabot**: Enable Dependabot on GitHub to auto-check for vulnerabilities.
- **Next.js updates**: Next.js 14 has built-in protections against known supply-chain attacks.

---

## Project Setup

### Prerequisites

- **Node.js**: 18+ (LTS)
- **pnpm**: 8+
- **Docker**: 20.10+ (for container builds)

### Initial Setup

```bash
# Clone repository
git clone <repo-url> trece13-storefront
cd trece13-storefront

# Install pnpm globally (if not already)
npm install -g pnpm@latest

# Install dependencies
pnpm install

# Verify installation
pnpm --version
node --version

# Copy .env template
cp .env.example .env.local

# Edit .env.local with local API URL
# (See "Environment Configuration" section below)

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Useful pnpm Commands

```bash
# Install deps
pnpm install

# Add a new dependency
pnpm add package-name

# Add a dev dependency
pnpm add -D package-name

# Remove a dependency
pnpm remove package-name

# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Format code
pnpm format

# Type-check
pnpm type-check

# Run tests (when added)
pnpm test

# Audit dependencies
pnpm audit
```

---

## Environment Configuration

### Overview

All environment variables must be defined in `.env.local` (local), `.env.staging`, or `.env.production`. **Never hardcode URLs or ports in code.**

### .env.example

```bash
# ===== BACKEND API =====
# REST API base URL (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Backend health check endpoint
NEXT_PUBLIC_HEALTH_URL=http://localhost:3001/health

# ===== FRONTEND =====
# Frontend public URL (for absolute links, redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment name (development, staging, production)
NEXT_PUBLIC_ENV=development

# ===== FEATURES =====
# Toggle features for gradual rollout
NEXT_PUBLIC_FEATURE_LOYALTY=true
NEXT_PUBLIC_FEATURE_REFERRALS=true
NEXT_PUBLIC_FEATURE_SIZE_FINDER=true
NEXT_PUBLIC_FEATURE_GIFT_CARDS=true

# ===== LOGGING =====
NEXT_PUBLIC_LOG_LEVEL=debug

# ===== SENTRY (ERROR TRACKING) =====
# Optional: Sentry DSN for error tracking in production
NEXT_PUBLIC_SENTRY_DSN=

# ===== JWT =====
# JWT storage key in localStorage (do not change after launch)
NEXT_PUBLIC_JWT_STORAGE_KEY=trece13_auth_token
```

### Environment-Specific Examples

**Local Development (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_HEALTH_URL=http://localhost:3001/health
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_LOG_LEVEL=debug
```

**Staging (.env.staging)**
```bash
NEXT_PUBLIC_API_URL=https://api-staging.trece13.com/api
NEXT_PUBLIC_HEALTH_URL=https://api-staging.trece13.com/health
NEXT_PUBLIC_APP_URL=https://staging.trece13.com
NEXT_PUBLIC_ENV=staging
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Production (.env.production)**
```bash
NEXT_PUBLIC_API_URL=https://api.trece13.com/api
NEXT_PUBLIC_HEALTH_URL=https://api.trece13.com/health
NEXT_PUBLIC_APP_URL=https://trece13.com
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_LOG_LEVEL=warn
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Loading Environment Variables in Next.js

Create `src/lib/config.ts`:

```typescript
/**
 * Centralized environment configuration.
 * All env vars are validated here; missing vars throw at build time.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_HEALTH_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_ENV',
] as const;

// Validate at build time
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    healthUrl: process.env.NEXT_PUBLIC_HEALTH_URL!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL!,
    env: process.env.NEXT_PUBLIC_ENV as 'development' | 'staging' | 'production',
  },
  features: {
    loyalty: process.env.NEXT_PUBLIC_FEATURE_LOYALTY === 'true',
    referrals: process.env.NEXT_PUBLIC_FEATURE_REFERRALS === 'true',
    sizeFinder: process.env.NEXT_PUBLIC_FEATURE_SIZE_FINDER === 'true',
    giftCards: process.env.NEXT_PUBLIC_FEATURE_GIFT_CARDS === 'true',
  },
  jwt: {
    storageKey: process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'trece13_auth_token',
  },
  logging: {
    level: (process.env.NEXT_PUBLIC_LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
  },
} as const;
```

---

## Public API Endpoints

This section describes the **public endpoints** that the frontend will integrate with. All endpoints require the `NEXT_PUBLIC_API_URL` environment variable to be set.

### Base URL

All API calls prefix with `NEXT_PUBLIC_API_URL` (e.g., `http://localhost:3001/api`).

### Health & Infrastructure

#### GET `/health`
**Purpose**: Liveness probe (used by load balancers, health checks).

**Response 200**:
```json
{
  "status": "ok",
  "timestamp": "2026-07-18T12:00:00.000Z"
}
```

---

### Catalog (Product Listing & Detail)

#### GET `/api/catalog`
**Purpose**: List active products from Redis cache, optionally filtered.

**Query Parameters**:
| Param | Type | Default | Example | Notes |
|-------|------|---------|---------|-------|
| `cut` | string | — | `FEMENINO` | Filter by cut code |
| `category` | string | — | `remeras` | Filter by category |

**Response 200** (array of `CatalogProduct`):
```json
[
  {
    "productId": "prod_trece_01",
    "slug": "remera-oversize",
    "title": "Remera Oversize",
    "description": "Remera oversize 100% algodón",
    "price": 150000,
    "discountPrice": null,
    "images": [
      {
        "url": "https://api.example.com/uploads/prod_trece_01_1.jpg",
        "alt": "Front view",
        "cutVariant": "FEMENINO"
      }
    ],
    "cuts": ["FEMENINO", "MASCULINO"],
    "category": "remeras",
    "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
    "stockStatus": "IN_STOCK",
    "rating": 4.5,
    "reviewCount": 12
  }
]
```

**Error Response 400**:
```json
{
  "error": "Invalid cut or category",
  "code": "INVALID_FILTER"
}
```

---

#### GET `/api/catalog/cuts`
**Purpose**: List available cuts with product counts.

**Response 200**:
```json
[
  {
    "code": "FEMENINO",
    "label": "Colección Femenina",
    "productCount": 42
  },
  {
    "code": "MASCULINO",
    "label": "Colección Masculina",
    "productCount": 38
  }
]
```

---

#### GET `/api/catalog/:productId`
**Purpose**: Single product detail from Redis cache.

**Path Parameters**:
| Param | Type | Example |
|-------|------|---------|
| `productId` | string | `prod_trece_01` |

**Response 200** (full `CatalogProduct` with variants & flash sale info):
```json
{
  "productId": "prod_trece_01",
  "slug": "remera-oversize",
  "title": "Remera Oversize",
  "description": "Remera 100% algodón, fit oversize",
  "price": 150000,
  "discountPrice": null,
  "images": [
    {
      "url": "https://api.example.com/uploads/prod_trece_01_1.jpg",
      "alt": "Front view",
      "cutVariant": "FEMENINO"
    },
    {
      "url": "https://api.example.com/uploads/prod_trece_01_2.jpg",
      "alt": "Back view",
      "cutVariant": "FEMENINO"
    }
  ],
  "variants": [
    {
      "variantId": "var_001",
      "sku": "REMERA-001-FEM-M",
      "cut": "FEMENINO",
      "size": "M",
      "price": 150000,
      "stock": 25
    },
    {
      "variantId": "var_002",
      "sku": "REMERA-001-FEM-L",
      "cut": "FEMENINO",
      "size": "L",
      "price": 150000,
      "stock": 18
    }
  ],
  "flashSale": null,
  "category": "remeras",
  "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
  "stockStatus": "IN_STOCK",
  "cuts": ["FEMENINO", "MASCULINO"],
  "rating": 4.5,
  "reviewCount": 12
}
```

**Error Response 404**:
```json
{
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```

---

### Authentication (Customer)

#### POST `/api/auth/register`
**Purpose**: Register a new customer account.

**Request Body**:
```json
{
  "email": "customer@example.com",
  "password": "SecurePassword123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "referralCode": "FRIEND123"
}
```

**Response 201** (token issued):
```json
{
  "userId": "user_abc123",
  "email": "customer@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

**Error Response 400**:
```json
{
  "error": "Email already registered",
  "code": "EMAIL_EXISTS"
}
```

---

#### POST `/api/auth/login`
**Purpose**: Log in a customer and receive JWT.

**Request Body**:
```json
{
  "email": "customer@example.com",
  "password": "SecurePassword123!"
}
```

**Response 200** (token issued):
```json
{
  "userId": "user_abc123",
  "email": "customer@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

**Error Response 401**:
```json
{
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

---

#### POST `/api/auth/forgot-password`
**Purpose**: Request password reset via email.

**Request Body**:
```json
{
  "email": "customer@example.com"
}
```

**Response 200**:
```json
{
  "message": "Password reset email sent",
  "resetTokenExpiry": 3600
}
```

---

#### POST `/api/auth/reset-password`
**Purpose**: Reset password with token from email.

**Query Parameters**:
| Param | Type | Notes |
|-------|------|-------|
| `token` | string | JWT from email link |
| `nonce` | string | One-time nonce from email |

**Request Body**:
```json
{
  "newPassword": "NewSecurePassword123!"
}
```

**Response 200**:
```json
{
  "message": "Password reset successful"
}
```

---

#### GET `/api/me` (requires JWT)
**Purpose**: Get current customer profile.

**Headers**:
```
Authorization: Bearer <token>
```

**Response 200**:
```json
{
  "userId": "user_abc123",
  "email": "customer@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+595981234567",
  "address": "Calle Principal 123, Ciudad del Este",
  "city": "Ciudad del Este",
  "state": "Alto Paraná",
  "zipCode": "3500",
  "country": "Paraguay",
  "createdAt": "2026-01-15T10:00:00.000Z",
  "isVIP": false,
  "isUnsubscribed": false
}
```

---

#### PATCH `/api/me` (requires JWT)
**Purpose**: Update customer profile.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body** (all fields optional):
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+595981234567",
  "address": "Nueva Calle 456",
  "city": "Ciudad del Este",
  "state": "Alto Paraná",
  "zipCode": "3500"
}
```

**Response 200**:
```json
{
  "userId": "user_abc123",
  "email": "customer@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+595981234567",
  "address": "Nueva Calle 456",
  "city": "Ciudad del Este",
  "state": "Alto Paraná",
  "zipCode": "3500",
  "country": "Paraguay"
}
```

---

#### POST `/api/me/password` (requires JWT)
**Purpose**: Change password (authenticated user).

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response 200**:
```json
{
  "message": "Password changed successfully"
}
```

---

### Checkout (Public)

#### POST `/api/checkout`
**Purpose**: Create an order atomically with stock soft-lock.

**Request Body**:
```json
{
  "items": [
    {
      "variantId": "var_001",
      "quantity": 2
    }
  ],
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "customer@example.com",
  "phone": "+595981234567",
  "address": "Calle Principal 123",
  "city": "Ciudad del Este",
  "state": "Alto Paraná",
  "zipCode": "3500",
  "country": "Paraguay",
  "benefitId": null,
  "referralCode": "FRIEND123"
}
```

**Response 201** (order created):
```json
{
  "orderId": "order_xyz789",
  "orderNumber": "ORD-2026-001",
  "status": "Pendiente de Pago",
  "subtotal": 300000,
  "tax": 0,
  "shipping": 50000,
  "discount": 0,
  "total": 350000,
  "items": [
    {
      "variantId": "var_001",
      "productName": "Remera Oversize",
      "quantity": 2,
      "unitPrice": 150000,
      "subtotal": 300000
    }
  ],
  "createdAt": "2026-07-18T12:00:00.000Z",
  "guestAutoLoginToken": "eyJhbGc..."
}
```

**Error Response 400** (insufficient stock):
```json
{
  "error": "Insufficient stock for variant",
  "code": "INSUFFICIENT_STOCK",
  "variantId": "var_001",
  "availableStock": 5,
  "requestedQuantity": 10
}
```

---

#### GET `/api/checkout/:orderId` (public, 10-min auto-login window)
**Purpose**: Look up order after checkout (before email confirmation).

**Path Parameters**:
| Param | Type | Example |
|-------|------|---------|
| `orderId` | string | `order_xyz789` |

**Response 200**:
```json
{
  "orderId": "order_xyz789",
  "orderNumber": "ORD-2026-001",
  "status": "Pendiente de Pago",
  "subtotal": 300000,
  "tax": 0,
  "shipping": 50000,
  "discount": 0,
  "total": 350000,
  "items": [
    {
      "variantId": "var_001",
      "productName": "Remera Oversize",
      "quantity": 2,
      "unitPrice": 150000,
      "subtotal": 300000
    }
  ],
  "createdAt": "2026-07-18T12:00:00.000Z",
  "paymentRef": null
}
```

---

### Customer Orders (requires JWT)

#### GET `/api/me/orders`
**Purpose**: List customer's orders.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | number | 1 | Pagination |
| `limit` | number | 20 | Items per page |
| `status` | string | — | Filter: `Pagado`, `Pendiente`, etc. |

**Response 200**:
```json
{
  "items": [
    {
      "orderId": "order_xyz789",
      "orderNumber": "ORD-2026-001",
      "status": "Pagado",
      "total": 350000,
      "itemCount": 2,
      "createdAt": "2026-07-18T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

#### GET `/api/me/orders/:orderId`
**Purpose**: Get full order detail.

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
| Param | Type | Example |
|-------|------|---------|
| `orderId` | string | `order_xyz789` |

**Response 200**:
```json
{
  "orderId": "order_xyz789",
  "orderNumber": "ORD-2026-001",
  "status": "Pagado",
  "subtotal": 300000,
  "tax": 0,
  "shipping": 50000,
  "discount": 0,
  "total": 350000,
  "items": [
    {
      "variantId": "var_001",
      "productName": "Remera Oversize",
      "sku": "REMERA-001-FEM-M",
      "quantity": 2,
      "unitPrice": 150000,
      "subtotal": 300000
    }
  ],
  "customer": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "customer@example.com",
    "phone": "+595981234567",
    "address": "Calle Principal 123",
    "city": "Ciudad del Este"
  },
  "createdAt": "2026-07-18T12:00:00.000Z",
  "paidAt": "2026-07-18T13:30:00.000Z",
  "notes": "Entrega en sucursal"
}
```

---

### Support Tickets (requires JWT)

#### POST `/api/me/tickets`
**Purpose**: Create a support ticket.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "subject": "Order not arrived",
  "message": "I haven't received my order ORD-2026-001",
  "orderId": "order_xyz789"
}
```

**Response 201**:
```json
{
  "ticketId": "ticket_abc123",
  "ticketNumber": "TKT-2026-0001",
  "subject": "Order not arrived",
  "status": "Abierto",
  "createdAt": "2026-07-18T14:00:00.000Z"
}
```

---

#### GET `/api/me/tickets`
**Purpose**: List customer's support tickets.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | number | 1 | Pagination |
| `limit` | number | 20 | Items per page |
| `status` | string | — | Filter: `Abierto`, `Resuelto`, etc. |

**Response 200**:
```json
{
  "items": [
    {
      "ticketId": "ticket_abc123",
      "ticketNumber": "TKT-2026-0001",
      "subject": "Order not arrived",
      "status": "Abierto",
      "lastReplyAt": "2026-07-18T15:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

#### GET `/api/me/tickets/:ticketId`
**Purpose**: Get full ticket thread.

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
| Param | Type | Example |
|-------|------|---------|
| `ticketId` | string | `ticket_abc123` |

**Response 200**:
```json
{
  "ticketId": "ticket_abc123",
  "ticketNumber": "TKT-2026-0001",
  "subject": "Order not arrived",
  "status": "Abierto",
  "messages": [
    {
      "messageId": "msg_001",
      "sender": "customer",
      "message": "I haven't received my order ORD-2026-001",
      "createdAt": "2026-07-18T14:00:00.000Z"
    },
    {
      "messageId": "msg_002",
      "sender": "support",
      "message": "We are investigating your order. Please provide tracking info.",
      "createdAt": "2026-07-18T15:30:00.000Z"
    }
  ],
  "createdAt": "2026-07-18T14:00:00.000Z"
}
```

---

#### POST `/api/me/tickets/:ticketId/messages`
**Purpose**: Reply to a support ticket.

**Headers**:
```
Authorization: Bearer <token>
```

**Path Parameters**:
| Param | Type | Example |
|-------|------|---------|
| `ticketId` | string | `ticket_abc123` |

**Request Body**:
```json
{
  "message": "The tracking number is: ABC123XYZ"
}
```

**Response 201**:
```json
{
  "messageId": "msg_003",
  "sender": "customer",
  "message": "The tracking number is: ABC123XYZ",
  "createdAt": "2026-07-18T16:00:00.000Z"
}
```

---

### Unsubscribe (Public)

#### GET `/api/unsubscribe`
**Purpose**: One-click unsubscribe from email campaigns (returns HTML page).

**Query Parameters**:
| Param | Type | Notes |
|-------|------|-------|
| `token` | string | Signed JWT token from email link |

**Response 200** (HTML page):
```html
<!DOCTYPE html>
<html>
<head><title>Unsubscribe</title></head>
<body>
<h1>You have been unsubscribed</h1>
<p>You will no longer receive marketing emails from TRECE13.</p>
</body>
</html>
```

---

## Frontend Module Breakdown

### Catalog Module (`(catalog)/`)

**Purpose**: Display product listing and detail pages.

**Key Components**:
- `ProductCard.tsx`: Individual product card with image, title, price, "Add to cart" button.
- `ProductGrid.tsx`: Grid layout of products; responsive (1-4 columns).
- `FilterBar.tsx`: Cut and category filter dropdowns.
- `ProductDetail.tsx`: Full detail page with images, variants, size selector, quantity picker, "Add to cart" button.

**Key Hooks**:
- `useFetch()`: Load product list and detail from API.
- `useCart()`: Add product to cart.

**State Flow**:
```
1. User navigates to /catalog
2. ProductGrid loads GET /api/catalog?cut=FEMENINO
3. User clicks product → ProductDetail page
4. ProductDetail loads GET /api/catalog/:productId
5. User selects variant + quantity → useCart().addItem(variant, qty)
6. Cart stored in Zustand
```

---

### Auth Module (`(auth)/`)

**Purpose**: Register, login, password reset flows.

**Key Components**:
- `RegisterForm.tsx`: Email, password, name inputs; calls POST `/api/auth/register`.
- `LoginForm.tsx`: Email, password inputs; calls POST `/api/auth/login`; stores JWT in localStorage.
- `ForgotPasswordForm.tsx`: Email input; calls POST `/api/auth/forgot-password`.
- `ResetPasswordForm.tsx`: New password input; calls POST `/api/auth/reset-password?token=...&nonce=...`.
- `ProtectedRoute.tsx`: Wrapper for customer-only routes; redirects to login if no JWT.

**Key Hooks**:
- `useAuth()`: JWT state, login/logout, user data.

**State Flow**:
```
1. User navigates to /auth/register
2. RegisterForm validates email + password (react-hook-form + zod)
3. On submit → POST /api/auth/register → JWT received
4. JWT stored in localStorage + Zustand auth state
5. User redirected to /customer/dashboard
```

---

### Checkout Module (`checkout/`)

**Purpose**: Shopping cart and order creation.

**Key Components**:
- `Cart.tsx`: Drawer/modal showing cart items, quantities, remove buttons, total.
- `CartItem.tsx`: Single cart item with qty input, remove button.
- `CheckoutForm.tsx`: Customer info form (name, email, address, etc.); calls POST `/api/checkout`.
- `OrderSummary.tsx`: Order total breakdown (subtotal, shipping, tax, discount).
- `ReceiptUpload.tsx`: File upload for payment proof (MinIO bucket).

**Key Hooks**:
- `useCart()`: Cart items, add/remove, total calculation.
- `useFetch()`: Submit checkout form.

**State Flow**:
```
1. User adds items to cart → Zustand cart state
2. User navigates to /checkout
3. CheckoutForm displays cart items + customer form
4. User enters address, name, etc.
5. On submit → POST /api/checkout → Order created
6. Order receipt page shows order detail + payment proof upload
7. JWT auto-login token provided for guest customers
```

---

### Customer Module (`(customer)/`)

**Purpose**: Dashboard, order history, profile, support tickets.

**Key Components**:
- `OrderCard.tsx`: Card showing order summary, status, date.
- `OrderDetail.tsx`: Full order detail (items, address, status, timeline).
- `TicketForm.tsx`: Form to create new support ticket.
- `TicketThread.tsx`: Ticket conversation thread (messages, replies).
- `ProfileForm.tsx`: Profile edit form (name, address, email, password change).

**Key Hooks**:
- `useAuth()`: User data, logout.
- `useFetch()`: Load orders, tickets, profile.

**Protected Routes**:
All routes in `(customer)/` require JWT. Wrapped with `ProtectedRoute` component.

---

## Authentication & JWT Flow

### JWT Storage

JWTs are stored in **localStorage** under the key `trece13_auth_token` (configurable via `NEXT_PUBLIC_JWT_STORAGE_KEY`).

**Token Format**:
```
Header.Payload.Signature (HS256)
```

**Payload** (decoded):
```json
{
  "userId": "user_abc123",
  "email": "customer@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "customer",
  "iat": 1689699600,
  "exp": 1689786000
}
```

### Auth Hook (`useAuth.ts`)

Centralized auth state management using Zustand:

```typescript
import { create } from 'zustand';
import { parseJWT } from '@/lib/auth';

interface AuthState {
  token: string | null;
  user: any | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
  syncFromStorage: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,

  login: (token: string) => {
    localStorage.setItem('trece13_auth_token', token);
    const user = parseJWT(token);
    set({ token, user, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem('trece13_auth_token');
    set({ token: null, user: null, isLoggedIn: false });
  },

  syncFromStorage: () => {
    const token = localStorage.getItem('trece13_auth_token');
    if (token) {
      const user = parseJWT(token);
      set({ token, user, isLoggedIn: true });
    }
  },
}));
```

### Sending JWT in Requests

All authenticated requests include the `Authorization` header:

```typescript
// lib/api.ts
export async function apiCall(
  method: string,
  path: string,
  body?: any,
  requireAuth: boolean = false
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = localStorage.getItem('trece13_auth_token');
    if (!token) {
      throw new Error('Unauthorized: no JWT found');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${config.api.baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.message}`);
  }

  return response.json();
}
```

### Protected Routes

Wrap customer-only pages with `ProtectedRoute` component:

```typescript
// app/(customer)/dashboard/page.tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/components/customer/Dashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

---

## State Management

### Zustand Stores

**1. Auth Store** (`hooks/useAuth.ts`)
- Manages JWT token, user data, login/logout.
- Syncs with localStorage on app load.

**2. Cart Store** (`hooks/useCart.ts`)
- Manages cart items (variant, quantity, price).
- Calculates totals.
- Persists to localStorage (optional).

### Example Cart Store

```typescript
import { create } from 'zustand';

interface CartItem {
  variantId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.variantId === item.variantId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  removeItem: (variantId) =>
    set((state) => ({
      items: state.items.filter((i) => i.variantId !== variantId),
    })),

  updateQuantity: (variantId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i
      ),
    })),

  clear: () => set({ items: [] }),

  total: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },
}));
```

---

## API Integration Patterns

### Fetch Hook

Create a reusable `useFetch()` hook for data loading:

```typescript
// hooks/useFetch.ts
import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetch<T>(
  method: string,
  path: string,
  requireAuth: boolean = false
): UseFetchState<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiCall(method, path, undefined, requireAuth);
        setState({ data, loading: false, error: null });
      } catch (err) {
        setState({ data: null, loading: false, error: err as Error });
      }
    };

    load();
  }, [method, path, requireAuth]);

  return state;
}
```

### Calling an Endpoint

```typescript
// components/catalog/ProductGrid.tsx
import { useFetch } from '@/hooks/useFetch';

export default function ProductGrid() {
  const { data: products, loading, error } = useFetch<Product[]>(
    'GET',
    '/catalog'
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid grid-cols-4 gap-4">
      {products?.map((product) => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  );
}
```

---

## Docker Compose Configuration

### `compose.yml` (Production-Ready)

```yaml
services:
  frontend:
    container_name: trece13-storefront
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-https://api.trece13.com/api}
      NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:-https://trece13.com}
      NEXT_PUBLIC_HEALTH_URL: ${NEXT_PUBLIC_HEALTH_URL:-https://api.trece13.com/health}
      NEXT_PUBLIC_ENV: ${NEXT_PUBLIC_ENV:-production}
      NEXT_PUBLIC_LOG_LEVEL: ${NEXT_PUBLIC_LOG_LEVEL:-warn}
    ports:
      - "${PORT:-3000}:3000"
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### `Dockerfile`

```dockerfile
# Multi-stage build for supply-chain security

FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy lockfile first (cache layer)
COPY pnpm-lock.yaml ./

# Install dependencies (exact versions from lockfile)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js app
RUN pnpm build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy lockfile and dependencies from builder
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start app
CMD ["pnpm", "start"]
```

### Using Docker Compose

```bash
# Build image
docker compose build

# Start container
docker compose up -d

# View logs
docker compose logs -f frontend

# Stop container
docker compose down

# With custom port
PORT=8080 docker compose up -d

# With env file
docker compose --env-file .env.production up -d
```

---

## Development Workflow

### Daily Development

```bash
# Start dev server (hot reload)
pnpm dev

# Navigate to http://localhost:3000

# In another terminal, watch for type errors
pnpm type-check --watch

# Or run linter in watch mode
pnpm lint -- --fix
```

### Before Committing

```bash
# Lint and format
pnpm lint --fix
pnpm format

# Type-check
pnpm type-check

# Audit dependencies
pnpm audit

# Build locally to catch errors
pnpm build

# Test build locally
pnpm start
```

### Branching Strategy

```bash
# Feature branch
git checkout -b feat/add-product-detail

# Commit with conventional commits
git commit -m "feat: add product detail page"

# Push and open PR
git push origin feat/add-product-detail
```

---

## AI-Assisted Development Tips

### Structure for Claude

When asking Claude for help, provide context in this order:

```
1. **What you're building** (component name, feature)
2. **Current state** (code snippet or error)
3. **What you want** (expected behavior)
4. **Constraints** (env vars, API schema, etc.)
```

**Example prompt**:
```
I'm building a ProductCard component in components/catalog/ProductCard.tsx.
It should display a product from the catalog API response.
The component should show: image, title, price, and an "Add to Cart" button.
Use the useCart hook to add items. The product type is CatalogProduct from types/api.ts.
Can you help me build this component?
```

### TypeScript for AI Context

Always include type definitions. Claude uses types to generate correct code:

```typescript
// types/api.ts
export interface CatalogProduct {
  productId: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  discountPrice: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

// Then use in components
import type { CatalogProduct } from '@/types/api';
```

### Asking for API Integration

When integrating a new endpoint, show Claude:
1. The API response schema (from this doc)
2. Where you want to use it (component name)
3. The expected UI behavior

**Example**:
```
Can you help me fetch the product details?
Endpoint: GET /api/catalog/:productId
Expected response: CatalogProduct (see types/api.ts)
Usage: ProductDetail component should load and display this data
I want the component to show loading spinner while fetching.
```

### Leveraging AI for Debugging

When debugging, give Claude:
1. Error message (full stack trace)
2. The code causing the issue (paste relevant function)
3. What you were trying to do

**Example**:
```
I'm getting this error:
TypeError: Cannot read property 'productId' of undefined

In ProductCard.tsx at line 15:
console.log(product.productId)

I'm calling it like: <ProductCard product={item} />
But item is coming from useFetch hook.
```

---

## Quick Reference

### Key File Locations

| File | Purpose |
|------|---------|
| `src/lib/config.ts` | Environment config validation |
| `src/lib/api.ts` | HTTP client with JWT |
| `src/lib/auth.ts` | JWT parsing & storage |
| `src/hooks/useAuth.ts` | Auth state management |
| `src/hooks/useCart.ts` | Cart state management |
| `src/types/api.ts` | API response types |
| `.env.local` | Local environment vars |
| `compose.yml` | Docker Compose config |

### Common Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run linter
pnpm format           # Format code
pnpm type-check       # Check types
pnpm audit            # Audit dependencies
pnpm add pkg          # Install dependency
pnpm remove pkg       # Remove dependency
```

### Environment Variable Checklist

Before deploying:
- [ ] `NEXT_PUBLIC_API_URL` set to correct backend URL
- [ ] `NEXT_PUBLIC_APP_URL` set to storefront URL
- [ ] `NEXT_PUBLIC_ENV` set to environment (dev/staging/prod)
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.production` is encrypted (if committed)
- [ ] All dependencies audited (`pnpm audit`)
- [ ] Lockfile committed (`pnpm-lock.yaml`)

---

## Appendix: API Response Examples

See **Public API Endpoints** section (above) for full documentation of all endpoints.

**Quick Index**:
- **Catalog**: GET `/api/catalog`, GET `/api/catalog/cuts`, GET `/api/catalog/:productId`
- **Auth**: POST `/api/auth/register`, POST `/api/auth/login`, POST `/api/auth/forgot-password`, POST `/api/auth/reset-password`
- **Customer**: GET `/api/me`, PATCH `/api/me`, POST `/api/me/password`
- **Checkout**: POST `/api/checkout`, GET `/api/checkout/:orderId`
- **Orders**: GET `/api/me/orders`, GET `/api/me/orders/:orderId`
- **Support**: POST `/api/me/tickets`, GET `/api/me/tickets`, GET `/api/me/tickets/:ticketId`, POST `/api/me/tickets/:ticketId/messages`
- **Unsubscribe**: GET `/api/unsubscribe?token=...`

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-19  
**Maintained By**: Tech Lead  
**For Questions**: Refer to backend documentation or ask your tech lead.

---

*This document is designed for a junior frontend developer with AI assistance (Claude). All code examples follow supply-chain security best practices, use environment-based configuration, and integrate seamlessly with the TRECE13 backend API.*
