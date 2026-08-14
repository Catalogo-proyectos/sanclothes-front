# ESTILO SANT CLOTHES

Guía de estilo del storefront. **Todo lo que está acá está extraído del código, no propuesto**: los valores salen de `src/app/globals.css`, `src/app/layout.tsx` y del recuento de uso real en los ~60 componentes de `src/components/`. Si un número aparece acá, aparece en el código.

Sirve para dos cosas: entender por qué la página se ve como se ve, y construir componentes nuevos que no desentonen.

---

## 1. El carácter

Cuatro decisiones sostienen todo lo demás. Si tenés que elegir en una pantalla nueva, elegí en esta dirección:

| Decisión | En la práctica |
|:--|:--|
| **Editorial antes que catálogo** | La foto manda. El catálogo no es una grilla plana de 4 columnas: son bandas donde un panel de campaña grande alterna de lado contra un bloque 2×2 de prendas. El ojo zigzaguea. |
| **Superficie plana** | Sin esquinas redondeadas, sin sombras decorativas, sin degradados de relleno. El único `box-shadow` estructural del sitio es el del Footer Reveal. |
| **La marca habla en mayúsculas** | 395 usos de `uppercase`. Los títulos son condensados; los metadatos, monoespaciados y espaciados. |
| **Contraste, no color** | Casi todo es `#17191c` sobre `#f6f8f9`. El color se lo pone la ropa. |

---

## 2. Paleta

La paleta oficial vive en `:root` de [globals.css](../src/app/globals.css) con sus equivalencias de impresión, porque es la misma de la identidad de marca.

| Token | Hex | RGB | CMYK | Uso |
|:--|:--|:--|:--|:--|
| `--brand-dark` | `#17191c` | 23 25 28 | 75 / 67.5 / 62.5 / 77.5 | Texto, botones sólidos, paneles de hover. **374 usos** |
| `--brand-light` | `#f6f8f9` | 246 248 249 | 2.5 / 1 / 1 / 0 | Fondo de `body` y de `main`. **114 usos** |
| `--brand-slate` | `#50524a` | 80 82 74 | 62.5 / 52.5 / 62.5 / 37.5 | Texto secundario, eyebrows. **112 usos** |
| `--brand-taupe` | `#b6b2a7` | 182 178 167 | 30 / 25 / 32.5 / 0 | Bordes y separadores. **100 usos** |

**El negro de la marca no es negro.** `#17191c` tiene una caída azulada mínima; `#000000` puro solo aparece en el toast y en un par de overlays. No los mezcles en la misma vista.

### Neutros de apoyo

No están en la paleta oficial pero se usan de forma consistente y conviene respetarlos: `zinc-200` para bordes de card en reposo, `zinc-500/600` para texto de apoyo sobre claro, `zinc-300/400` para texto de apoyo sobre oscuro, y `#f6f6f6`/`#f8f8f8` para el lienzo interno de las cards de producto.

### Opacidades canónicas

En vez de inventar grises intermedios, la página baja la opacidad del color de marca:

```
border-[#17191c]/10   separadores sobre fondo claro
border-[#17191c]/15   bordes de estado vacío (punteados)
text-[#17191c]/35     texto terciario
text-[#17191c]/40     conteos y captions
border-white/10 · /15 · /20   separadores sobre foto o fondo oscuro
```

---

## 3. Tipografía

Tres voces, y cada una tiene un trabajo. Mezclarlas mal es la forma más rápida de que algo "no parezca de Sant".

### 3.1 Bebas Neue — la voz de la marca

Cargada por `next/font` en [layout.tsx](../src/app/layout.tsx) como `--font-bebas`, peso 400 único. Se usa vía `font-[family-name:var(--font-bebas)]` (93 usos).

Condensada y en mayúsculas. **Solo para titulares**: heros, títulos de sección, precio grande de la ficha, texto de botones importantes. Nunca para párrafos ni para etiquetas chicas — a 10px se vuelve ilegible.

Siempre con tracking abierto, entre `0.04em` y `0.08em`, y `leading-none` en tamaños grandes.

```tsx
<h1 className="text-3xl sm:text-4xl xl:text-5xl font-[family-name:var(--font-bebas)]
               uppercase tracking-[0.05em] leading-[0.95]">
```

### 3.2 Helvetica Neue — la voz del contenido

Es la fuente del `body`, definida como pila de sistema en `--font-sans`: `'Helvetica Neue', Helvetica, Arial, -apple-system, …`. Cero costo de red.

Para descripciones, párrafos y títulos de card. En títulos de card va **`font-extrabold` o `font-black` con `tracking-tight`** — apretada, lo opuesto al tracking abierto de las etiquetas.

### 3.3 Monoespaciada — la voz técnica

**Es la más usada del sitio: 248 usos de `font-mono`.** Es lo que le da el aire de ficha técnica de atelier.

Todo lo que es *dato sobre la prenda* va en mono: eyebrows, composición del tejido, talles, SKU, precios chicos, conteos, badges de estado, breadcrumbs. Siempre chica, en mayúsculas y muy espaciada.

```tsx
<span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500">
  240G ALGODÓN HEAVYWEIGHT
</span>
```

### 3.4 Escala real

Lo que revela el recuento: **la página vive en los tamaños chicos**. Los titulares son pocos y grandes; todo lo demás es 9-12px.

| Tamaño | Usos | Rol |
|:--|--:|:--|
| `text-xs` (12px) | 148 | Etiquetas y controles |
| `text-[10px]` | 106 | Metadatos mono |
| `text-[11px]` | 81 | Botones, nav, badges |
| `text-[9px]` | 33 | Eyebrows, tags de card |
| `text-sm` (14px) | 42 | Título de card, descripción corta |
| `text-3xl` → `text-7xl` | 133 | Titulares Bebas |

Por debajo de 12px **siempre** hay `font-bold` o `font-black` + `uppercase` + tracking ≥ `0.18em`. Sin eso el texto chico se cae.

### 3.5 Tracking

| Valor | Uso |
|:--|:--|
| `tracking-tight` | Títulos de card en Helvetica |
| `0.05em` – `0.08em` | Titulares Bebas |
| `0.12em` – `0.16em` | Botones y CTAs |
| `0.18em` – `0.2em` | Metadatos mono (**el más frecuente**) |
| `0.25em` – `0.3em` | Eyebrows de sección |

Regla simple: **cuanto más chico el texto, más abierto el tracking.**

### 3.6 Números

Precios y conteos llevan `tabular-nums`, para que no bailen al cambiar de talle o de cantidad. La moneda se formatea siempre con `formatCurrency()` de [utils/format.ts](../src/utils/format.ts) → `Gs. 150.000`. Nunca escribas el símbolo a mano.

---

## 4. Esquinas: 0px

**66 declaraciones explícitas de `borderRadius: '0px'`.** No es una omisión, es la regla: cards, botones, inputs, badges, modales y toasts tienen esquina viva.

Las únicas excepciones legítimas son elementos que ya nacen circulares (avatar, botón de wishlist redondo, dots de carrusel) con `rounded-full`. Los `rounded-xl`/`2xl`/`3xl` que quedan sueltos son deuda de componentes viejos, no un patrón a copiar.

> Al escribir un componente nuevo: si dudás, `rounded-none`.

---

## 5. Layout

**Contenedores.** `max-w-[1440px]` para catálogo y ficha de producto; `max-w-7xl` (1280px) para las secciones de home. Padding lateral `px-4 sm:px-6 lg:px-8`.

**Ritmo vertical.** Secciones de home `py-20`; bandas de catálogo `py-12 sm:py-16` con `gap-16 sm:gap-20 lg:gap-24` entre ellas. La página respira mucho entre bloques y poco dentro de ellos.

**Relación de aspecto.** `aspect-[3/4]` es *la* proporción de producto — 24 usos, la comparte la card de grilla, la del carrusel y la del héroe de galería. Los paneles editoriales usan `4/5` o `16/9`. **No mezcles proporciones dentro de una misma grilla**: es lo que hace que una fila se vea rota.

**Grillas.** Progresión `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` para producto (a 768px una grilla de 2 columnas estira la card muy por encima de lo que la 3:4 tolera), `md:grid-cols-5` para las grillas densas de home. Gaps `gap-4 sm:gap-6`.

---

## 6. Componentes canónicos

### 6.1 Botones

Tres utilidades en `globals.css`, todas con la misma métrica: **13px, peso 500, `0.05em`, uppercase, padding `12px 28px`, borde de 1px, `transition: all .25s ease`**.

| Clase | Reposo | Hover |
|:--|:--|:--|
| `.btn-mono-solid` | negro de marca sobre claro | `#27272a` |
| `.btn-mono-outline` | transparente, borde oscuro | invierte a sólido |
| `.btn-mono-outline-white` | transparente, borde blanco 80% | invierte a blanco |

El botón de acción dentro de card usa Bebas a 11px con `tracking-[0.12em]` y `active:scale-[0.98]`.

### 6.2 Card de producto — el componente más importante

Está en [ProductCard.tsx](../src/components/catalog/ProductCard.tsx) y define el lenguaje del resto:

1. **Contenedor de imagen** `aspect-[3/4]`, fondo `#f6f6f6`, borde `zinc-200` que pasa a negro en hover (300ms).
2. **Dos imágenes cruzadas.** La de hover va **primero en el DOM** para quedar debajo; la principal se desvanece encima (`group-hover:opacity-0`, 500ms) mientras la de abajo escala a 1.05 (700ms). Con una sola foto, la segunda capa no se monta.
3. **Sustitución del bloque inferior.** En reposo: eyebrow del tejido, título y precio. En hover, ese bloque se va hacia arriba y **en su lugar entra un panel oscuro** con selector de talles y "AÑADIR AL CARRITO". No es un overlay sobre la foto: ocupa exactamente el espacio del texto, así la altura de la card nunca cambia.

Ese patrón —*información en reposo, acción en hover, sin desplazar nada*— es el que hay que replicar en cualquier card nueva.

### 6.3 Badges y chips

Texto mono de 9-10px, `uppercase`, tracking `0.2em`, padding `px-3 py-1`, borde de 1px, esquina viva.

- **Neutro**: fondo blanco, borde `#17191c/15`.
- **Activo/seleccionado**: fondo `#17191c`, texto blanco.
- **Alerta de stock**: `bg-amber-500/10`, texto `amber-900`, borde `amber-500/40`, con ícono `Zap` pulsante.
- **Agotado**: `zinc-200` sobre `zinc-600`.

### 6.4 Toasts

Configurados una sola vez en [layout.tsx](../src/app/layout.tsx): abajo a la derecha, fondo negro puro, texto blanco, 11px peso 600, uppercase, `0.05em`, radio 0. Se disparan con `sonner` y llevan ícono de `lucide-react` cuando la acción lo amerita.

### 6.5 Scrollbar

6px de ancho, riel blanco, pulgar `#e4e4e7` que oscurece a `#a1a1aa`. Delgada y sin contraste, para no competir con la foto.

---

## 7. Movimiento

**Duraciones**, por frecuencia de uso real:

| Duración | Para qué |
|:--|:--|
| `200ms` | Cambios de color y borde |
| `300ms` | El caballo de batalla — hovers, aparición de paneles (75 usos) |
| `500ms` | Cruce de opacidad entre imágenes |
| `700ms` | Escalado de foto en hover |
| `1000ms` | Entradas de sección al hacer scroll |

**Curvas.** La firma del sitio es `[0.16, 1, 0.3, 1]` (14 usos) — un *ease-out* muy pronunciado: arranca rápido y frena largo. Se usa en entradas con framer-motion. La alternativa es `cubic-bezier(0.25,1,0.5,1)`. **No uses `ease-in-out` por defecto**: aplana el carácter.

**Entrada de sección.** El patrón es siempre el mismo: `initial={{ opacity: 0, y: 20-25 }}` → `whileInView` → `viewport={{ once: true }}`, con `delay` escalonado de `0.08`–`0.1s` por índice.

**Marquee.** `35s linear infinite`, definido como `--animate-marquee` en el tema. La versión inversa existe para bandas contrapuestas.

**Header.** Se esconde al bajar (a partir de 80px de scroll, con umbral de 10px) y reaparece al subir. Está throttleado con `requestAnimationFrame` y escucha con `{ passive: true }` — copiá ese patrón si agregás otro listener de scroll.

**Footer Reveal.** El `<main>` es opaco, tiene `z-10` y una sombra `0 25px 50px -12px rgba(0,0,0,0.25)`; se desliza por encima del footer fijo. El hueco que deja al final lo dibuja el propio `<Footer />` para que siempre coincida con su altura real.

**Reduced motion.** `useReducedMotion()` de framer-motion ya está respetado en el hero de catálogo, la grilla y el rail de chips. Cualquier animación nueva de entrada tiene que consultarlo.

---

## 8. Accesibilidad

Ya hay un estándar aplicado; sostenelo:

- **Foco visible**: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]` (y `outline-white` sobre fondo oscuro). Nunca `outline-none` sin reemplazo.
- **Área táctil**: los enlaces de texto llevan `py-1.5` para llegar al mínimo táctil sin cambiar la línea base visual.
- **Imágenes**: el `alt` sale de la capa de imágenes ([lib/images/resolve.ts](../src/lib/images/resolve.ts)), que describe la vista y el corte. No lo escribas a mano en la card.
- **Estado en vivo**: el contador de piezas del catálogo usa `aria-live="polite"`.
- **Grupos de opciones**: los talles son `role="radiogroup"` con `aria-labelledby`; el selector de corte usa `aria-pressed`.
- **Decorativo**: `aria-hidden="true"` en flechas y separadores.

---

## 9. Voz del texto

- **Mayúsculas** para todo lo que sea etiqueta, botón o título. Frases y descripciones en caja normal.
- **Español rioplatense/paraguayo**: *vos*, *tenés*, *elegí*, *andá*. Nunca *tú* ni *usted*.
- **Precios** siempre `Gs. 150.000` vía `formatCurrency()`.
- **Vocabulario de atelier**: gramaje (`240G`, `400G`), tejido (`ALGODÓN HEAVYWEIGHT`, `GAMUZA`), fit (`OVERSIZED`, `BOXY FIT`), drop (`DROP #01`, `EDICIÓN LIMITADA`). El dato técnico **es** la decoración.
- **Sin signos de exclamación** salvo en confirmaciones de acción (`¡AÑADIDO AL CARRITO!`) y urgencia de stock.

---

## 10. Qué no hacer

| No | Por qué |
|:--|:--|
| Esquinas redondeadas en cards, botones o inputs | Rompe la regla estructural de superficie plana |
| Sombras decorativas | La única sombra del sitio es estructural (Footer Reveal) |
| Un color de acento nuevo | El color lo pone la ropa; la interfaz es monocroma |
| Bebas por debajo de 14px | Ilegible en condensada |
| Mono para párrafos | Es la voz del dato, no del contenido |
| Texto <12px sin bold + uppercase + tracking | Se cae visualmente |
| Mezclar proporciones dentro de una grilla | Es lo que hace que una fila se vea rota |
| `ease-in-out` genérico | Aplana el carácter; usá `[0.16, 1, 0.3, 1]` |
| Imágenes de stock como fallback | Muestra ropa que no es de la marca; usá el placeholder local |
| Escribir `Gs.` a mano | Usá `formatCurrency()` |

---

## 11. Checklist para un componente nuevo

1. ¿Esquinas en 0? ¿Sin sombra?
2. ¿Los titulares en Bebas con tracking abierto, y los metadatos en mono chico y muy espaciado?
3. ¿El texto chico tiene bold + uppercase + tracking ≥ 0.18em?
4. ¿Las fotos de producto en `aspect-[3/4]`?
5. ¿Las transiciones en 300ms, y las entradas con `[0.16, 1, 0.3, 1]` + `viewport={{ once: true }}`?
6. ¿Los colores salen de los cuatro de marca o de sus opacidades?
7. ¿Hay `focus-visible` con anillo de 2px y offset?
8. ¿Los precios pasan por `formatCurrency()` y llevan `tabular-nums`?
9. ¿Las imágenes salen de la capa de slots y no de una URL armada a mano?
10. ¿El hover agrega acción sin cambiar la altura del bloque?

---

## Referencia rápida

```css
/* Colores */
#17191c  oscuro de marca (texto, sólidos)
#f6f8f9  fondo
#50524a  texto secundario
#b6b2a7  bordes

/* Tipografía */
Bebas Neue          titulares, uppercase, tracking 0.05em
Helvetica Neue      contenido; títulos de card font-black tracking-tight
mono 9-11px         metadatos, uppercase, tracking 0.2em

/* Estructura */
radio 0px · aspect-[3/4] · max-w-[1440px] / max-w-7xl · px-4 sm:px-6 lg:px-8

/* Movimiento */
300ms hover · 700ms escalado de foto · cubic-bezier(0.16, 1, 0.3, 1)

/* Foco */
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17191c]
```
