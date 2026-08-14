import { PLACEHOLDER_ALT, PLACEHOLDER_PRODUCT } from './constants';

/**
 * Reparto de imágenes en slots.
 *
 * El backend no marca el rol de cada foto: el rol ES la posición dentro del
 * array del corte, según la convención de backend/IMAGE_MANAGEMENT.md:240-253
 * (0 principal · 1 segunda vista · 2 detalle · 3 lifestyle · 4+ extras). El admin
 * controla ese orden subiendo las fotos en secuencia dentro de cada corte.
 *
 * Trabaja sobre la forma mínima `{ url, alt }` para servir por igual al
 * adaptador (que parte del payload crudo) y a los componentes (que ya reciben
 * `ProductImage[]` normalizado).
 */
export interface SlotImage {
  url: string;
  alt: string;
}

export const PLACEHOLDER_SLOT: SlotImage = {
  url: PLACEHOLDER_PRODUCT,
  alt: PLACEHOLDER_ALT,
};

/**
 * Toma el slot `index`.
 *
 * Si el producto tiene menos fotos que slots, cicla en vez de repetir siempre la
 * primera: una galería de 4 huecos con 2 fotos queda A-B-A-B y no A-A-A-A. Lo
 * único que garantiza el admin es que cada corte con variantes tenga al menos
 * una foto (validado en ProductForm.tsx:579-593 y products.routes.ts:170-174),
 * así que del slot 1 en adelante hay que asumir que puede faltar.
 */
export function pickSlot<T extends SlotImage>(images: T[], index: number): T | SlotImage {
  if (images.length === 0) return PLACEHOLDER_SLOT;
  return images[index % images.length];
}

export interface CardSlots<T extends SlotImage = SlotImage> {
  main: T | SlotImage;
  hover: T | SlotImage;
  /** Cantidad real de fotos: con una sola no tiene sentido cruzar el hover. */
  count: number;
}

/** Slots de la card de grilla: imagen principal + imagen de hover. */
export function cardSlots<T extends SlotImage>(images: T[]): CardSlots<T> {
  return {
    main: pickSlot(images, 0),
    hover: pickSlot(images, images.length > 1 ? 1 : 0),
    count: images.length,
  };
}

export interface GallerySlots<T extends SlotImage = SlotImage> {
  all: T[];
  hero: T | SlotImage;
  smallPair: [T | SlotImage, T | SlotImage];
  bottomHero: T | SlotImage;
  extras: T[];
}

/**
 * Slots de la galería de ficha, en el orden que espera ProductGallery:
 * héroe grande, par de dos chicas, héroe inferior y extras en grid de 2 columnas.
 */
export function gallerySlots<T extends SlotImage>(images: T[]): GallerySlots<T> {
  return {
    all: images,
    hero: pickSlot(images, 0),
    smallPair: [pickSlot(images, 1), pickSlot(images, 2)],
    bottomHero: pickSlot(images, 3),
    extras: images.slice(4),
  };
}

/** Slot único: Bento, grillas de home y carruseles. */
export function heroSlot<T extends SlotImage>(images: T[]): T | SlotImage {
  return pickSlot(images, 0);
}
