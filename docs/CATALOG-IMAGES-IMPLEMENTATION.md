# Implementación del Catálogo — Sistema de Imágenes por Slot

> **Objetivo**: que el front reciba del backend la imagen correcta para cada card/slot (card de grilla, hover, galería de ficha, héroe de Bento, panel de campaña) en vez de las imágenes locales hardcodeadas de hoy.
> **Fuentes verificadas**: `backend/src/db/schema/products.ts`, `backend/src/modules/catalog/catalog.service.ts`, `backend/src/modules/admin/products/products.routes.ts`, `backend/src/modules/admin/images/images.routes.ts`, `backend/src/lib/minio.ts`, `backend/IMAGE_MANAGEMENT.md`, `admin/src/app/dashboard/products/components/ProductForm.tsx`, `admin/src/app/dashboard/catalog/bento-featured/page.tsx`.
> Complemento de [BACKEND-INTEGRATION.md](BACKEND-INTEGRATION.md) (capa HTTP, tipos y adaptadores generales).

---

## 1. Resumen: qué tiene resuelto el backend

Sí, el backend ya tiene el sistema armado. Estas son las tres piezas y **una sola cosa está desconectada**:

| Pieza | Dónde vive | ¿Llega al front hoy? |
|:--|:--|:--:|
| **Imágenes agrupadas por corte** (`imagesByCut`) | `products.images_by_cut` (JSONB) → Redis → `GET /api/catalog` | ✅ **Sí** |
| **Array plano legacy** (`images`) | `products.images` (JSONB) → Redis → `GET /api/catalog` | ✅ **Sí** |
| **Marca de destacado para el Bento 2×2** (`isFeatured`) | `products.is_featured` (boolean), toggleado desde el admin en *Catálogo → Bento Grid / Destacados 2×2* | ❌ **No** — `catalog.service.ts` no lo copia a Redis |

**Traducción**: las fotos ya te llegan y son suficientes para alimentar todos los slots. Lo único que falta es un fix de **una línea** en el backend para que `isFeatured` viaje al front (§9). Todo lo demás es trabajo del front: **elegir qué índice de qué array va a qué slot**.

---

## 2. Cómo el backend guarda las imágenes

### 2.1 Las dos estructuras

`GET /api/catalog` y `GET /api/catalog/:productId` devuelven, por producto:

```jsonc
{
  "productId": "prod_trece_01",
  "slug": "camisa-oversized-beige",
  "name": "Camisa Oversized Beige",

  // (A) FUENTE DE VERDAD — agrupadas por corte
  "imagesByCut": {
    "CLASSIC":   ["https://cdn.trecepy.com/catalog/1704067200000-frente.jpg",
                  "https://cdn.trecepy.com/catalog/1704067200001-espalda.jpg",
                  "https://cdn.trecepy.com/catalog/1704067200002-detalle.jpg"],
    "OVERSIZED": ["https://cdn.trecepy.com/catalog/1704067200010-ov-frente.jpg",
                  "https://cdn.trecepy.com/catalog/1704067200011-ov-lifestyle.jpg"]
  },

  // (B) LEGACY — acumulado plano de todas las subidas, en orden cronológico
  "images": ["https://cdn.trecepy.com/catalog/1704067200000-frente.jpg", "…"],

  "availableCuts": ["CLASSIC", "OVERSIZED"],
  "variants": { "CLASSIC": { "M": { "sku": "CAM-BEI-M", "stock": 4 } } }
}
```

### 2.2 La convención de orden = el contrato de slots

`IMAGE_MANAGEMENT.md:240-253` fija el significado de la posición dentro de cada array. **Esta es la convención que el front tiene que respetar**:

```
imagesByCut[corte][0]  →  Imagen PRINCIPAL (thumbnail de card, héroe de galería, Bento)
imagesByCut[corte][1]  →  Segunda vista (imagen de HOVER en la card, primer slot chico de galería)
imagesByCut[corte][2]  →  Detalle
imagesByCut[corte][3]  →  Lifestyle / plano completo
imagesByCut[corte][4+] →  Extras de galería
```

No hay campo `role` ni `slot` en el backend: **el rol es la posición**. El admin controla el orden subiendo las fotos en secuencia dentro de la pestaña de cada corte (`ProductForm.tsx:502-528`).

### 2.3 Garantía que da el admin (aprovechable)

El formulario del admin **bloquea el guardado** si algún corte con variantes no tiene al menos una imagen (`ProductForm.tsx:579-593`), y el backend revalida (`products.routes.ts:170-174` y `389-393`).

> **Consecuencia útil para el front**: si un corte aparece en `availableCuts`, tiene garantizada **≥ 1 imagen** en `imagesByCut`. Podés asumir `imagesByCut[cut][0]` existe. Lo que **no** está garantizado es `[1]`, `[2]`, `[3]` — de ahí que toda la lógica de slots necesite fallback cíclico (§4.3).

### 2.4 ⚠️ `images` (legacy) se desincroniza — no usarlo como fuente

El admin agrega cada URL subida a **los dos** arrays (`ProductForm.tsx:516-521`), pero al borrar una foto usa el índice **relativo al corte seleccionado** y lo aplica también al array plano (`ProductForm.tsx:530-539`):

```ts
const handleRemoveImage = (indexToRemove: number) => {
  const currentImages = imagesByCut[selectedCut] || [];
  setImagesByCut(prev => ({ ...prev, [selectedCut]: currentImages.filter((_, i) => i !== indexToRemove) }));
  setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));   // ← índice del corte aplicado al array global
};
```

Si borrás la 1ª foto del corte `OVERSIZED`, del array `images` desaparece la 1ª foto de **`CLASSIC`**. En productos multi-corte, `images` queda mezclado y desalineado.

> **Regla del front**: **`imagesByCut` es la fuente de verdad.** `images` se usa **solo** como fallback para productos legacy que no tienen `imagesByCut` poblado (el propio admin los migra a `{ CLASSIC: images }` al abrirlos, `ProductForm.tsx:327-333`).

### 2.5 Las URLs son absolutas y cambian según el entorno

`lib/minio.ts:135-186` genera **tres formas distintas** según cómo esté configurado el backend:

| Escenario | URL generada |
|:--|:--|
| `CDN_URL` definido (producción) | `https://cdn.trecepy.com/catalog/1704067200000-foto.jpg` |
| MinIO sin CDN (dev con docker) | `http://localhost:5012/catalog/1704067200000-foto.jpg` |
| MinIO caído → fallback a disco | `http://localhost:5014/uploads/catalog/1704067200000-foto.jpg` |

La URL **se congela en la DB al momento de subir**. Un producto sembrado en dev conserva `localhost:5012` aunque después lo mires en producción, y viceversa. El propio backend ya sufrió esto: el mock de `/shop-api` reescribe `cdn.trecepy.com → localhost:5014` a mano (`app.ts:293-296`) — pero **`GET /api/catalog` no reescribe nada**.

> **Regla del front**: toda URL de imagen pasa por `normalizeImageUrl()` (§4.1) antes de llegar a `next/image`.

### 2.6 `isFeatured` y la pantalla de Bento del admin

El admin tiene una pantalla dedicada — *Catálogo → Bento Grid / Destacados 2×2* (`admin/src/app/dashboard/catalog/bento-featured/page.tsx`) — con búsqueda, contador ("Recomendado: 4 productos para la grilla 2×2") y un botón por producto que hace:

```ts
await productsApi.update(productId, { isFeatured: !currentFeatured });
```

El campo existe en la DB (`products.ts:40`) y `products.routes.ts:76` lo acepta. **El único eslabón roto** es que `catalog.service.ts:129-159` no lo incluye en el objeto que escribe a Redis, así que `GET /api/catalog?isFeatured=true` filtra sobre `undefined` y **siempre devuelve `[]`** (`catalog.routes.ts:62-66`). Fix en §9.

---

## 3. Los slots del front

Inventario de cada lugar del front que consume una imagen de producto, con lo que necesita:

| Componente | Slot | Necesita | Estado hoy |
|:--|:--|:--|:--|
| `catalog/ProductCard.tsx:30-31` | card de grilla | `[0]` principal + `[1]` hover | ⚠️ fallback a Unsplash |
| `catalog/ProductGallery.tsx:29-32` | ficha de producto | `[0]` héroe · `[1][2]` par chico · `[3]` héroe inferior · `[4+]` extras | ✅ recibe array, mal alimentado |
| `catalog/ProductLightbox.tsx` | zoom | array completo | ✅ |
| `catalog/ProductPurchasePanel.tsx` | miniaturas del panel | array completo | ✅ |
| `catalog/ProductGrid.tsx:29-85` | paneles de campaña entre bandas | 1 imagen editorial por banda | ❌ hardcodeado `/img/hero/*` |
| `common/FeaturedProductsGrid.tsx:18-100` | grilla destacados | `[0]` por producto destacado | ❌ hardcodeado |
| `common/HomeProductGrid.tsx:21` | grilla de home | `[0]` + `[1]` | ✅ usa `/catalog` |
| `common/LatestProductsCarousel.tsx:18-70` | carrusel novedades | `[0]` | ❌ hardcodeado |
| `common/LookbookGallery.tsx:14-43` | lookbook | imagen editorial | ❌ hardcodeado (puede quedar local) |
| `common/CategoryShowcaseGrid.tsx` | héroes de categoría desktop/móvil | imagen editorial | ❌ hardcodeado (**dejar local**: son piezas de marca, no de producto) |

> **Criterio**: los slots **de producto** se alimentan del backend. Los slots **editoriales/de marca** (heroes de categoría, lookbook, paneles de campaña del catálogo) siguen siendo assets locales de `public/img/` — el backend no tiene dónde guardarlos. Si más adelante se quieren dinámicos, la vía es `/api/v1/settings` (§10).

---

## 4. Capa de resolución de imágenes en el front

Crear `src/lib/images/`. Toda decisión de "qué foto va en qué lugar" vive acá y **en ningún componente**.

### 4.1 `src/lib/images/url.ts` — normalización

```ts
import { config } from '@/lib/config';

/**
 * Las URLs de imagen se congelan en la DB al subirlas y traen el host del entorno
 * donde se subieron (cdn.trecepy.com | localhost:5012 | localhost:5014/uploads).
 * Ver lib/minio.ts:135-186 del backend. Acá las reapuntamos al host vigente.
 */
const KNOWN_HOSTS = [
  'https://cdn.trecepy.com',
  'https://cdn.trece13.com',
  'http://localhost:5012',
  'http://localhost:5014',
];

/** Host de media vigente. En prod = CDN real; en dev = el backend local. */
const MEDIA_ORIGIN = config.api.mediaOrigin; // ver §7.1

export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const clean = url.trim();
  if (!clean) return null;

  // Rutas relativas ya servidas por el propio front (assets locales)
  if (clean.startsWith('/')) return clean;

  // data: / blob: pasan tal cual
  if (clean.startsWith('data:') || clean.startsWith('blob:')) return clean;

  if (!MEDIA_ORIGIN) return clean;

  for (const host of KNOWN_HOSTS) {
    if (clean.startsWith(host)) {
      const path = clean.slice(host.length);
      return `${MEDIA_ORIGIN.replace(/\/$/, '')}${path}`;
    }
  }
  return clean;
}
```

### 4.2 `src/lib/images/constants.ts` — placeholders

```ts
/** Placeholder local. Nunca apuntar a Unsplash: en prod muestra ropa que no es de la marca. */
export const PLACEHOLDER_PRODUCT = '/img/placeholder-producto.webp';
export const PLACEHOLDER_ALT = 'Imagen no disponible';
```

> Hay que crear ese archivo en `public/img/`. Hoy `ProductCard.tsx:30` cae en una foto de Unsplash cuando falta la imagen — inaceptable en producción.

### 4.3 `src/lib/images/resolve.ts` — el núcleo

```ts
import type { BackendProduct } from '@/types/backend';
import { normalizeImageUrl } from './url';
import { PLACEHOLDER_PRODUCT } from './constants';

export interface ResolvedImage { url: string; alt: string; cut: string | null; }

/**
 * Devuelve las imágenes de un producto para un corte dado, ya normalizadas.
 * Prioridad: imagesByCut[cut] → imagesByCut[primer corte disponible] → images (legacy) → [].
 * `images` es solo fallback: se desincroniza al borrar fotos en el admin (ver doc §2.4).
 */
export function imagesForCut(p: BackendProduct, cut?: string | null): ResolvedImage[] {
  const byCut = p.imagesByCut ?? {};
  const cuts = p.availableCuts?.length ? p.availableCuts : Object.keys(byCut);

  const chosenCut =
    (cut && byCut[cut]?.length ? cut : null) ??
    cuts.find((c) => byCut[c]?.length) ??
    null;

  const raw = chosenCut ? byCut[chosenCut] : (p.images ?? []);

  return raw
    .map((url) => normalizeImageUrl(url))
    .filter((url): url is string => !!url)
    .map((url, i) => ({
      url,
      alt: buildAlt(p.name, chosenCut, i),
      cut: chosenCut,
    }));
}

function buildAlt(name: string, cut: string | null, index: number): string {
  const view = ['vista principal', 'vista trasera', 'detalle', 'vista completa'][index] ?? `vista ${index + 1}`;
  return cut && cut !== 'CLASSIC' ? `${name} — corte ${cut}, ${view}` : `${name} — ${view}`;
}

/**
 * Toma el slot `index`. Si no existe, cicla sobre las disponibles en vez de
 * repetir siempre la primera: una card con 2 fotos y 4 slots se ve variada.
 * Solo hay un corte garantizado con ≥1 foto (doc §2.3); el resto puede faltar.
 */
export function pickSlot(images: ResolvedImage[], index: number): ResolvedImage {
  if (images.length === 0) {
    return { url: PLACEHOLDER_PRODUCT, alt: 'Imagen no disponible', cut: null };
  }
  return images[index % images.length];
}

/** Slots de la card de grilla: principal + hover. */
export function resolveCardImages(p: BackendProduct, cut?: string | null) {
  const imgs = imagesForCut(p, cut);
  return {
    main:  pickSlot(imgs, 0),
    hover: imgs.length > 1 ? pickSlot(imgs, 1) : pickSlot(imgs, 0),
    count: imgs.length,
  };
}

/** Slots de la galería de ficha: héroe, par chico, héroe inferior, extras. */
export function resolveGallerySlots(p: BackendProduct, cut?: string | null) {
  const imgs = imagesForCut(p, cut);
  return {
    all: imgs,
    hero:       pickSlot(imgs, 0),
    smallPair: [pickSlot(imgs, 1), pickSlot(imgs, 2)],
    bottomHero: pickSlot(imgs, 3),
    extras:     imgs.slice(4),
  };
}

/** Slot del Bento: una sola imagen, la principal del corte por defecto. */
export function resolveBentoImage(p: BackendProduct) {
  return pickSlot(imagesForCut(p, null), 0);
}
```

### 4.4 Enganche con el adaptador

En `lib/adapters/product.ts` (de [BACKEND-INTEGRATION.md §4.2](BACKEND-INTEGRATION.md)), reemplazar el armado de `images` por la capa nueva, para que **todo el front reciba URLs ya normalizadas**:

```ts
import { imagesForCut } from '@/lib/images/resolve';

// dentro de toCatalogProduct():
const resolved = imagesForCut(p, null);          // corte por defecto
const images = resolved.map((r) => ({ url: r.url, alt: r.alt, cutVariant: r.cut as never }));
```

Y exponer el mapa completo para el cambio de corte en la ficha:

```ts
// añadir a CatalogProduct en src/types/api.ts
imagesByCut?: Record<string, Array<{ url: string; alt: string }>>;
```

```ts
// en toCatalogProduct():
imagesByCut: Object.fromEntries(
  (p.availableCuts ?? Object.keys(p.imagesByCut ?? {})).map((cut) => [
    cut,
    imagesForCut(p, cut).map((r) => ({ url: r.url, alt: r.alt })),
  ])
),
```

---

## 5. Slot por slot: qué cambiar en cada componente

### 5.1 `catalog/ProductCard.tsx` — card de grilla

```diff
-  const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
-  const hoverImage = product.images?.[1]?.url || mainImage;
+  const { main, hover } = useCardImages(product);   // hook fino sobre resolveCardImages
```

```tsx
<Image src={main.url}  alt={main.alt}  fill sizes="(max-width:639px) 50vw, (max-width:1023px) 33vw, 340px" quality={75} />
<Image src={hover.url} alt={hover.alt} fill sizes="(max-width:639px) 50vw, (max-width:1023px) 33vw, 340px" quality={75} />
```

Además, con un solo producto de una sola foto el hover parpadea al mismo frame. Cuando `count === 1`, **no renderizar la segunda capa** y dejar solo el `scale` del hover.

**Bonus del mismo cambio**: `ProductCard.tsx:34-36` hace `product.description.split('.')[0]` y el catálogo **no trae `description`** (§9, punto 2) → hoy siempre cae en el texto por defecto `'TEXTURA SUEDE & EMBROIDERED NOVA'`. Con el fix del backend el subtítulo pasa a ser real.

### 5.2 `catalog/ProductGallery.tsx` + `ProductDetail.tsx` — ficha

`ProductGallery` ya tiene el layout de slots resuelto (`:29-32`): héroe grande, par de dos chicas, héroe inferior, extras en grid 2 columnas. **No hay que tocar el componente**: hay que alimentarlo bien desde `ProductDetail`.

```diff
// ProductDetail.tsx:30-45
-  const galleryImages = useMemo(() => {
-    if (product.images && product.images.length > 0) { … }
-    return [{ url: 'https://images.unsplash.com/…', alt: … }];
-  }, [product.images, product.title]);
+  const [selectedCut, setSelectedCut] = useState<string | null>(product.cuts?.[0] ?? null);
+  const galleryImages = useMemo(
+    () => product.imagesByCut?.[selectedCut ?? ''] ?? product.images,
+    [product, selectedCut]
+  );
```

`ProductGallery` pide 4 slots pero un producto puede tener 2 fotos. `pickSlot` cicla, así que el layout nunca queda con huecos. Si preferís no repetir, condicionar el render del `bottomHero` a `images.length >= 4`.

### 5.3 Cambio de corte → swap del carrusel

Es el comportamiento que pide el doc del backend (§3.2 de `STOREFRONT-INTEGRATION.md`) y **el motivo por el que existe `imagesByCut`**:

```tsx
// en el selector de corte de ProductPurchasePanel
onSelectCut={(cut) => {
  setSelectedCut(cut);      // la galería se re-renderiza con imagesByCut[cut]
  setActiveIndex(0);        // volver a la principal del corte nuevo
}}
```

Precargar la principal del otro corte al hacer hover sobre el botón evita el flash blanco:

```tsx
<link rel="prefetch" as="image" href={product.imagesByCut?.[cut]?.[0]?.url} />
```

### 5.4 `common/FeaturedProductsGrid.tsx` y `LatestProductsCarousel.tsx`

Hoy tienen el array de productos escrito a mano con rutas `/img/hero/*`. Reemplazar la constante local por datos del backend manteniendo intacto el JSX:

```tsx
// FeaturedProductsGrid
const { data } = useFetch<BackendProduct[]>('GET', '/catalog');
const products = useMemo(
  () => selectFeatured(data ?? []).map((p) => ({
    id: p.productId,
    title: p.name,
    price: p.price,
    image: resolveBentoImage(p).url,      // ← el slot
    href: `/products/${p.productId}`,
  })),
  [data]
);
```

`LatestProductsCarousel` es igual pero ordenando por novedad: `fetchCatalog({ sort: 'newest' })` y `resolveCardImages(p).main.url`.

### 5.5 `catalog/ProductGrid.tsx` — bandas del catálogo

Las cards de cada bloque 2×2 salen del backend vía `ProductCard`. **Los paneles de campaña que separan las bandas quedan locales** (`/img/hero/*`, `/img/secciones/*`): son piezas editoriales, no producto.

Sacar el import de `MOCK_PRODUCTS` (`ProductGrid.tsx:11,112`) y mostrar un estado vacío real cuando `/catalog` devuelve `[]` — hoy enmascara un backend caído con datos falsos, que es la peor forma de fallar.

---

## 6. Bento Grid de destacados

### 6.1 El flujo completo

```
Admin  →  Catálogo → Bento Grid / Destacados 2×2  →  toggle
                     PATCH /api/admin/products/:id { isFeatured: true }
                                 ↓
                     products.is_featured = true   (PostgreSQL)
                                 ↓
                     syncCatalogToRedis()   ← ⚠️ ACÁ SE PIERDE isFeatured
                                 ↓
                     GET /api/catalog?isFeatured=true  →  []     ← el front no lo recibe
```

### 6.2 Selector con las reglas de fallback

Aislar la decisión en una función para cambiar una línea cuando el backend esté parcheado:

```ts
// src/lib/catalog/featured.ts
import type { BackendProduct } from '@/types/backend';

/**
 * Destacados del Bento 2×2. El admin los marca en Catálogo → Bento Grid.
 * TODO(backend): cuando catalog.service.ts propague isFeatured a Redis,
 * reemplazar el fallback por: return products.filter(p => p.isFeatured);
 */
export function selectFeatured(products: BackendProduct[]): BackendProduct[] {
  const flagged = products.filter((p) => (p as any).isFeatured === true);
  if (flagged.length > 0) return flagged;

  // Fallback mientras el flag no viaja: destacar drops limitados o con badge.
  return products.filter((p) => p.isLimitedDrop || !!p.badge).slice(0, 4);
}

/** Reglas de renderizado del doc del backend §4. */
export type BentoLayout =
  | { kind: 'none' }
  | { kind: 'hero-only';  hero: BackendProduct }
  | { kind: 'partial';    hero: BackendProduct; secondary: BackendProduct[] }
  | { kind: 'full';       hero: BackendProduct; secondary: BackendProduct[] };

export function bentoLayout(featured: BackendProduct[]): BentoLayout {
  if (featured.length === 0) return { kind: 'none' };                                  // no renderizar el bloque
  if (featured.length === 1) return { kind: 'hero-only', hero: featured[0] };           // solo el 2×2
  if (featured.length < 4)
    return { kind: 'partial', hero: featured[0], secondary: featured.slice(1) };        // héroe + los que haya
  return { kind: 'full', hero: featured[0], secondary: featured.slice(1, 4) };          // 1 héroe + 3 secundarios
}
```

### 6.3 Slots de imagen del Bento

| Slot | Fuente | `sizes` recomendado | Prioridad |
|:--|:--|:--|:--|
| Héroe 2×2 (`index 0`) | `resolveBentoImage(hero).url` | `(max-width:768px) 100vw, 50vw` | `priority` (candidato a LCP si está sobre el fold) |
| Secundario 1×1 (`index 1,2,3`) | `resolveBentoImage(p).url` | `(max-width:768px) 50vw, 25vw` | `loading="lazy"` |

El héroe puede aprovechar `imagesByCut[corte][3]` (el plano lifestyle) en vez de `[0]` si querés una composición más editorial en el bloque grande — es una línea en `resolveBentoImage`.

---

## 7. Configuración de `next/image`

### 7.1 `src/lib/config.ts`

```ts
api: {
  baseUrl: env.NEXT_PUBLIC_API_URL || 'http://localhost:5014/api',
  /** Host vigente de media. Si queda vacío, las URLs de la DB se usan tal cual. */
  mediaOrigin: env.NEXT_PUBLIC_MEDIA_ORIGIN || '',
},
```

```bash
# .env.local (dev, MinIO por docker)
NEXT_PUBLIC_MEDIA_ORIGIN=http://localhost:5012
# .env.production
NEXT_PUBLIC_MEDIA_ORIGIN=https://cdn.trecepy.com
```

### 7.2 `next.config.ts`

```ts
remotePatterns: [
  { protocol: 'https', hostname: 'cdn.trecepy.com' },
  { protocol: 'https', hostname: 'cdn.trece13.com' },       // productos viejos
  { protocol: 'http',  hostname: 'localhost', port: '5012' }, // MinIO dev
  { protocol: 'http',  hostname: 'localhost', port: '5014' }, // fallback /uploads
  { protocol: 'https', hostname: 'images.unsplash.com' },     // borrar al eliminar los mocks
],
```

Sin esto `next/image` tira `Invalid src prop … hostname is not configured`, y como las cards son client components el error aparece recién al renderizar.

### 7.3 Caché

Las URLs del backend llevan timestamp en el nombre (`1704067200000-foto.jpg`), o sea que **son inmutables**: una foto nueva es siempre una URL nueva. El `minimumCacheTTL: 31536000` que ya tenés en `next.config.ts` es correcto y seguro para estas imágenes.

---

## 8. Fallbacks y estados vacíos

| Situación | Comportamiento |
|:--|:--|
| Producto sin ninguna imagen | `PLACEHOLDER_PRODUCT` local — **nunca** Unsplash |
| Corte sin imágenes propias | cae al primer corte que sí tenga (`imagesForCut`) |
| Menos fotos que slots | `pickSlot` cicla sobre las disponibles |
| `/catalog` devuelve `[]` (Redis vacío) | estado vacío explícito, **no** `MOCK_PRODUCTS` |
| Imagen 404 en runtime | `onError` en el `<Image>` → cambiar a placeholder |

```tsx
// patrón para el 404 en runtime
const [src, setSrc] = useState(main.url);
<Image src={src} alt={main.alt} onError={() => setSrc(PLACEHOLDER_PRODUCT)} … />
```

> El caso "Redis vacío" es más frecuente de lo que parece: `catalog.service.ts:22-26` devuelve `[]` sin error si la key no existe. Con el backend recién levantado y sin haber guardado ningún producto desde el admin, el catálogo entero llega vacío y no es un bug del front.

---

## 9. 🔧 Fixes requeridos del lado backend

Los tres son en el mismo archivo y el mismo objeto: `backend/src/modules/catalog/catalog.service.ts:129-159`.

```diff
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
+   description: product.description,          // (2) hoy no llega: ficha y subtítulo de card vacíos
    category: product.category,
    dropType: product.dropType as 'DROP_01' | 'DROP_02' | 'ESPECIAL',
    price: product.basePrice,
    isDropActive: product.isDropActive,
+   isFeatured: product.isFeatured,            // (1) DESBLOQUEA EL BENTO GRID
    images: Array.isArray(product.images) ? product.images as string[] : [],
    imagesByCut: …,
```

Y en `catalog.routes.ts:47-60`, los filtros de precio comparan contra un campo que no existe en el objeto de Redis:

```diff
-       products = products.filter((p) => p.basePrice >= min);
+       products = products.filter((p) => p.price >= min);
-       products = products.filter((p) => p.basePrice <= max);
+       products = products.filter((p) => p.price <= max);
```

| # | Fix | Desbloquea |
|:--|:--|:--|
| 1 | `isFeatured` a Redis | **Bento Grid de destacados** — la pantalla del admin ya existe y hoy no tiene efecto en el storefront |
| 2 | `description` a Redis | subtítulo de la card, `<meta description>`, JSON-LD del producto |
| 3 | `price` en vez de `basePrice` en los filtros | `priceMin`/`priceMax`, hoy siempre devuelven `[]` |

Después de cualquier cambio en el service hay que **regenerar la caché**: guardar cualquier producto desde el admin dispara `syncCatalogToRedis()`, o correr el seed.

Opcional pero recomendable: alinear `handleRemoveImage` en `admin/.../ProductForm.tsx:530-539` para que borre del array legacy por URL y no por índice (§2.4).

---

## 10. Si más adelante querés imágenes editoriales dinámicas

Los heroes de categoría, el lookbook y los paneles de campaña del catálogo no tienen tabla propia en el backend. Dos caminos, de menor a mayor esfuerzo:

1. **`/api/v1/settings`** — ya existe y es público. Guardar claves tipo `hero_categoria_streetwear_desktop` con la URL de MinIO. Cero código de backend nuevo; solo hay que subir la imagen por `POST /api/admin/images/upload` y pegar la URL en settings. *(Ojo: hoy ese endpoint expone **todas** las settings al público — conviene whitelistear antes.)*
2. **Tabla `media_slots`** — `{ slot: 'hero_streetwear_desktop', url, alt, updatedAt }` con CRUD de admin. Es la solución correcta si el equipo va a rotar creatividades seguido.

Mientras tanto, los assets locales de `public/img/` son la opción correcta: son piezas de marca, se versionan con el código y tienen caché inmutable configurada.

---

## 11. Checklist de implementación

| # | Archivo | Acción |
|:--|:--|:--|
| 1 | `next.config.ts` | agregar los 4 hosts de media a `remotePatterns` |
| 2 | `.env.local` / `.env.production` | agregar `NEXT_PUBLIC_MEDIA_ORIGIN` |
| 3 | `src/lib/config.ts` | exponer `api.mediaOrigin` |
| 4 | `public/img/placeholder-producto.webp` | **crear** el asset |
| 5 | `src/lib/images/url.ts` | `normalizeImageUrl()` |
| 6 | `src/lib/images/constants.ts` | placeholders |
| 7 | `src/lib/images/resolve.ts` | `imagesForCut`, `pickSlot`, `resolveCardImages`, `resolveGallerySlots`, `resolveBentoImage` |
| 8 | `src/lib/adapters/product.ts` | usar `imagesForCut` + exponer `imagesByCut` normalizado |
| 9 | `src/types/api.ts` | agregar `imagesByCut` a `CatalogProduct` |
| 10 | `src/lib/catalog/featured.ts` | `selectFeatured` + `bentoLayout` |
| 11 | `catalog/ProductCard.tsx` | slots main/hover, sacar Unsplash, ocultar capa de hover si `count === 1` |
| 12 | `catalog/ProductDetail.tsx` | galería por corte + estado `selectedCut` |
| 13 | `catalog/ProductPurchasePanel.tsx` | emitir el cambio de corte hacia arriba |
| 14 | `catalog/ProductGrid.tsx` | sacar `MOCK_PRODUCTS`, estado vacío real |
| 15 | `common/FeaturedProductsGrid.tsx` | alimentar del backend con `selectFeatured` + `bentoLayout` |
| 16 | `common/LatestProductsCarousel.tsx` | alimentar con `sort=newest` |
| 17 | **backend** `catalog.service.ts` | los 2 campos del §9 |
| 18 | **backend** `catalog.routes.ts` | `price` en los filtros del §9 |

---

## 12. Testing

**`src/__tests__/lib/images.test.ts`** (nuevo) — es donde se concentra el riesgo:

- `normalizeImageUrl`: los 4 hosts conocidos → reapuntados · ruta relativa → intacta · `data:` → intacta · host desconocido → intacto · `null`/`''` → `null`.
- `imagesForCut`: corte pedido con fotos · corte pedido sin fotos → cae a otro · sin `imagesByCut` → usa `images` legacy · producto totalmente vacío → `[]`.
- `pickSlot`: array vacío → placeholder · índice 3 con 2 fotos → cicla a la 1ª · índice exacto → esa.
- `resolveGallerySlots`: con 1, 2, 4 y 7 fotos — ningún slot debe quedar `undefined`.
- `bentoLayout`: 0 → `none` · 1 → `hero-only` · 2 y 3 → `partial` · 5 → `full` con exactamente 3 secundarios.

**Verificación manual** con el backend levantado y al menos un producto con 2 cortes y ≥4 fotos por corte:

1. Card de grilla muestra `[0]` y cambia a `[1]` en hover.
2. Ficha: héroe + par chico + héroe inferior, sin huecos.
3. Cambiar de corte reemplaza **todas** las fotos de la galería.
4. Marcar 4 productos en *Catálogo → Bento Grid* del admin → aparecen en la portada (requiere el fix del §9).
5. Un producto con una sola foto no rompe ninguna vista.

```powershell
pnpm test
pnpm type-check
pnpm dev
```
