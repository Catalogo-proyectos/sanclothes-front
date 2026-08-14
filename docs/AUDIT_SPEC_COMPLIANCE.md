# Auditoría de Cumplimiento: Proyecto vs TRECE13_FRONTEND_SPEC

**Fecha de auditoría**: 2026-08-12  
**Documento de referencia**: `TRECE13_FRONTEND_SPEC_DEVELOP_ARCHITECTURE.md` (v1.0, 2026-07-19)  
**Proyecto auditado**: `sanclothes-front` (branch `main`)

---

## Resumen Ejecutivo

| Área | Cumplimiento | Veredicto |
|------|:------------:|-----------|
| Estructura de directorios | ~40% | Rutas sin route groups, muchos archivos faltantes |
| Dependencias | ~40% | 3 paquetes clave ausentes, versiones no pinneadas |
| Archivos de configuración | ~50% | Faltan Dockerfile, compose.yml, .env.staging/.production |
| Variables de entorno | ~91% | Falta SENTRY_DSN, hay 2 extras |
| Tipos TypeScript | ~85% | types/form.ts faltante, campos extra en CatalogProduct |
| Componentes | ~44% | 14 de 25 componentes de la spec ausentes |
| Hooks y estado | ~60% | 3 hooks core OK, 2 faltantes, 3 archivos lib faltantes |
| API Client | ~80% | Funcional, formato de error diferente, validación relajada |

---

## 1. Estructura de Directorios

### 1.1 Rutas de App (Route Groups)

La spec define route groups `(catalog)`, `(auth)`, `(customer)` con Next.js App Router. El proyecto usa rutas planas.

| Ruta de la Spec | Estado | Implementación Real |
|-----------------|:------:|---------------------|
| `app/(catalog)/page.tsx` | FALTA | `app/catalog/page.tsx` (sin route group) |
| `app/(catalog)/products/[productId]/page.tsx` | FALTA | `app/products/[productId]/page.tsx` (sin route group) |
| `app/(auth)/register/page.tsx` | FALTA | No existe |
| `app/(auth)/login/page.tsx` | FALTA | `app/login/page.tsx` (sin route group) |
| `app/(auth)/forgot-password/page.tsx` | FALTA | No existe |
| `app/(auth)/reset-password/page.tsx` | FALTA | No existe |
| `app/(customer)/dashboard/page.tsx` | FALTA | `app/dashboard/page.tsx` (sin route group) |
| `app/(customer)/orders/[orderId]/page.tsx` | FALTA | No existe |
| `app/(customer)/support/page.tsx` | FALTA | No existe |
| `app/(customer)/account/page.tsx` | FALTA | No existe |
| `app/checkout/page.tsx` | OK | Existe |
| `app/unsubscribe/page.tsx` | FALTA | No existe |
| `app/layout.tsx` | OK | Existe |
| `app/page.tsx` | OK | Existe |
| `app/globals.css` | OK | Existe |

### 1.2 Rutas Extra (no en spec)

- `app/about/page.tsx`
- `app/comunidad/page.tsx`
- `app/nosotros/page.tsx`

### 1.3 Directorio `src/styles/`

La spec requiere un directorio `src/styles/` con:
- `colors.css`, `typography.css`, `layout.css`, `animations.css`

**Estado: Todo el directorio FALTA.** Los estilos se manejan con Tailwind CSS v4 y `globals.css`.

### 1.4 Directorio `src/utils/`

| Archivo | Estado |
|---------|:------:|
| `utils/format.ts` | OK |
| `utils/validation.ts` | FALTA |
| `utils/helpers.ts` | FALTA |

---

## 2. Dependencias (package.json)

### 2.1 Versiones No Pinneadas

La spec exige versiones **pinneadas** (sin `^` ni `~`). El proyecto usa `^` en todas las dependencias. **Incumplimiento.**

### 2.2 Dependencias Requeridas por la Spec

| Paquete | Spec | Actual | Estado |
|---------|------|--------|:------:|
| `next` | `^14.2.0` | `16.2.11` | DIVERGE (2 majors arriba) |
| `react` | `^18.3.0` | `19.2.4` | DIVERGE (1 major arriba) |
| `react-dom` | `^18.3.0` | `19.2.4` | DIVERGE (1 major arriba) |
| `typescript` | `^5.4.0` | `^5` | OK (compatible) |
| `zustand` | `^4.4.0` | `^5.0.14` | DIVERGE (1 major arriba) |
| `axios` | `^1.7.0` | -- | **FALTA** (se usa fetch nativo) |
| `zod` | `^3.22.0` | -- | **FALTA** |
| `react-hook-form` | `^7.50.0` | -- | **FALTA** |
| `clsx` | `^2.1.0` | -- | FALTA (reemplazado por `tailwind-merge`) |

### 2.3 DevDependencies

| Paquete | Spec | Actual | Estado |
|---------|------|--------|:------:|
| `tailwindcss` | `^3.4.0` | `^4` | DIVERGE (1 major arriba) |
| `eslint` | `^8.56.0` | `^9` | DIVERGE (1 major arriba) |
| `prettier` | `^3.2.0` | -- | **FALTA** |
| `autoprefixer` | `^10.4.0` | -- | **FALTA** |
| `postcss` | `^8.4.0` | -- | FALTA (reemplazado por `@tailwindcss/postcss`) |

### 2.4 Dependencias Extra (no en spec)

| Paquete | Proposito |
|---------|-----------|
| `@base-ui/react` | Componentes base UI |
| `@react-three/fiber` | 3D rendering (Three.js) |
| `class-variance-authority` | Variantes de estilo |
| `framer-motion` | Animaciones |
| `lucide-react` | Iconos |
| `sonner` | Toasts/notificaciones |
| `tailwind-merge` | Merge de clases CSS |
| `three` | Motor 3D |

---

## 3. Archivos de Configuracion Raiz

| Archivo | Estado | Nota |
|---------|:------:|------|
| `.env.example` | OK | Presente |
| `.env.local` | OK | Existe y esta en .gitignore |
| `.env.production` | **FALTA** | Requerido por spec |
| `.env.staging` | **FALTA** | Requerido por spec |
| `Dockerfile` | **FALTA** | Requerido por spec |
| `compose.yml` | **FALTA** | Requerido por spec |
| `next.config.js` | DIVERGE | Existe como `next.config.ts` (spec pide `.js`) |
| `tsconfig.json` | OK | Presente |
| `pnpm-lock.yaml` | OK | Presente |

### 3.1 Variables de Entorno (.env.example)

| Variable | Estado |
|----------|:------:|
| `NEXT_PUBLIC_API_URL` | OK |
| `NEXT_PUBLIC_HEALTH_URL` | OK |
| `NEXT_PUBLIC_APP_URL` | OK |
| `NEXT_PUBLIC_ENV` | OK |
| `NEXT_PUBLIC_FEATURE_LOYALTY` | OK |
| `NEXT_PUBLIC_FEATURE_REFERRALS` | OK |
| `NEXT_PUBLIC_FEATURE_SIZE_FINDER` | OK |
| `NEXT_PUBLIC_FEATURE_GIFT_CARDS` | OK |
| `NEXT_PUBLIC_LOG_LEVEL` | OK |
| `NEXT_PUBLIC_JWT_STORAGE_KEY` | OK |
| `NEXT_PUBLIC_SENTRY_DSN` | **FALTA** |

**Variables extra** (no en spec):
- `NEXT_PUBLIC_MEDIA_ORIGIN`
- `NEXT_PUBLIC_USE_MOCK`

---

## 4. Tipos TypeScript (`src/types/`)

### 4.1 Archivos de Tipos

| Archivo | Estado |
|---------|:------:|
| `types/api.ts` | OK |
| `types/cart.ts` | OK |
| `types/auth.ts` | OK |
| `types/form.ts` | **FALTA** |
| `types/backend.ts` | EXTRA (no en spec) |

### 4.2 CatalogProduct: Campos de la Spec vs Implementacion

Todos los campos requeridos por la spec estan presentes y con tipos correctos:
`productId`, `slug`, `title`, `description`, `price`, `discountPrice`, `images`, `cuts`, `category`, `sizes`, `stockStatus`, `rating`, `reviewCount`, `variants`, `flashSale`.

**Campos extra** (no en spec):

| Campo | Tipo | Proposito |
|-------|------|-----------|
| `imagesByCut` | `Record<CutCode, ProductImage[]>` | Imagenes agrupadas por corte |
| `badge` | `string \| null` | Etiqueta del admin (NUEVO, etc.) |
| `isFeatured` | `boolean` | Destacado en Bento Grid 2x2 |
| `isLimitedDrop` | `boolean` | Edicion limitada |
| `tags` | `string[]` | Tags del producto |

**Nota**: `rating` y `reviewCount` se volvieron opcionales (`?`) cuando la spec los define como obligatorios.

### 4.3 Tipo BackendProduct (EXTRA)

Existe `types/backend.ts` con un modelo espejo del payload real del backend (`BackendProduct`). No esta en la spec. Diferencias clave con el modelo de la spec:

| Concepto | Spec (CatalogProduct) | Backend Real (BackendProduct) |
|----------|----------------------|-------------------------------|
| Nombre del producto | `title` | `name` |
| Variantes | Array plano `ProductVariant[]` | Mapa anidado `Record<Cut, Record<Size, Variant>>` |
| Imagenes | `ProductImage[]` con `url`, `alt`, `cutVariant` | `string[]` plano + `imagesByCut: Record<cut, string[]>` |
| Descuento | `discountPrice: number` | `discountPercent: number` + `flashSale` con `discountType` |
| Flash Sale | `{ discountPercent, endsAt }` | `{ discountType, discountValue, overridePrice, startAt, endAt, isActive }` |

---

## 5. Componentes (`src/components/`)

### 5.1 Componentes Requeridos por la Spec

**common/** (2 de 4):

| Componente | Estado |
|------------|:------:|
| `Header.tsx` | OK |
| `Footer.tsx` | OK |
| `Navbar.tsx` | **FALTA** |
| `CartIcon.tsx` | OK |

**catalog/** (4 de 5):

| Componente | Estado |
|------------|:------:|
| `ProductCard.tsx` | OK |
| `ProductGrid.tsx` | OK |
| `ProductDetail.tsx` | OK |
| `FilterBar.tsx` | OK |
| `CutBreadcrumb.tsx` | **FALTA** |

**auth/** (2 de 5):

| Componente | Estado |
|------------|:------:|
| `LoginForm.tsx` | OK |
| `ProtectedRoute.tsx` | OK |
| `RegisterForm.tsx` | **FALTA** |
| `ForgotPasswordForm.tsx` | **FALTA** |
| `ResetPasswordForm.tsx` | **FALTA** |

**checkout/** (1 de 5):

| Componente | Estado |
|------------|:------:|
| `CheckoutForm.tsx` | OK |
| `Cart.tsx` | **FALTA** (existe `CartDrawer.tsx` con funcionalidad similar) |
| `CartItem.tsx` | **FALTA** |
| `OrderSummary.tsx` | **FALTA** |
| `ReceiptUpload.tsx` | **FALTA** |

**customer/** (0 de 5):

| Componente | Estado |
|------------|:------:|
| `OrderCard.tsx` | **FALTA** |
| `OrderDetail.tsx` | **FALTA** |
| `TicketForm.tsx` | **FALTA** |
| `TicketThread.tsx` | **FALTA** |
| `ProfileForm.tsx` | **FALTA** |

**loading/** (0 de 2):

| Componente | Estado |
|------------|:------:|
| `SkeletonCard.tsx` | **FALTA** |
| `LoadingSpinner.tsx` | **FALTA** |

**Totales: 11 de 25 componentes existen (44%). Faltan 14.**

### 5.2 Componentes Extra (no en spec): ~59 archivos

Seleccion de los mas significativos:

| Componente | Proposito |
|------------|-----------|
| `Hero.tsx`, `Hero3DCanvas.tsx`, `ScrollLogoHero.tsx` | Heroes animados/3D |
| `AnimatedProductsCarousel.tsx`, `LatestProductsCarousel.tsx` | Carruseles |
| `FeaturedProductsGrid.tsx`, `HomeProductGrid.tsx` | Grids especiales |
| `ProductGallery.tsx`, `ProductLightbox.tsx` | Galeria de producto |
| `ProductPurchasePanel.tsx` | Panel de compra |
| `SizeGuideModal.tsx` | Guia de talles |
| `CartDrawer.tsx` | Carrito lateral (reemplaza Cart.tsx) |
| `SearchModal.tsx`, `MegaMenuPanel.tsx` | Navegacion |
| `BrandStoryHero.tsx`, `BrandManifestoModal.tsx` | Branding |
| `SocialStudioGrid.tsx`, `LookbookGallery.tsx` | Social/editorial |
| `CategoryGrid.tsx`, `CategoryShowcaseGrid.tsx` | Categorias |
| `NewsletterSection.tsx`, `CustomerReviewsSection.tsx` | Secciones |
| `background-paper-shaders.tsx`, `BodyShaderBackground.tsx` | Efectos visuales |

---

## 6. Hooks y State Management

### 6.1 Hooks

| Hook | Estado | Nota |
|------|:------:|------|
| `useAuth.ts` | OK | Zustand, interfaz correcta, usa `trece13_auth_token` |
| `useCart.ts` | OK | Zustand + persist, usa `clearCart()` (spec dice `clear()`) |
| `useFetch.ts` | OK | Hook custom, retorna `{ data, loading, error }` |
| `usePagination.ts` | **FALTA** | |
| `useLocalStorage.ts` | **FALTA** | Zustand persist lo reemplaza |

**Hooks extra** (no en spec):
- `useCatalog.ts`
- `useCatalogFilter.ts`

### 6.2 Archivos de Libreria (`src/lib/`)

| Archivo | Estado | Nota |
|---------|:------:|------|
| `lib/api.ts` | OK | Mock router + fetch real |
| `lib/config.ts` | OK | Estructura correcta, validacion relajada (warn vs throw) |
| `lib/auth.ts` | OK | `parseJWT`, `getStoredToken`, `setStoredToken`, `removeStoredToken` |
| `lib/cart.ts` | **FALTA** | Logica vive en `hooks/useCart.ts` |
| `lib/errors.ts` | **FALTA** | No hay utilidades centralizadas de error |
| `lib/constants.ts` | **FALTA** | Reemplazado por `lib/config.ts` |

**Archivos/directorios extra en lib/** (no en spec):

| Path | Proposito |
|------|-----------|
| `lib/adapters/product.ts` | Adaptador BackendProduct -> CatalogProduct |
| `lib/catalog/featured.ts` | Logica de seleccion para Bento Grid |
| `lib/catalogFilters.ts` | Logica de filtros del catalogo |
| `lib/images/constants.ts` | Placeholders de imagenes |
| `lib/images/resolve.ts` | Resolucion de imagenes por corte |
| `lib/images/slots.ts` | Gestion de slots de imagen |
| `lib/images/url.ts` | Normalizacion de URLs de imagen |
| `lib/services/catalog.ts` | Capa de datos del catalogo |
| `lib/utils.ts` | Utilidades (cn() para className) |

---

## 7. API Client (`src/lib/api.ts`)

### 7.1 Implementacion vs Spec

| Aspecto | Spec | Actual | Estado |
|---------|------|--------|:------:|
| Firma de `apiCall` | `apiCall(method, path, body, requireAuth)` | Identica | OK |
| HTTP client | `axios` | `fetch` nativo | DIVERGE |
| JWT en header | `Authorization: Bearer <token>` | Identico | OK |
| Base URL | `config.api.baseUrl` | Identico | OK |
| Error format | `throw new Error('API Error: ${error.message}')` | `throw new Error('HTTP Error ${status}: ${statusText}')` | DIVERGE |
| Mock fallback | No mencionado | `config.api.useMock` con handleMockRequest() | EXTRA |

### 7.2 Cobertura de Endpoints Mock

Todos los endpoints de la spec estan cubiertos por el mock router:

| Endpoint | Mock | Estado |
|----------|:----:|:------:|
| `GET /catalog` | OK | Con filtros cut/category |
| `GET /catalog/cuts` | OK | |
| `GET /catalog/:productId` | OK | |
| `POST /auth/login` | OK | |
| `POST /auth/register` | OK | |
| `POST /auth/forgot-password` | OK | |
| `POST /auth/reset-password` | OK | |
| `GET /me` | OK | |
| `PATCH /me` | OK | |
| `POST /me/password` | OK | |
| `POST /checkout` | OK | |
| `GET /checkout/:orderId` | OK | |
| `GET /me/orders` | OK | |
| `GET /me/orders/:orderId` | OK | |
| `POST /me/tickets` | OK | |
| `GET /me/tickets` | OK | |
| `GET /me/tickets/:ticketId` | OK | |
| `POST /me/tickets/:ticketId/messages` | OK | |

### 7.3 Config: Validacion de Env Vars

La spec dice que las variables faltantes deben hacer **throw** en build time. La implementacion usa `console.warn` con fallback a valores por defecto. **Incumplimiento.**

---

## 8. Capa de Adaptacion (NO esta en la spec)

El proyecto implemento una capa completa de traduccion entre el modelo real del backend y el modelo de vista de los componentes:

```
BackendProduct (types/backend.ts)
       |
       v
toCatalogProduct() (lib/adapters/product.ts)
       |
       v
CatalogProduct (types/api.ts) -- lo que usan los componentes
```

Esto incluye:
- **Resolucion de precios**: flash sale (PERCENTAGE/FIXED/OVERRIDE) > discountPercent
- **Aplanado de variantes**: mapa anidado -> array plano
- **Resolucion de imagenes**: por corte, con normalizacion de URLs
- **Calculo de stock status**: basado en suma total de variantes

Esta capa no estaba prevista en la spec pero existe porque **el backend real emite un payload diferente** al documentado en la spec.

---

## 9. Mocks y Tests (NO estan en la spec)

Existen directorios completos no mencionados en la spec:

- `src/mocks/` — auth.ts, catalog.ts, checkout.ts, toBackend.ts
- `src/__tests__/` — Tests para componentes y API

---

## 10. Resumen de Faltantes

### Lo que falta implementar (de la spec)

**Critico (funcionalidad de negocio):**
1. Flujo de registro (`RegisterForm`, ruta `/register`)
2. Flujo de forgot/reset password (`ForgotPasswordForm`, `ResetPasswordForm`, rutas)
3. Modulo de cliente completo: dashboard, orders, support, account (5 componentes + 4 rutas)
4. Componentes de checkout: Cart, CartItem, OrderSummary, ReceiptUpload
5. Componentes de loading: SkeletonCard, LoadingSpinner
6. Ruta de unsubscribe

**Infraestructura:**
7. Dockerfile y compose.yml (deploy containerizado)
8. .env.production y .env.staging
9. Dependencias: zod (validacion runtime), react-hook-form (formularios), prettier (formato)
10. Archivos: lib/errors.ts, lib/constants.ts, lib/cart.ts, types/form.ts
11. Hooks: usePagination, useLocalStorage
12. Directorio styles/ con CSS variables

### Lo que hay de mas (no en la spec)

**Arquitectura extra:**
1. Capa de adaptacion backend->frontend (`lib/adapters/`, `types/backend.ts`)
2. Sistema de imagenes (`lib/images/` con resolve, slots, url, constants)
3. Servicio de catalogo (`lib/services/catalog.ts`)
4. Mock data router completo en `lib/api.ts`
5. Directorio de mocks (`src/mocks/`)
6. Tests (`src/__tests__/`)

**Componentes extra (~59):**
7. Heroes animados y 3D (Hero3DCanvas, ScrollLogoHero, etc.)
8. Carruseles (AnimatedProductsCarousel, LatestProductsCarousel)
9. Galeria de producto (ProductGallery, ProductLightbox)
10. Panel de compra (ProductPurchasePanel, SizeGuideModal)
11. CartDrawer (reemplaza Cart.tsx de la spec)
12. Componentes de branding (BrandStoryHero, BrandManifestoModal, etc.)
13. Componentes sociales/editoriales (SocialStudioGrid, LookbookGallery)
14. Componentes UI/shaders (background-paper-shaders, BodyShaderBackground)
15. Navegacion avanzada (MegaMenuPanel, SearchModal, navData)

**Dependencias extra:**
16. framer-motion, three, @react-three/fiber (animaciones y 3D)
17. lucide-react (iconos)
18. sonner (toasts)
19. class-variance-authority, tailwind-merge (utilidades CSS)

**Divergencias tecnicas:**
20. Next.js 16 + React 19 (spec pide Next 14 + React 18)
21. Tailwind CSS v4 (spec pide v3)
22. Zustand v5 (spec pide v4)
23. fetch nativo en vez de axios
24. next.config.ts en vez de next.config.js
25. Validacion de env vars con console.warn en vez de throw

---

## Conclusion

El proyecto **cumple parcialmente** con la spec. Los contratos de tipos de la API estan alineados (superset compatible), los 3 hooks principales funcionan correctamente, y todos los endpoints estan cubiertos por mocks. Sin embargo, hay brechas significativas en componentes (44% implementado), rutas (sin route groups, modulos auth/customer/unsubscribe ausentes), infraestructura de deploy (sin Docker), y dependencias (stack actualizado 2 major versions por encima, 3 paquetes clave ausentes).

El proyecto evoluciono hacia una implementacion mas sofisticada que la spec en algunas areas (capa de adaptacion, sistema de imagenes, componentes visuales) mientras dejo sin implementar modulos completos de negocio (registro, recuperacion de password, panel de cliente, soporte).
