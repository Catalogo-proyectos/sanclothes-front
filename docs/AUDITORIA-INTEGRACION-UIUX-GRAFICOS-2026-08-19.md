# Auditoría de integración, UI/UX y plan de analíticas — 2026-08-19

Documento de seguimiento de una sesión de auditoría y remediación sobre los tres proyectos del ecosistema Santclothes:

- **`santclothesback/backend`** — API Fastify + Drizzle
- **`santclothesback/admin`** — panel admin, Next.js
- **`sanclothes-front`** (este repo) — storefront de cliente final, Next.js

> Nota: este documento se replica también en `santclothesback` (repo git independiente, `github.com/Catalogo-proyectos/santclothesback`), ya que las correcciones de esta sesión tocan ambos remotos.

---

## 1. Resumen ejecutivo

- Los tres proyectos están **efectivamente conectados** (no es una integración de fachada): admin y storefront apuntan al backend real, con CORS y JWT verificados en código, no solo en mensajes de commit.
- Se encontraron y corrigieron 4 problemas reales de integración (carrito de invitado no fusionado al login, validación de facturación incompleta en checkout, 3 pantallas de backend sin UI en el admin, campo teléfono no ofrecido en registro).
- El panel admin tiene deuda de diseño real: una paleta de colores Tailwind rota (~650 usos de clases inexistentes) y ausencia total de componentes UI compartidos (15 modales reimplementados a mano).
- El admin no tiene ningún gráfico real hoy (los íconos de gráfico son decorativos). Hay datos ya agregados por el backend (finanzas, órdenes) listos para 4-5 gráficos sin tocar el backend, y otros que requieren un endpoint de agregación nuevo (chico, mismo patrón ya usado).

---

## 2. Integración backend ↔ frontends (verificado en código, no solo en docs)

### 2.1 Admin (`santclothesback/admin`)

- `admin/src/lib/api.ts` apunta a `NEXT_PUBLIC_API_URL || 'http://localhost:5014/api'`, coincide con el backend real.
- `backend/src/app.ts` permite CORS explícito para los orígenes de admin (local y prod: `admin.santclothes.com.py`).
- `admin/src/middleware.ts` verifica la firma JWT real contra el mismo `JWT_SECRET` del backend — el bug histórico de "cualquier payload con `role: Administrador` pasaba" está corregido en código actual.
- **Riesgo pendiente (no corregido en esta sesión):** `admin/Dockerfile` corre `bun run build` sin pasar `NEXT_PUBLIC_API_URL` como build-arg. Next.js "hornea" esa variable en tiempo de build, no de runtime, así que el `environment:` de `docker-compose.yml` no tiene efecto sobre el bundle del navegador — en un deploy Docker real el admin podría seguir apuntando a `localhost:5014`. **Queda como pendiente para una próxima sesión.**
- `admin/.env` y `backend/.env` son archivos idénticos (admin tiene copiadas credenciales de Postgres/MinIO que no usa) — descuido de higiene, no una fuga nueva.

### 2.2 Storefront (`sanclothes-front`)

- `.env.local`: `NEXT_PUBLIC_USE_MOCK=false`, `NEXT_PUBLIC_API_URL=http://localhost:5014/api` — conectado a la API real, no a mocks.
- Este repo documenta en `docs/BACKEND-INTEGRATION.md` la migración de mocks a la API real, con una capa de adaptadores (`lib/adapters/product.ts`) porque el modelo de datos real del backend difiere del contrato originalmente documentado.
- Algunos hallazgos de `docs/BACKEND-INTEGRATION.md` (filtros de catálogo rotos, `isNewUser` inexistente) **ya estaban desactualizados** al momento de esta auditoría — se verificó en código que ya funcionan. Vale la pena revisar y actualizar ese doc para que no siga generando falsas alarmas.

---

## 3. Auditoría de contrato campo por campo (backend espera vs. frontend envía)

| Flujo | Backend espera | Frontend | Estado previo a esta sesión |
|---|---|---|---|
| Checkout — items/cliente/envío | `checkout.schema.ts` | `CheckoutForm.tsx` | OK |
| Checkout — `wantsClubMembership` (bool obligatorio) | ídem | Checkbox, siempre se envía | OK |
| Checkout — facturación (`invoiceData.{ruc,razonSocial,direccionFiscal}`, requeridos si `requestsInvoice=true`) | AJV exige las 3 subclaves | Inputs sin `required` en el HTML | **Roto** → corregido en esta sesión (ver §4) |
| Login/registro — `phone` (opcional) | acepta el campo | nunca se pedía en el form | Oportunidad perdida → corregido en esta sesión |
| Carrito de invitado → usuario logueado | `migrateGuestCartToUser()` definida pero nunca invocada | sin compensación en el front | **Roto** → corregido en esta sesión (ver §4) |
| Catálogo — filtros `priceMin/priceMax/isFeatured` | `catalog.routes.ts` | `catalog.ts` (storefront) | Funciona (doc del storefront decía lo contrario, estaba desactualizado) |
| Admin — endpoints backend sin UI | `revoke-sessions`, `branches/memberships`, `stock/:sku/breakdown`, `orders/items/:id/reassign-branch` | sin pantalla | **4 gaps** → corregidos en esta sesión (ver §4) |

---

## 4. Correcciones implementadas en esta sesión

### Backend (`santclothesback/backend`)
- `src/modules/auth/auth.routes.ts`: se invoca `migrateGuestCartToUser(email, userId)` en `POST /auth/login`, `POST /auth/register` y `POST /auth/google`, fusionando el carrito Redis del invitado (`cart:guest:{email}`) con el carrito del usuario logueado (`cart:user:{userId}`) al autenticarse. La función ya existía (`src/modules/cart/cart.routes.ts:132`), solo faltaba conectarla.

### Storefront (este repo)
- `src/components/checkout/CheckoutForm.tsx`: los campos RUC, Razón Social y Dirección Fiscal ahora tienen `required`/`minLength={1}` cuando el usuario solicita factura, evitando un 400 genérico del backend sin feedback de qué campo faltó.
- `src/components/auth/LoginForm.tsx`: se agregó el campo "Teléfono (opcional)" al formulario de registro, enviado como `phone` a `POST /auth/register`.

### Admin (`santclothesback/admin`)
- `src/lib/api.ts`: nuevas funciones cliente — `usersApi.revokeSessions`, `branchesApi.createMembership`, `branchesApi.updateMembership`, `branchesApi.stockBreakdown`, `ordersApi.reassignItemBranch`.
- `src/app/dashboard/users/page.tsx`: botón "Invalidar Sesiones Activas" por miembro del equipo (`POST /admin/users/:id/revoke-sessions`).
- `src/app/dashboard/inventory/branches/page.tsx`: sección "Membresías de Sucursal" — crear membresía (usuario + sucursal + rol) y editar por ID (no existe endpoint de listado en el backend, así que no se fabricó uno en el front).
- `src/app/dashboard/inventory/stock-by-branch/page.tsx`: modal de desglose de stock por sucursal para un SKU (`GET /admin/stock/:sku/breakdown`).
- `src/app/dashboard/orders/page.tsx`: modal "Reasignar sucursal" por ítem de orden, con validación de cantidad total y oculto en estados de orden no reasignables (evita chocar con el 409 `ORDER_NOT_REASSIGNABLE`).

Typecheck limpio (`tsc --noEmit`) en los tres proyectos tras los cambios.

---

## 5. Auditoría UI/UX del panel admin (pendiente de implementar)

*Solo auditoría — estos hallazgos todavía NO están corregidos, quedan para una próxima sesión. No aplica a este repo (storefront), se documenta acá solo para tener el contexto completo.*

### Crítico
1. **Paleta de colores Tailwind rota.** `admin/tailwind.config.ts` no extiende `theme.colors`, pero el código usa ~650 veces shades inexistentes (`zinc-850`, `zinc-650`, `zinc-450`, `red-650`, `amber-955`, etc.) que no generan ninguna regla CSS real. Hay un parche parcial en `globals.css` con `!important` que **solo cubre modo claro**, no modo oscuro (el tema principal del panel).
2. **Cero componentes UI compartidos.** No hay `Button`/`Modal`/`Badge`/`Table` reutilizables — 15 modales reimplementados a mano con estilos ligeramente distintos, badges de estado con 3 tonos de rojo distintos para el mismo dato en la misma tabla.

### Medio
3. Ningún modal se cierra con `Escape` (0 coincidencias en todo `admin/src`).
4. Cero `aria-label` en botones de solo-ícono de todo el dashboard.
5. 6 archivos usan `<img>` crudo en vez de `next/image` (`settings`, `products`, `ProductForm`, `crm`, `combos`, `catalog/bento-featured`).
6. `alt=""` vacío en una imagen no decorativa (`combos/page.tsx:546`).

### Bajo / cosmético
7. Anchos fijos en px (`w-[Npx]`) en 9 archivos, candidatos a overflow horizontal en mobile.
8. `customers/tiers/page.tsx` posiblemente sin estado vacío ("No hay...").
9. El design token declara `--radius: 0px` ("bordes estrictamente rectos") pero se usa `rounded-lg/xl/md/full` en decenas de lugares — el sistema documentado y el código divergieron.

**Recomendación:** resolver 1 y 2 juntos (migrar páginas al `Modal`/`Badge` compartido mientras se corrige la paleta es más eficiente que en dos pasadas). 3 y 4 son mecánicos y de bajo riesgo. 5-9 son incrementales.

---

## 6. Plan de gráficos/analíticas con datos reales (propuesta, no implementado aún)

**Librería:** no hay ninguna instalada en `admin/package.json`. Se recomienda **Recharts** (compatibilidad React 19/Next 15, se integra bien con Tailwind, soporte out-of-the-box para barras/líneas/áreas/circulares con tooltips).

### Listos hoy (el backend ya agrega los datos, no requiere backend nuevo)

| Sección | Endpoint real | Datos | Gráfico sugerido |
|---|---|---|---|
| Finanzas | `GET /admin/accounting/summary` | `monthlyTrend: [{month, revenue, count}]` (6 meses) | Línea/área de ingresos mensuales |
| Finanzas | ídem | `expensesByCategory: [{category, total}]` | Circular (pie) de gastos por categoría |
| Finanzas | ídem | `totalRevenue, totalCOGS, grossProfit, grossMarginPct, netProfit` | Barras comparativas ingreso/costo/ganancia o tarjetas KPI |
| Finanzas → Productos | `GET /admin/accounting/products/profitability` | Por producto: `{name, unitsSold, revenue, grossProfit, marginPct}` | Barras horizontales — top productos por ganancia/unidades |
| Órdenes | `GET /admin/orders/summary` | Conteo de órdenes agrupado por `status` | Circular o barras — órdenes por estado |
| Órdenes | ídem | Top productos por cantidad vendida (SKU/talle) | Barras — bestsellers |

### Requieren un endpoint de agregación nuevo (dato base existe, agregación no)

- **Altas de clientes por período** — tabla `users` tiene `createdAt`, falta un `groupBy` tipo `monthlyTrend` de accounting.
- **Distribución de clientes por tier** — modelo de tiers existe, falta `COUNT... GROUP BY tier`.
- **Stock total por sucursal** — `product_branch_stock` tiene el dato crudo, falta `SUM(stock) GROUP BY branch_id`.
- **CRM/marketing** (aperturas de campaña, funnel de segmentos) — no se confirmó si ya hay agregaciones; requiere una pasada específica sobre `modules/crm/` antes de prometer alcance ahí.

**Conclusión:** el punto de partida obvio es **Finanzas + Órdenes** — 4 a 5 gráficos reales sin tocar el backend. El resto es factible con endpoints chicos siguiendo el mismo patrón Drizzle `groupBy` ya usado en `accounting.routes.ts`.

---

## 7. Próximos pasos sugeridos

1. Implementar el plan de gráficos de Finanzas + Órdenes (§6) con Recharts.
2. Resolver la paleta de colores rota + extraer componentes UI compartidos (§5, puntos 1-2).
3. Decidir si se escriben los endpoints de agregación nuevos (clientes por período, tiers, stock por sucursal) para una segunda tanda de gráficos.
4. Resolver el riesgo de `NEXT_PUBLIC_API_URL` en el build Docker del admin (§2.1) antes del próximo deploy de producción.
5. Actualizar `docs/BACKEND-INTEGRATION.md` (este repo) para quitar los hallazgos ya resueltos (filtros de catálogo, `isNewUser`) que generan falsas alarmas.
