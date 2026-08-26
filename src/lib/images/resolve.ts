import type { BackendProduct } from '@/types/backend';
import { normalizeImageUrl } from './url';
import { cardSlots, gallerySlots, heroSlot, type SlotImage } from './slots';

export interface ResolvedImage extends SlotImage {

  cut: string | null;
}


const SLOT_DESCRIPTIONS = ['vista principal', 'vista trasera', 'detalle', 'vista completa'] as const;

function buildAlt(productName: string, cut: string | null, index: number): string {
  const view = SLOT_DESCRIPTIONS[index] ?? `vista ${index + 1}`;
  return cut && cut !== 'CLASSIC' ? `${productName} — corte ${cut}, ${view}` : `${productName} — ${view}`;
}


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


export function resolveCardImages(product: BackendProduct, cut?: string | null) {
  return cardSlots(imagesForCut(product, cut));
}


export function resolveGallerySlots(product: BackendProduct, cut?: string | null) {
  return gallerySlots(imagesForCut(product, cut));
}


export function resolveBentoImage(product: BackendProduct, cut?: string | null) {
  return heroSlot(imagesForCut(product, cut));
}
