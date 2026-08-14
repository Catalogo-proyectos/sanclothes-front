import type { BackendProduct } from '@/types/backend';
import { normalizeImageUrl } from './url';
import { cardSlots, gallerySlots, heroSlot, type SlotImage } from './slots';

export interface ResolvedImage extends SlotImage {
  /** Corte del que salió la foto. `null` cuando viene del array legacy. */
  cut: string | null;
}

/** Descripciones alineadas con la convención de orden del backend. */
const SLOT_DESCRIPTIONS = ['vista principal', 'vista trasera', 'detalle', 'vista completa'] as const;

function buildAlt(productName: string, cut: string | null, index: number): string {
  const view = SLOT_DESCRIPTIONS[index] ?? `vista ${index + 1}`;
  return cut && cut !== 'CLASSIC' ? `${productName} — corte ${cut}, ${view}` : `${productName} — ${view}`;
}

/**
 * Imágenes de un producto para un corte, ya normalizadas al host de media vigente.
 *
 * Prioridad: imagesByCut[cut] → primer corte con fotos → images (legacy) → [].
 * El array legacy queda último porque se desincroniza al borrar fotos desde el
 * admin (docs/CATALOG-IMAGES-IMPLEMENTATION.md §2.4); sigue haciendo falta para
 * los productos cargados antes de que existiera imagesByCut.
 */
export function imagesForCut(product: BackendProduct, cut?: string | null): ResolvedImage[] {
  const byCut = product.imagesByCut ?? {};
  const cuts = product.availableCuts?.length ? product.availableCuts : Object.keys(byCut);

  const requestedHasImages = !!cut && !!byCut[cut]?.length;
  const chosenCut = requestedHasImages ? cut! : (cuts.find((c) => byCut[c]?.length) ?? null);

  const raw = chosenCut ? byCut[chosenCut] : product.images;

  return (raw ?? [])
    .map((url) => normalizeImageUrl(url))
    .filter((url): url is string => !!url)
    .map((url, index) => ({
      url,
      alt: buildAlt(product.name, chosenCut, index),
      cut: chosenCut,
    }));
}

/** Slots de la card de grilla directamente desde el payload del backend. */
export function resolveCardImages(product: BackendProduct, cut?: string | null) {
  return cardSlots(imagesForCut(product, cut));
}

/** Slots de la galería de ficha directamente desde el payload del backend. */
export function resolveGallerySlots(product: BackendProduct, cut?: string | null) {
  return gallerySlots(imagesForCut(product, cut));
}

/** Slot del Bento / grillas de home directamente desde el payload del backend. */
export function resolveBentoImage(product: BackendProduct, cut?: string | null) {
  return heroSlot(imagesForCut(product, cut));
}
