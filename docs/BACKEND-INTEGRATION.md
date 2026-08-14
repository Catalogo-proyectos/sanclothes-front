# Plan de Implementación — Integración Storefront ↔ API Santclothes

> **Front**: `sanclothes-front` (Next.js 16, App Router, React 19, Zustand, Tailwind 4)
> **Back**: `santclothesback/backend` (Fastify + Drizzle + PostgreSQL + Redis + MinIO), puerto `5014`
> **Base**: `docs/STOREFRONT-INTEGRATION.md` del backend, **verificado línea por línea contra el código fuente real**.

---

## 0. Estado actual y objetivo

### Dónde está el front hoy

| Área | Estado |
|:--|:--|
| Cliente HTTP | `src/lib/api.ts` — `apiCall()` con router de mocks integrado |
| Modo actual | `NEXT_PUBLIC_USE_MOCK=true` → **todo el front corre contra `src/mocks/`**, nunca tocó el backend |
| Base URL configurada | `http://localhost:3001/api` → **incorrecta**, el backend escucha en `5014` |
| Tipos | `src/types/api.ts` — modelo heredado de la spec TRECE13, **no coincide con el backend real** |
| Estado | `useAuth` (Zustand, JWT en localStorage), `useCart` (Zustand + persist), `useCatalogFilter` |
| Consumo real de API | Solo 5 puntos: `products/[productId]/page.tsx`, `LoginForm`, `CheckoutForm`, `Dashboard`, `useFetch` |

**La buena noticia**: la superficie de contacto con la API es muy chica (5 archivos). Todo el resto del front (heroes, grids, carruseles, lookbook) consume `CatalogProduct` a través de props. Por eso la estrategia es **adaptadores**, no reescritura de componentes.

### Objetivo

Reemplazar la capa de mocks por el backend real, con una **capa de adaptación** que traduzca el modelo del backend al modelo que ya consumen los componentes, y sumar los flujos que hoy no existen: OTP de invitado, comprobante de pago, carrito persistido, tiers, reseñas, waitlist, pixel.

---

## 1. ⚠️ Discrepancias verificadas entre el doc del backend y el código real

**Esta es la sección más importante del documento.** `STOREFRONT-INTEGRATION.md` describe un contrato que en varios puntos **no es el que implementa el backend**. Si se programa contra el doc, el front rompe en runtime. Todo lo de abajo está verificado contra el fuente.

### 1.1 Formato de error — hay DOS, no uno

El doc afirma que *toda* respuesta de error usa `{ error, code }`. Falso.

| Módulo | Formato real |
|:--|:--|
| `catalog`, `checkout`, `cart`, `tiers`, `reviews`, `waitlist`, `settings` | `{ "error": "...", "code": "..." }` |
| **`auth` completo** (`/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/me`, `/me/*`) | `{ "statusCode": 401, "error": "Unauthorized", "message": "..." }` |

En el segundo formato, `error` es el nombre HTTP (`"Unauthorized"`), **no** el mensaje legible, y **no hay campo `code`**. El parser de errores del front tiene que soportar ambos o los mensajes de login saldrán como `"Unauthorized"`.
Fuente: `modules/auth/auth.routes.ts:41-46,54-59` vs `modules/catalog/catalog.routes.ts:83-87`.

### 1.2 Catálogo — el modelo de producto es completamente distinto

El doc muestra un producto plano con `variants` como **array**. El backend devuelve `variants` como **mapa anidado corte → talle**.

```jsonc
// LO QUE REALMENTE DEVUELVE GET /api/catalog  (fuente: catalog.service.ts:129-159)
{
  "productId": "prod_abc",
  "slug": "remera-oversized-black",
  "name": "Remera Oversized Black",
  "category": "HOMBRE",
  "dropType": "DROP_01",
  "price": 180000,                       // ⚠️ NO "basePrice"
  "isDropActive": true,
  "images": ["https://..."],             // ⚠️ array de STRINGS, no de objetos {url, alt}
  "imagesByCut": { "OVERSIZED": ["https://..."] },
  "variants":      { "OVERSIZED": { "M": { "sku": "TSH-BLK-M-OV", "stock": 3 } } },
  "variantsByCut": { "OVERSIZED": { "M": { "sku": "TSH-BLK-M-OV", "stock": 3 } } },
  "availableCuts": ["CLASSIC", "OVERSIZED"],
  "discountPercent": 0,
  "quantityDiscounts": [{ "minQty": 3, "discountType": "PERCENTAGE", "discountValue": 10 }],
  "tags": ["drop", "heavyweight"],
  "isLimitedDrop": false,
  "purchaseType": "VENTA_DIRECTA",
  "badge": "NUEVO",
  "primaryActionLabel": "COMPRAR AHORA",
  "secondaryActionLabel": "AGREGAR A BOLSA",
  "successMessage": "AGREGADO ✓",
  "shippingEstimated": "3 a 5 días hábiles",
  "flashSale": { "discountType": "PERCENTAGE", "discountValue": 20, "overridePrice": null,
                 "startAt": "...", "endAt": "..." },
  "isCombo": false,
  "comboItems": [],                      // solo si isCombo === true
  "showHypeCountdown": false,
  "publishAt": null,
  "unpublishAt": null
}
```

Campos que **el doc promete y no existen**:

| Campo del doc | Realidad |
|:--|:--|
| `id` | es `productId` |
| `basePrice` | es `price` |
| `description` | **no viene en el catálogo**. Existe en la tabla `products` pero `catalog.service.ts` no lo mapea a Redis |
| `isFeatured` | **no existe en el payload** (ver 1.3) |
| `variants[].color` | no existe; el mapa solo guarda `{ sku, stock }` |
| `variants[].urgencyLabel` | **no existe**. La regla "¡Quedan X unidades!" hay que calcularla en el front desde `stock` |
| `rating` / `reviewCount` | no vienen; se piden aparte a `/api/catalog/:id/reviews` |

### 1.3 🐛 Filtros rotos en el backend: `priceMin`, `priceMax`, `isFeatured`

`catalog.routes.ts:47-66` filtra por `p.basePrice` y `p.isFeatured`, pero el objeto que sale de Redis expone `price` y **no tiene `isFeatured`**. Consecuencia:

- `GET /api/catalog?priceMin=100000` → **devuelve `[]` siempre** (`undefined >= 100000` es `false`).
- `GET /api/catalog?isFeatured=true` → **devuelve `[]` siempre**.
- `sort=bestsellers` → no está implementado (solo `price_asc`, `price_desc`, `newest`).
- `page` / `limit` → **se ignoran por completo**; el endpoint siempre devuelve el array entero.

**Impacto directo: el Bento Grid de la sección 4 del doc no puede funcionar hoy.** Ver §9 (TODOs de backend) y §5.1 (workaround en el front).

### 1.4 Paginación: no existe en el storefront

El doc documenta `{ data, pagination: { page, limit, total, totalPages } }`. **Ningún endpoint público la devuelve.** `/api/catalog` y `/api/me/orders` devuelven arrays desnudos. No programar paginación server-side contra estos endpoints.

### 1.5 Auth — todos los contratos difieren

| Endpoint | Doc | Real (`modules/auth/auth.routes.ts`) |
|:--|:--|:--|
| `POST /auth/register` body | `{ email, password, fullName, phone }` | `{ firstName, lastName, email, password, phone? }` — `firstName` y `lastName` **obligatorios y separados**; password ≥ 8 |
| `POST /auth/register` 201 | `{ user: { …, isMember }, token }` | `{ success, message, token, user: { id, firstName, lastName, email, role } }` |
| `POST /auth/register` conflicto | no documentado | **409** `{ statusCode, error:"Conflict", message, isGuestAccount: boolean }` — `isGuestAccount:true` cuando el mail ya existe por un checkout de invitado. **Usar para mostrar “ya tenés cuenta, recuperá tu contraseña”.** |
| `POST /auth/login` 200 | `user.fullName` | `user: { id, firstName, lastName, email, role }` — **no hay `fullName`** |
| `POST /auth/login` 401 | `{ error, code:"INVALID_CREDENTIALS" }` | `{ statusCode:401, error:"Unauthorized", message:"Credenciales de acceso incorrectas." }` — **sin `code`** |
| `POST /auth/google` 200 | `{ token, isNewUser, user }` | `{ token, user: { id, firstName, lastName, email, avatarUrl, role } }` — **`isNewUser` NO EXISTE**. Todo el flujo de bienvenida descrito en el doc (§2.3) no es implementable tal cual |
| `POST /auth/google` sin config | no documentado | **503** `{ error, code:"GOOGLE_NOT_CONFIGURED" }` si falta `GOOGLE_CLIENT_ID` en el back |
| `POST /auth/reset-password` body | `{ token, newPassword }` | `{ token, password }` — **el campo se llama `password`** |
| Expiración JWT | no documentado | login/register: **24h**; Google: **30d**; reset: 1h; checkout session: 30m; orderAccessToken: 60m |

**Ruta de reset**: el mail de recuperación apunta a `${STOREFRONT_URL}/restablecer-contrasena?token=...` (`auth.routes.ts:536`). **El front tiene que crear esa ruta** o el link del mail cae en 404.

**Rate limits reales**: `/auth/login` 5/min · `/auth/forgot-password` 3/min · `/checkout/verify-email` 3/hora · global 100/min.

### 1.6 Checkout — el doc no publica el body y el real es muy estricto

```jsonc
// POST /api/checkout — body real (checkout.schema.ts)
{
  "items": [
    { "sku": "TSH-BLK-M-OV", "productId": "prod_abc", "size": "M", "qty": 1, "unitPrice": 180000 }
  ],
  "customer": { "email": "...", "fullName": "Juan Pérez", "phone": "0981123456" },
  "shipping": {
    "address":    "Av. España 1234 c/ Brasil",   // mínimo 10 caracteres
    "locality":   "Asunción",
    "province":   "Central",
    "postalCode": "1429"                          // regex ^[a-zA-Z0-9]{4,8}$
  },
  "wantsClubMembership": true,                    // ⚠️ OBLIGATORIO (boolean)
  "couponCode": "WELCOME10",                      // opcional
  "requestsInvoice": false,                       // opcional
  "invoiceData": { "ruc": "...", "razonSocial": "...", "direccionFiscal": "..." }
}
```

Respuesta **201**: `{ orderId: 102, status: "Pedido Pendiente de Confirmación", expiresAt: "...", message: "...", orderAccessToken: "..." }`
(el doc solo menciona `orderId` y `orderAccessToken`; `expiresAt` es clave para el contador de reserva).

Notas críticas:
- **El `unitPrice` que manda el front se ignora**: el backend lo recalcula desde la DB aplicando flash sale, `quantityDiscounts` y `discountPercent` (`checkout.service.ts:107-170`). Igual es obligatorio y debe ser entero > 0.
- Teléfono: acepta `+595…`, `595…`, `0981…`, `981…` o fijo. Se normaliza quitando espacios/guiones.
- **Límite de 3 unidades** en órdenes pendientes por usuario → `429 TOO_MANY_PENDING_RESERVATIONS`.
- **Cooldown**: si una reserva previa venció, el email queda bloqueado → `429 RESERVATION_COOLDOWN_ACTIVE` con `minutesLeft`.

### 1.7 Cupones: NO se acumulan con el tier

El doc (§9) dice que el cupón se calcula sobre el subtotal restante después del descuento de rango. El código hace lo contrario:

```ts
// checkout.service.ts:251
const finalDiscount = Math.max(tierDiscountAmount, couponDiscountAmount);
```

**Se aplica el mayor de los dos, nunca los dos.** La UI del checkout tiene que comunicar eso ("se aplica el mejor descuento disponible"), no sumarlos.

### 1.8 Carrito de invitado: requiere email verificado

El doc (§6.1) sugiere `POST /api/v1/cart` con `{ sku, qty, cut }`. Real (`cart.routes.ts`):

- Requiere header **`x-guest-email`** (o `email` en query/body). Sin eso → `401 UNVERIFIED_GUEST`.
- El body es `{ items: [...] }` y **reemplaza el carrito completo** (no agrega un item).
- Lo mismo para `/api/v1/me/cart` (JWT): GET → `{ items }`, POST `{ items }` → reemplazo total.
- TTL: 7 días en Redis.

### 1.9 🐛 La "migración automática de carrito al login" no está conectada

El doc (§6.2) afirma que `POST /api/auth/login` fusiona el carrito de invitado. La función `migrateGuestCartToUser()` existe en `cart.routes.ts:118` pero **no se llama desde ningún lado** (verificado con grep en todo el backend). **El merge hay que hacerlo en el front** (§5.2) o pedir el fix al back (§9).

### 1.10 Tiers y Settings

**`GET /api/v1/me/tier`** — real: `{ currentTier: { id, name, discountPercentage, earlyAccessHours } | null, totalSpent, progressPercentage, centsToNextTier, nextTier: { id, name, minSpentCents, … } | null }`.
No existen `badgeColor`, `benefits[]` ni `minSpentRequired`. Los beneficios hay que armarlos en el front desde `discountPercentage` y `earlyAccessHours`.

**`GET /api/v1/settings`** — devuelve un **array** de filas `{ id, key, value, description }`, no un objeto. El snippet del doc (`settings.meta_pixel_id`) no funciona:

```ts
const rows = await res.json();
const pixelId = rows.find((r: any) => r.key === 'meta_pixel_id')?.value;
```

### 1.11 Reseñas

`POST /api/catalog/:productId/reviews` crea la reseña con `status: 'pending'`. **No aparece en el GET hasta que un admin la aprueba.** La UI debe decir "tu reseña será publicada tras moderación", no insertarla optimistamente en la lista.

### 1.12 `x-branch-id`

Solo lo usan rutas de admin/staff. **El storefront nunca lo manda.**

---

## 2. Configuración

### 2.1 `.env.local` (front)

```bash
# ===== BACKEND API =====
NEXT_PUBLIC_API_URL=http://localhost:5014/api        # ⚠️ antes 3001 → el back escucha en 5014
NEXT_PUBLIC_HEALTH_URL=http://localhost:5014/health  # /health NO cuelga de /api

# ===== MOCKS =====
NEXT_PUBLIC_USE_MOCK=false                            # el switch principal de esta migración

# ===== FRONTEND =====
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENV=development

# ===== SESIÓN =====
NEXT_PUBLIC_JWT_STORAGE_KEY=sant_auth_token
NEXT_PUBLIC_GOOGLE_CLIENT_ID=                         # mismo client id que GOOGLE_CLIENT_ID del back
```

Producción: `https://api.santclothes.com.py`. El CORS del back ya permite `localhost:3000`, `santclothes.com.py` y `www.santclothes.com.py` (`app.ts:64-81`).

### 2.2 `next.config.ts` — imágenes remotas

Las fotos del catálogo llegan como URLs absolutas (`cdn.trecepy.com`, o `localhost:5014/uploads/...` en dev). Hay que habilitarlas o `next/image` tira error:

```ts
remotePatterns: [
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: 'cdn.trecepy.com' },
  { protocol: 'https', hostname: 'api.santclothes.com.py' },
  { protocol: 'http',  hostname: 'localhost', port: '5014' },
],
```

### 2.3 `src/lib/config.ts`

Agregar el flag de Google y ajustar defaults:

```ts
api: {
  baseUrl:  env.NEXT_PUBLIC_API_URL    || 'http://localhost:5014/api',
  healthUrl:env.NEXT_PUBLIC_HEALTH_URL || 'http://localhost:5014/health',
  useMock:  env.NEXT_PUBLIC_USE_MOCK === 'true',   // ⚠️ hoy `undefined` cae en mock; invertir el default
},
auth: {
  googleClientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
},
```

> El default actual (`|| undefined → mock`) hace que un deploy sin la variable sirva mocks en producción. Invertirlo es parte del trabajo.

### 2.4 Levantar el backend

```powershell
cd C:\Users\julio\Herd\santclothesback
docker compose up -d          # postgres:5010, redis:5011, minio:5012/5013, api:5014, admin:5015
```

El catálogo **se sirve desde Redis**, no desde Postgres. Si Redis está vacío, `GET /api/catalog` devuelve `[]` sin error. Hay que correr el sync del admin (guardar cualquier producto dispara `syncCatalogToRedis()`) o el seed antes de probar el front.

---

## 3. Capa de red: reemplazar `src/lib/api.ts`

El `apiCall` actual no sirve para el backend real: no soporta query params, ni FormData, ni tokens distintos del JWT de usuario (checkout session, order access), ni el segundo formato de error, ni caché de Next en SSR.

### 3.1 `src/lib/api-error.ts` (nuevo)

```ts
/** Error normalizado: cubre los DOS formatos del backend (ver §1.1). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly payload: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Campos extra que algunos errores traen: sku, minutesLeft, isGuestAccount… */
  get sku()            { return this.payload.sku as string | undefined; }
  get minutesLeft()    { return this.payload.minutesLeft as number | undefined; }
  get isGuestAccount() { return this.payload.isGuestAccount === true; }
}

export function parseApiError(status: number, body: any): ApiError {
  // Formato A (catalog/checkout/cart/tiers): { error, code }
  // Formato B (auth):                        { statusCode, error: "Unauthorized", message }
  const message =
    (typeof body?.message === 'string' && body.message) ||
    (typeof body?.error === 'string' && body.error) ||
    `Error HTTP ${status}`;

  const code = typeof body?.code === 'string' ? body.code : httpFallbackCode(status);
  return new ApiError(message, status, code, body ?? {});
}

function httpFallbackCode(status: number): string {
  switch (status) {
    case 400: return 'BAD_REQUEST';
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 409: return 'CONFLICT';
    case 429: return 'RATE_LIMIT_EXCEEDED';
    default:  return status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'UNKNOWN_ERROR';
  }
}
```

### 3.2 `src/lib/api.ts` (reescrito)

```ts
import { config } from './config';
import { getStoredToken } from './auth';
import { ApiError, parseApiError } from './api-error';

export type AuthMode =
  | 'none'
  | 'customer'          // JWT de cliente desde localStorage
  | { bearer: string }; // token explícito: checkoutSessionToken u orderAccessToken

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;                    // JSON, o FormData para el comprobante
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: AuthMode;
  headers?: Record<string, string>;
  /** Caché de Next en SSR. Catálogo: { revalidate: 60 }. Datos de usuario: 'no-store'. */
  cache?: RequestCache;
  revalidate?: number;
  signal?: AbortSignal;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, auth = 'none', cache, revalidate, signal } = opts;

  const url = new URL(
    `${config.api.baseUrl}${path.startsWith('/') ? path : `/${path}`}`
  );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers: Record<string, string> = { ...opts.headers };
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';

  if (auth === 'customer') {
    const token = getStoredToken();
    if (!token) throw new ApiError('Sesión no iniciada', 401, 'UNAUTHORIZED');
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof auth === 'object') {
    headers.Authorization = `Bearer ${auth.bearer}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    signal,
    cache,
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });

  if (!res.ok) {
    let payload: unknown = null;
    try { payload = await res.json(); } catch { /* respuesta sin cuerpo JSON */ }
    throw parseApiError(res.status, payload);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
```

### 3.3 Manejo global de 401

`authenticateCustomer` en el backend solo valida la firma del JWT. Cuando expira (24h) toda ruta `/me/*` responde 401. Enganchar el logout en un solo lugar:

```ts
// src/lib/session.ts
import { ApiError } from './api-error';
import { useAuth } from '@/hooks/useAuth';

export function handleAuthError(err: unknown) {
  if (err instanceof ApiError && err.status === 401) {
    useAuth.getState().logout();
    if (typeof window !== 'undefined') window.location.href = '/login?expired=1';
  }
  throw err;
}
```

### 3.4 Qué hacer con `src/mocks/`

**No borrarlos todavía.** Sirven de fixtures para los tests de `src/__tests__/`. Plan:
1. Sacar el router de mocks de `api.ts` (queda solo `fetch`).
2. Mover los mocks a fixtures de test (`src/__tests__/fixtures/`) reescritos con el **modelo del backend**.
3. Borrar `src/mocks/` cuando los tests pasen.

---

## 4. Tipos y adaptadores

Dos capas: `types/backend.ts` (espejo exacto de lo que manda la API) y `lib/adapters/` (traducción al modelo que ya consumen los componentes). Así no hay que tocar `ProductCard`, `ProductGrid`, `ProductDetail`, `ProductGallery` ni los ~20 componentes de home.

### 4.1 `src/types/backend.ts` (nuevo)

```ts
// Espejo 1:1 de backend/src/types/domain.ts — no editar para "mejorar" nombres.
export type BackendCut = string;   // 'CLASSIC' | 'OVERSIZED' | 'FEMENINO' | 'MASCULINO' | …
export type DropType = 'DROP_01' | 'DROP_02' | 'ESPECIAL';

export interface BackendVariant { sku: string; stock: number; }

export interface BackendFlashSale {
  discountType: 'PERCENTAGE' | 'FIXED' | 'OVERRIDE';
  discountValue: number;
  overridePrice?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  isActive?: boolean;
}

export interface BackendQuantityDiscount {
  minQty: number;
  discountType: 'PERCENTAGE' | 'FIXED' | 'OVERRIDE';
  discountValue: number;
}

export interface BackendProduct {
  productId: string;
  slug: string;
  name: string;
  category: string;
  dropType: DropType;
  price: number;                    // guaraníes enteros (ver §4.3)
  isDropActive: boolean;
  images: string[];
  imagesByCut?: Record<BackendCut, string[]>;
  variants: Record<BackendCut, Record<string, BackendVariant>>;
  variantsByCut?: Record<BackendCut, Record<string, BackendVariant>>;
  availableCuts?: BackendCut[];
  discountPercent: number;
  quantityDiscounts?: BackendQuantityDiscount[];
  tags: string[];
  isLimitedDrop: boolean;
  purchaseType?: string;
  badge?: string | null;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  successMessage?: string;
  shippingEstimated?: string | null;
  flashSale?: BackendFlashSale | null;
  isCombo?: boolean;
  comboItems?: Array<{ productId: string; qty: number; allowedSizes: string[]; name?: string; images?: string[] }>;
  showHypeCountdown?: boolean;
  publishAt?: string | null;
  unpublishAt?: string | null;
}

export interface BackendUser {
  id: string; firstName: string; lastName: string; email: string;
  role?: string; avatarUrl?: string | null;
}
export interface BackendAuthResponse { token: string; user: BackendUser; success?: boolean; message?: string; }

export interface BackendCheckoutItem {
  sku: string; productId: string; size: string; qty: number; unitPrice: number;
}
export interface BackendCheckoutPayload {
  items: BackendCheckoutItem[];
  customer: { email: string; fullName: string; phone: string };
  shipping: { address: string; locality: string; province: string; postalCode: string };
  wantsClubMembership: boolean;
  couponCode?: string;
  requestsInvoice?: boolean;
  invoiceData?: { ruc?: string; razonSocial?: string; direccionFiscal?: string };
}
export interface BackendCheckoutResponse {
  orderId: number; status: string; expiresAt: string; message: string; orderAccessToken: string;
}

export interface BackendTier {
  currentTier: { id: number; name: string; discountPercentage: number; earlyAccessHours: number } | null;
  totalSpent: number;
  progressPercentage: number;
  centsToNextTier: number;
  nextTier: { id: number; name: string; minSpentCents: number; discountPercentage: number; earlyAccessHours: number } | null;
}

export interface BackendOrderSummary {
  id: string;            // "ord_102"
  orderNumber: string;   // "TR-10102"
  createdAt: string;
  total: number;
  currency: 'PYG';
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  itemCount: number;
}
```

### 4.2 `src/lib/adapters/product.ts` (nuevo)

Traduce `BackendProduct` → `CatalogProduct` (el tipo que ya usan los componentes). Aquí es donde se aplanan las variantes, se resuelve el precio efectivo y se calcula el `urgencyLabel` que el backend no manda.

```ts
import type { BackendProduct, BackendFlashSale } from '@/types/backend';
import type { CatalogProduct, ProductVariant, StockStatus } from '@/types/api';

/** Precio efectivo: flash sale activa > discountPercent > price. Espeja checkout.service.ts:107-170. */
export function resolvePrice(p: BackendProduct): { price: number; discountPrice: number | null } {
  const base = p.price;
  const sale = p.flashSale;
  const now = Date.now();

  const saleActive =
    !!sale &&
    (sale.isActive ?? true) &&
    (!sale.startAt || new Date(sale.startAt).getTime() <= now) &&
    (!sale.endAt   || new Date(sale.endAt).getTime()   >  now);

  if (saleActive && sale) {
    const v = Math.abs(sale.discountValue ?? 0);
    if (sale.discountType === 'PERCENTAGE') return { price: base, discountPrice: Math.round(base * (1 - v / 100)) };
    if (sale.discountType === 'FIXED')      return { price: base, discountPrice: Math.max(0, base - v) };
    if (sale.discountType === 'OVERRIDE')   return { price: base, discountPrice: sale.overridePrice ?? base };
  }
  if (p.discountPercent > 0) {
    return { price: base, discountPrice: Math.round(base * (1 - p.discountPercent / 100)) };
  }
  return { price: base, discountPrice: null };
}

/** Aplana el mapa corte→talle→{sku,stock} al array que consumen los componentes. */
export function flattenVariants(p: BackendProduct): ProductVariant[] {
  const map = p.variantsByCut ?? p.variants ?? {};
  const { price, discountPrice } = resolvePrice(p);
  const unit = discountPrice ?? price;

  return Object.entries(map).flatMap(([cut, sizes]) =>
    Object.entries(sizes ?? {}).map(([size, v]) => ({
      variantId: v.sku,     // el SKU ES el identificador de variante en este backend
      sku: v.sku,
      cut: cut as never,
      size,
      price: unit,
      stock: v.stock,
    }))
  );
}

/** El backend NO manda urgencyLabel (§1.2). Regla del doc, implementada en el front. */
export function urgencyLabel(stock: number): string | null {
  if (stock <= 0) return 'Agotado';
  if (stock <= 5) return `¡Quedan ${stock} ${stock === 1 ? 'unidad' : 'unidades'}!`;
  return null;
}

export function toCatalogProduct(p: BackendProduct): CatalogProduct {
  const { price, discountPrice } = resolvePrice(p);
  const variants = flattenVariants(p);
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);

  const stockStatus: StockStatus =
    totalStock === 0 ? 'OUT_OF_STOCK' : totalStock <= 5 ? 'LOW_STOCK' : 'IN_STOCK';

  // imagesByCut primero (permite cambiar el carrusel al elegir corte), images como fallback
  const byCut = p.imagesByCut ?? {};
  const images = Object.entries(byCut).flatMap(([cut, urls]) =>
    (urls ?? []).map((url) => ({ url, alt: `${p.name} — ${cut}`, cutVariant: cut as never }))
  );
  if (images.length === 0) {
    images.push(...(p.images ?? []).map((url) => ({ url, alt: p.name })));
  }

  return {
    productId: p.productId,
    slug: p.slug,
    title: p.name,                                   // name → title
    description: p.shippingEstimated ?? '',          // ⚠️ el catálogo no trae description (§1.2)
    price,
    discountPrice,
    images,
    cuts: (p.availableCuts ?? Object.keys(p.variants ?? {})) as never,
    category: p.category,
    sizes: [...new Set(variants.map((v) => v.size))],
    stockStatus,
    variants,
    flashSale: p.flashSale?.endAt
      ? { discountPercent: p.flashSale.discountValue, endsAt: p.flashSale.endAt }
      : null,
  };
}
```

> **`description` vacío**: el catálogo de Redis no lo incluye. Dos salidas: (a) pedir al back que lo mapee en `catalog.service.ts` (§9), o (b) mostrar `shippingEstimated`/`badge` en la ficha mientras tanto. Recomendado (a) — es una línea en el backend.

### 4.3 Unidades monetarias

El backend nombra los campos "cents" (`minSpentCents`) pero **almacena guaraníes enteros**: los mails formatean `Gs. ${item.unitPrice.toLocaleString('es-PY')}` sin dividir. `formatCurrency()` del front ya trata el número como guaraníes enteros → **no dividir por 100 en ninguna parte**. Verificar con un producto sembrado antes de cerrar el checkout.

---

## 5. Implementación por fases

### Fase 1 — Catálogo (base de todo)

**`src/lib/services/catalog.ts`** (nuevo):

```ts
import { api } from '@/lib/api';
import { toCatalogProduct } from '@/lib/adapters/product';
import type { BackendProduct } from '@/types/backend';
import type { CatalogProduct } from '@/types/api';

export interface CatalogQuery {
  cut?: string; category?: string; size?: string; color?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

export async function fetchCatalog(q: CatalogQuery = {}): Promise<CatalogProduct[]> {
  const raw = await api<BackendProduct[]>('/catalog', { query: q, revalidate: 60 });
  return raw.map(toCatalogProduct);
}

export async function fetchProduct(idOrSlug: string): Promise<CatalogProduct | null> {
  try {
    const raw = await api<BackendProduct>(`/catalog/${idOrSlug}`, { revalidate: 60 });
    return toCatalogProduct(raw);
  } catch { return null; }   // 404 → PRODUCT_NOT_FOUND
}

export async function fetchCuts() {
  return api<{ cuts: Array<{ code: string; name: string; productsCount: number }> }>(
    '/catalog/cuts', { revalidate: 300 }
  );
}

export async function searchCatalog(term: string, signal?: AbortSignal) {
  if (!term.trim()) return { suggestions: [] };
  return api<{ suggestions: Array<{ id: string; name: string; slug: string; thumbnailUrl: string | null; price: number }> }>(
    '/v1/catalog/search', { query: { q: term }, cache: 'no-store', signal }
  );
}

export async function fetchSizeGuide(category: string) {
  return api<{ category: string; chart: { headers: string[]; rows: string[][] } }>(
    `/v1/catalog/size-guide/${category.toLowerCase()}`, { revalidate: 3600 }
  );
}
```

**⚠️ `GET /api/catalog/:productId` solo acepta `productId`, no slug** — busca la key `catalog:product:{id}` en Redis. Las rutas del front usan `[productId]`, así que funciona; si más adelante se quiere `/producto/[slug]`, hay que traer el catálogo completo y filtrar, o pedir el endpoint por slug al back.

**Filtros de precio y destacados** (§1.3): mientras el backend esté roto, filtrar en el cliente sobre el array completo:

```ts
const all = await fetchCatalog({ cut, category });
const filtered = all.filter(p => {
  const price = p.discountPrice ?? p.price;
  return (!priceMin || price >= priceMin) && (!priceMax || price <= priceMax);
});
```

**Bento Grid destacados** — `?isFeatured=true` devuelve `[]` hoy. Workaround: derivar destacados de un campo que sí existe (`isLimitedDrop`, `badge`, o un tag convenido con el admin, p. ej. `tags.includes('destacado')`), manteniendo las reglas de fallback del doc (0 → no renderizar · 1 → solo héroe 2×2 · 2-3 → héroe + secundarios disponibles · ≥4 → grid completo). Encapsular en `selectFeatured(products)` para cambiar una sola línea cuando el back se arregle.

**Archivos a tocar**: `app/catalog/page.tsx`, `app/products/[productId]/page.tsx`, `components/catalog/ProductGrid.tsx`, `FilterBar.tsx`, `SizeGuideModal.tsx`, `common/SearchModal.tsx`, `HomeProductGrid.tsx`, `FeaturedProductsGrid.tsx`, `LatestProductsCarousel.tsx`.

> `products/[productId]/page.tsx:45` hace `product.description.slice(0,160)` → **crashea con `description` vacío**. Usar `(product.description ?? '').slice(...)`.

---

### Fase 2 — Carrito

El carrito local (`useCart`) se queda como fuente de verdad. Se le suma sincronización con Redis.

**Cambio de modelo**: `variantId` pasa a ser **el SKU**, y hay que guardar `productId` y `size` porque el checkout los exige por item.

```ts
// src/types/cart.ts — CartItem
export interface CartItem {
  variantId: string;    // === sku
  sku: string;
  productId: string;    // requerido por POST /api/checkout
  productName: string;
  size: string;         // requerido por POST /api/checkout
  cut: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  maxStock?: number;
}
```

**`src/lib/services/cart.ts`** (nuevo):

```ts
import { api } from '@/lib/api';
import type { CartItem } from '@/types/cart';

export async function pushUserCart(items: CartItem[]) {
  return api<{ success: boolean; cart: { items: CartItem[] } }>('/v1/me/cart', {
    method: 'POST', body: { items }, auth: 'customer', cache: 'no-store',
  });
}
export async function pullUserCart() {
  return api<{ items: CartItem[] }>('/v1/me/cart', { auth: 'customer', cache: 'no-store' });
}
/** Carrito de invitado: exige email verificado por OTP (§1.8). */
export async function pushGuestCart(email: string, items: CartItem[]) {
  return api('/v1/cart', {
    method: 'POST', body: { items }, headers: { 'x-guest-email': email }, cache: 'no-store',
  });
}
```

**Merge manual al login** (el backend no lo hace, §1.9):

```ts
// tras un login exitoso
const remote = await pullUserCart();
const merged = mergeCartItems(useCart.getState().items, remote.items);  // suma qty por sku
useCart.setState({ items: merged });
await pushUserCart(merged);
```

Sincronizar con debounce (~800 ms) tras cada mutación del store, y **nunca bloquear la UI** si falla: el carrito local sigue siendo válido.

**Validación de stock**: `maxStock` viene del `stock` de la variante. Mostrar el `urgencyLabel(stock)` del adaptador en la ficha y en el drawer.

---

### Fase 3 — Autenticación

**`src/lib/services/auth.ts`** (nuevo):

```ts
import { api } from '@/lib/api';
import type { BackendAuthResponse } from '@/types/backend';

export const login = (email: string, password: string) =>
  api<BackendAuthResponse>('/auth/login', { method: 'POST', body: { email, password } });

/** ⚠️ firstName y lastName SEPARADOS y obligatorios (§1.5). */
export const register = (input: {
  firstName: string; lastName: string; email: string; password: string; phone?: string;
}) => api<BackendAuthResponse>('/auth/register', { method: 'POST', body: input });

export const loginWithGoogle = (idToken: string) =>
  api<BackendAuthResponse>('/auth/google', { method: 'POST', body: { idToken } });

export const forgotPassword = (email: string) =>
  api<{ success: boolean; message: string }>('/auth/forgot-password', { method: 'POST', body: { email } });

/** ⚠️ el campo es `password`, no `newPassword` (§1.5). */
export const resetPassword = (token: string, password: string) =>
  api<{ success: boolean; message: string }>('/auth/reset-password', { method: 'POST', body: { token, password } });
```

**Cambios en `LoginForm.tsx`**:
- Registro: enviar `firstName` + `lastName` separados (ya los tiene el form) y **validar password ≥ 8 en cliente**.
- Capturar el **409 con `isGuestAccount`**: mostrar "Ya tenés una cuenta creada en tu última compra → recuperá tu contraseña" con link directo al modo forgot.
- Login: `login(response.token)` está bien, pero conviene pasar también `response.user` para no depender del parseo del JWT (el payload del token trae `userId`/`email`/`role`, **no** `firstName`/`lastName`).

**`AuthState` a corregir** (`src/types/auth.ts`): `DecodedJWTPayload` declara `userId: string, firstName, lastName` pero el JWT real trae `{ userId: number, email, role, permissions, iat, exp }`. Alinear el tipo y guardar el `user` de la respuesta en el store.

**Rutas nuevas a crear**:
- `app/restablecer-contrasena/page.tsx` — lee `?token=`, formulario de nueva contraseña, `POST /auth/reset-password`. **Sin esta ruta el mail de recuperación cae en 404** (§1.5).
- Google: cargar GIS, obtener `idToken`, mandarlo a `/auth/google`. Manejar **503 `GOOGLE_NOT_CONFIGURED`** ocultando el botón. **No implementar el flujo `isNewUser`** del doc — ese campo no existe (§1.5); si se lo quiere, hay que pedirlo al backend.

**Expiración**: token de 24h. Chequear `exp` del JWT al montar (`syncFromStorage`) y desloguear si venció, en vez de esperar el primer 401.

---

### Fase 4 — Checkout (el flujo más complejo)

Dos caminos que convergen en `POST /api/checkout` con distinto Bearer:

```
INVITADO                                  LOGUEADO
  ↓ email                                   ↓
POST /checkout/verify-email  (3/hora)     JWT de cliente en localStorage
  ↓ código de 6 dígitos al mail             │
POST /checkout/confirm-otp                  │
  → { checkoutSessionToken (30m),           │
      existingAccount }                     │
  └──────────────┬─────────────────────────┘
                 ↓
        POST /api/checkout   (Bearer: sessionToken | jwt)
                 ↓  201
   { orderId, status, expiresAt, message, orderAccessToken (60m) }
                 ↓
   Guardar orderAccessToken (sessionStorage)
                 ↓
   POST /api/checkout/:id/receipt   (Bearer: orderAccessToken, multipart)
```

**`src/lib/services/checkout.ts`** (nuevo):

```ts
import { api } from '@/lib/api';
import type { BackendCheckoutPayload, BackendCheckoutResponse } from '@/types/backend';

export const requestOtp = (email: string, turnstileToken?: string) =>
  api<{ success: boolean; message: string }>('/checkout/verify-email', {
    method: 'POST', body: { email, turnstileToken },
  });

export const confirmOtp = (email: string, otp: string) =>
  api<{ checkoutSessionToken: string; existingAccount: boolean; message: string }>(
    '/checkout/confirm-otp', { method: 'POST', body: { email, otp } }
  );

export const createOrder = (payload: BackendCheckoutPayload, bearer: string) =>
  api<BackendCheckoutResponse>('/checkout', { method: 'POST', body: payload, auth: { bearer } });

export const fetchOrderPublic = (orderId: number, orderAccessToken: string) =>
  api(`/checkout/${orderId}`, { auth: { bearer: orderAccessToken }, cache: 'no-store' });

export async function uploadReceipt(orderId: number, file: File, orderAccessToken: string) {
  const fd = new FormData();
  fd.append('receipt', file);   // el back toma el primer archivo; el nombre del campo es indistinto
  return api<{ success: boolean; url: string; message: string }>(
    `/checkout/${orderId}/receipt`, { method: 'POST', body: fd, auth: { bearer: orderAccessToken } }
  );
}
```

**Reescritura de `CheckoutForm.tsx`** — el form actual manda un payload plano (`firstName`, `lastName`, `zipCode`, `country`, `items:[{variantId, quantity}]`) que el schema AJV del backend **rechaza con 400**. Nuevo mapeo:

| Form actual | Payload real |
|:--|:--|
| `firstName` + `lastName` | `customer.fullName` (concatenados) |
| `email`, `phone` | `customer.email`, `customer.phone` |
| `address` | `shipping.address` — **mínimo 10 caracteres**, validar en cliente |
| `city` | `shipping.locality` |
| `state` | `shipping.province` |
| `zipCode` | `shipping.postalCode` — regex `^[a-zA-Z0-9]{4,8}$` |
| `country` | ✂️ no existe en el backend |
| `referralCode` | ✂️ no existe; el equivalente es `couponCode` |
| `items:[{variantId, quantity}]` | `items:[{ sku, productId, size, qty, unitPrice }]` |
| — | `wantsClubMembership: boolean` **obligatorio** → agregar checkbox |

También cambia la pantalla de éxito: hoy usa `createdOrder.orderNumber` y `createdOrder.total`, que **no vienen** en la respuesta. Lo real es `orderId`, `status`, `expiresAt`, `message`. Mostrar `orderId` y un contador con `expiresAt` (la reserva vence en ~120 min).

**Validaciones cliente antes de postear** (evitan 400 crípticos del AJV): teléfono contra los formatos de §1.6, dirección ≥ 10, postal 4-8 alfanumérico, carrito no vacío, y ≤ 3 unidades totales si el usuario ya tiene pendientes.

**Errores a manejar en UI**:

| Código | Situación | UX |
|:--|:--|:--|
| `INSUFFICIENT_STOCK` (409) | trae `sku` | marcar ese talle como agotado, refrescar el producto y sacarlo del carrito |
| `RESERVATION_COOLDOWN_ACTIVE` (429) | trae `minutesLeft` | "Podés volver a intentar en X minutos" |
| `TOO_MANY_PENDING_RESERVATIONS` (429) | máx. 3 unidades pendientes | "Completá tus pedidos anteriores" + link a `/dashboard` |
| `INVALID_OTP` (400) | código incorrecto | limpiar inputs, reintentar |
| `TOO_MANY_FAILED_OTP_ATTEMPTS` (429) | 5 fallos → bloqueo 15 min | bloquear el form 15 min |
| `MISSING_CHECKOUT_TOKEN` / `EXPIRED_CHECKOUT_SESSION` (401) | sesión de 30 min vencida | volver al paso de OTP |
| `INVALID_FILE_TYPE` (400/415), `FILE_TOO_LARGE` (400) | comprobante | "JPG, PNG, WebP, GIF o PDF, hasta 5 MB" |
| `INVALID_ORDER_STATUS` (422) | orden ya no pendiente | mostrar el estado actual |

**Persistencia de tokens**: `checkoutSessionToken` (30 min) y `orderAccessToken` (60 min) van en **`sessionStorage`**, no en el store del JWT de cliente — son de vida corta y de propósito distinto. El `orderAccessToken` es lo único que permite subir el comprobante: si se pierde, el invitado no puede completar el pago.

---

### Fase 5 — Cuenta del cliente

**`src/lib/services/account.ts`** (nuevo):

```ts
import { api } from '@/lib/api';
import type { BackendOrderSummary, BackendTier } from '@/types/backend';

export const fetchProfile = () =>
  api<{ id: string; firstName: string; lastName: string; email: string; phone: string; addresses: [] }>(
    '/me', { auth: 'customer', cache: 'no-store' });

export const updateProfile = (body: { firstName?: string; lastName?: string; phone?: string }) =>
  api<{ success: boolean; message: string; user: any }>('/me', { method: 'PATCH', body, auth: 'customer' });

export const changePassword = (currentPassword: string, newPassword: string) =>
  api<{ success: boolean; message: string }>('/me/change-password', {
    method: 'POST', body: { currentPassword, newPassword }, auth: 'customer' });

/** ⚠️ array desnudo, sin paginación (§1.4). */
export const fetchOrders = () =>
  api<BackendOrderSummary[]>('/me/orders', { auth: 'customer', cache: 'no-store' });

/** El id lleva prefijo: "ord_102". */
export const fetchOrder = (id: string) =>
  api(`/me/orders/${id}`, { auth: 'customer', cache: 'no-store' });

export const fetchTier = () => api<BackendTier>('/v1/me/tier', { auth: 'customer', cache: 'no-store' });

// Soporte
export const fetchTickets = () =>
  api<Array<{ id: string; subject: string; category: string; status: string; createdAt: string; updatedAt: string }>>(
    '/me/tickets', { auth: 'customer', cache: 'no-store' });

/** ⚠️ `category` es OBLIGATORIO (400 si falta) — el Dashboard actual no lo manda. */
export const createTicket = (subject: string, category: string, message: string) =>
  api('/me/tickets', { method: 'POST', body: { subject, category, message }, auth: 'customer' });

export const replyTicket = (ticketId: string, message: string) =>
  api(`/me/tickets/${ticketId}/messages`, { method: 'POST', body: { message }, auth: 'customer' });
```

**`Dashboard.tsx`** — hoy postea `{ subject, orderId, message }` a `/me/tickets`; el backend exige `{ subject, category, message }` y devuelve **400** si falta `category`. Agregar un select de categoría. Los ids de ticket vienen como `tkt_N`.

**Estados de orden**: el backend traduce los estados en español a un enum inglés (`pending`, `processing`, `confirmed`, `shipped`, `delivered`, `cancelled`, `returned`). Mapear a etiquetas en español en la UI.

**Widget de tier**: con `progressPercentage` y `centsToNextTier` alcanza para la barra de progreso. Los "beneficios" hay que construirlos: `${discountPercentage}% de descuento` + `acceso anticipado ${earlyAccessHours}h` cuando sean > 0. `badgeColor` no existe → asignar color por nombre de tier en el front.

---

### Fase 6 — Extras

**Reseñas** (`components/common/CustomerReviewsSection.tsx`):
```ts
export const fetchReviews = (productId: string) =>
  api<Array<{ id: number; rating: number; comment: string; guestName: string; photoUrl: string | null; createdAt: string }>>(
    `/catalog/${productId}/reviews`, { revalidate: 120 });

export const submitReview = (productId: string, body: { rating: number; comment?: string; guestName?: string; photoUrl?: string }) =>
  api(`/catalog/${productId}/reviews`, { method: 'POST', body });
```
Tras enviar: **"Tu reseña será publicada una vez aprobada por nuestro equipo"** — queda en `pending` (§1.11).

**Waitlist** (talle agotado):
```ts
export const joinWaitlist = (sku: string, email: string) =>
  api(`/catalog/${sku}/waitlist`, { method: 'POST', body: { email } });
```
Mostrar el botón "Avisame cuando vuelva" cuando `variant.stock === 0`.

**Meta Pixel** — recordar que `/v1/settings` devuelve un **array** (§1.10):
```ts
export async function getPixelId(): Promise<string | null> {
  const rows = await api<Array<{ key: string; value: string }>>('/v1/settings', { revalidate: 3600 });
  return rows.find((r) => r.key === 'meta_pixel_id')?.value || null;
}
```
`react-facebook-pixel` no está en `package.json`: `pnpm add react-facebook-pixel`, o cargar `fbq` con un `<Script>` inline y evitar la dependencia.

---

## 6. Mapa completo de endpoints del storefront

Verificado contra el fuente. ✅ = coincide con el doc · ⚠️ = difiere (ver §1) · 🐛 = con bug en el backend.

| Método | Ruta | Auth | Nota |
|:--|:--|:--|:--|
| GET | `/health` | — | fuera de `/api` |
| GET | `/api/catalog` · `/api/v1/catalog` | — | ⚠️ modelo distinto · 🐛 `priceMin`/`priceMax`/`isFeatured`/`page`/`limit` |
| GET | `/api/catalog/:productId` | — | ⚠️ solo por `productId`, no slug |
| GET | `/api/catalog/cuts` | — | ✅ `{ cuts: [{code, name, productsCount}] }` (excluye `CLASSIC`) |
| GET | `/api/v1/catalog/search?q=` | — | ✅ máx. 8 sugerencias |
| GET | `/api/v1/catalog/size-guide/:category` | — | ✅ categoría en minúsculas; fallback por defecto |
| GET/POST | `/api/catalog/:productId/reviews` | — | ⚠️ POST queda en `pending` |
| POST | `/api/catalog/:sku/waitlist` | — | ✅ body `{ email }` |
| POST | `/api/auth/login` | — | ⚠️ formato de error B · 5/min |
| POST | `/api/auth/register` | — | ⚠️ `firstName`+`lastName` · 409 `isGuestAccount` |
| POST | `/api/auth/google` | — | ⚠️ sin `isNewUser` · 503 si no hay config |
| POST | `/api/auth/forgot-password` | — | ✅ 3/min |
| POST | `/api/auth/reset-password` | — | ⚠️ campo `password` |
| GET/PATCH | `/api/me` | JWT | ⚠️ `addresses` siempre `[]` |
| POST | `/api/me/change-password` | JWT | ✅ |
| GET | `/api/me/orders` · `/api/me/orders/:id` | JWT | ⚠️ array desnudo · ids `ord_N` |
| GET/POST | `/api/me/tickets` | JWT | ⚠️ POST exige `category` |
| GET | `/api/me/tickets/:id` · POST `/messages` | JWT | ids `tkt_N` |
| GET | `/api/v1/me/tier` | JWT | ⚠️ shape distinto |
| GET/POST | `/api/v1/me/cart` | JWT | ⚠️ reemplazo total |
| GET/POST | `/api/v1/cart` | `x-guest-email` | ⚠️ 401 `UNVERIFIED_GUEST` |
| POST | `/api/checkout/verify-email` | — | ✅ 3/hora · `turnstileToken` opcional |
| POST | `/api/checkout/confirm-otp` | — | ✅ + `existingAccount` |
| POST | `/api/checkout` | session o JWT | ⚠️ body estricto |
| GET | `/api/checkout/:id` | orderAccessToken | no documentado |
| POST | `/api/checkout/:id/receipt` | orderAccessToken | ✅ multipart, 5 MB |
| GET | `/api/v1/settings` | — | ⚠️ array de filas |

---

## 7. Errores → UX

```ts
// src/lib/error-messages.ts
export const ERROR_UX: Record<string, { message: string; action?: 'login' | 'cart' | 'retry' | 'otp' }> = {
  UNAUTHORIZED:                 { message: 'Tu sesión expiró. Ingresá de nuevo.', action: 'login' },
  SESSION_REVOKED:              { message: 'Tu sesión fue cerrada.',              action: 'login' },
  FORBIDDEN:                    { message: 'No tenés permiso para esta acción.' },
  NOT_FOUND:                    { message: 'No encontramos lo que buscabas.' },
  PRODUCT_NOT_FOUND:            { message: 'Esta prenda ya no está disponible.' },
  INSUFFICIENT_STOCK:           { message: 'Alguien se adelantó: ese talle ya no está disponible.', action: 'cart' },
  RESERVATION_COOLDOWN_ACTIVE:  { message: 'Tu reserva anterior venció. Esperá unos minutos.' },
  TOO_MANY_PENDING_RESERVATIONS:{ message: 'Tenés pedidos sin confirmar. Completalos primero.' },
  INVALID_OTP:                  { message: 'El código no es correcto.',           action: 'otp' },
  TOO_MANY_FAILED_OTP_ATTEMPTS: { message: 'Demasiados intentos. Probá en 15 minutos.' },
  MISSING_CHECKOUT_TOKEN:       { message: 'Verificá tu email para continuar.',   action: 'otp' },
  EXPIRED_CHECKOUT_SESSION:     { message: 'La verificación expiró. Pedí un código nuevo.', action: 'otp' },
  INVALID_FILE_TYPE:            { message: 'Formato no válido: JPG, PNG, WebP, GIF o PDF.' },
  FILE_TOO_LARGE:               { message: 'El archivo supera los 5 MB.' },
  INVALID_ORDER_STATUS:         { message: 'Esta orden ya no admite comprobantes.' },
  UNVERIFIED_GUEST:             { message: 'Verificá tu email para guardar el carrito.', action: 'otp' },
  RATE_LIMIT_EXCEEDED:          { message: 'Demasiadas peticiones. Esperá un momento.', action: 'retry' },
  CACHE_UNAVAILABLE:            { message: 'El catálogo no está disponible. Reintentá en instantes.', action: 'retry' },
  GOOGLE_NOT_CONFIGURED:        { message: 'El ingreso con Google no está disponible.' },
  INTERNAL_SERVER_ERROR:        { message: 'Algo salió mal. Intentá de nuevo.', action: 'retry' },
};

export const uxFor = (code: string, fallback: string) => ERROR_UX[code]?.message ?? fallback;
```

Como los errores de `auth` **no traen `code`** (§1.1), ahí hay que mostrar el `message` del backend directamente — ya viene redactado en español.

---

## 8. Orden de trabajo

| # | Tarea | Depende de | Riesgo |
|:--|:--|:--|:--|
| 1 | `.env.local` a `5014` + `USE_MOCK=false` + `remotePatterns` | — | bajo |
| 2 | `api-error.ts` + `api.ts` reescrito + `types/backend.ts` | 1 | bajo |
| 3 | `adapters/product.ts` + `services/catalog.ts` | 2 | **medio** — es el corazón de la migración |
| 4 | Migrar catálogo, ficha, búsqueda, guía de talles | 3 | medio |
| 5 | Bento/destacados con `selectFeatured()` | 4 | bajo |
| 6 | `CartItem` con `sku`/`productId`/`size` + sync Redis | 3 | medio |
| 7 | `services/auth.ts` + `LoginForm` + `/restablecer-contrasena` | 2 | bajo |
| 8 | Checkout: OTP → orden → comprobante | 6, 7 | **alto** — el más complejo |
| 9 | Cuenta: perfil, órdenes, tickets, tier | 7 | bajo |
| 10 | Reseñas, waitlist, pixel | 4 | bajo |
| 11 | Retirar `src/mocks/`, reescribir tests con fixtures reales | 4-10 | bajo |

Sugerencia: hasta el punto 4 inclusive, mantener `NEXT_PUBLIC_USE_MOCK` como escape hatch por si el backend no está levantado; retirarlo recién en el 11.

---

## 9. 🐛 TODOs del lado backend

Cosas que conviene arreglar allá en vez de parchear acá. Todas son cambios chicos:

1. **`catalog.routes.ts:47-66`** — los filtros usan `p.basePrice` y `p.isFeatured`; el payload de Redis expone `price` y no tiene `isFeatured`. Hoy `priceMin`, `priceMax` e `isFeatured` **siempre devuelven `[]`**. Arreglar el nombre del campo y mapear `isFeatured` en `catalog.service.ts`. **Sin esto el Bento Grid del doc §4 no es implementable.**
2. **`catalog.service.ts:129-159`** — agregar `description` al objeto que va a Redis (existe en la tabla y la ficha de producto lo necesita).
3. **`urgencyLabel`** — o lo calcula el backend como promete el doc, o se saca del doc. Hoy lo hace el front.
4. **`migrateGuestCartToUser()`** (`cart.routes.ts:118`) está definida pero **nunca se llama**. Invocarla en el handler de `/auth/login` como afirma el doc §6.2.
5. **Formato de error en `auth`** — unificar a `{ error, code }` como el resto de la API. Hoy son dos contratos distintos.
6. **`isNewUser` en `/auth/google`** — el doc define un flujo de bienvenida basado en ese campo; el endpoint no lo devuelve. Agregarlo (`google-auth.service.ts` ya sabe si creó el usuario) o quitar la sección del doc.
7. **Paginación** — o se implementa `{ data, pagination }` en `/api/catalog` y `/api/me/orders`, o se saca la §12 del doc. Hoy `page` y `limit` se ignoran.
8. **`sort=bestsellers`** — documentado, no implementado.
9. **Acumulación de cupones** — el doc §9 dice "cupón sobre el subtotal restante tras el tier"; el código hace `Math.max()`. Decidir cuál es la regla de negocio real y alinear.
10. **`/api/v1/settings`** — expone **todas** las filas de settings al público. Conviene devolver solo una whitelist (`meta_pixel_id`, etc.).

---

## 10. Testing

- **`src/__tests__/lib/api.test.ts`** — reescribir contra `api()`: query params, ambos formatos de error, FormData, los tres modos de auth.
- **Nuevo `src/__tests__/lib/adapters.test.ts`** — el más valioso: `resolvePrice` (flash sale PERCENTAGE/FIXED/OVERRIDE, vencida, `discountPercent`), `flattenVariants` (mapa anidado → array), `urgencyLabel` (0, 1, 5, 6), `toCatalogProduct` con `imagesByCut` vacío.
- **`useCart.test.ts`** — actualizar al `CartItem` nuevo (`sku`/`productId`/`size`).
- **Smoke E2E manual** con backend levantado: catálogo carga · ficha carga · agregar al carrito · OTP llega al mail · orden se crea · comprobante sube · orden aparece en `/dashboard`.

```powershell
pnpm test
pnpm type-check     # obligatorio: el cambio de tipos toca muchos archivos
pnpm dev
```

---

## 11. Resumen ejecutivo

- La superficie de integración es chica (**5 archivos** tocan la API hoy), pero **el modelo de datos del backend no se parece al que asume el front** — por eso todo pasa por `lib/adapters/product.ts`.
- **`STOREFRONT-INTEGRATION.md` no es confiable como contrato.** Difiere del código real en catálogo, auth, checkout, carrito, tiers, settings, cupones y paginación. Este documento tiene las formas verificadas.
- Hay **cuatro bugs de backend** que bloquean features documentadas: filtros de precio, `isFeatured` (→ Bento Grid), `description` ausente en el catálogo, y la migración de carrito que nunca se ejecuta.
- El flujo de mayor riesgo es el **checkout de invitado** (OTP → sesión de 30 min → orden → token de 60 min → comprobante), con cuatro tokens de vidas distintas y un schema AJV estricto que rechaza el payload actual del front.
