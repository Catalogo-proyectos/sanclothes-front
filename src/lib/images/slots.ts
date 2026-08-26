import { PLACEHOLDER_ALT, PLACEHOLDER_PRODUCT } from './constants';


export interface SlotImage {
  url: string;
  alt: string;
}

export const PLACEHOLDER_SLOT: SlotImage = {
  url: PLACEHOLDER_PRODUCT,
  alt: PLACEHOLDER_ALT,
};


export function pickSlot<T extends SlotImage>(images: T[], index: number): T | SlotImage {
  if (images.length === 0) return PLACEHOLDER_SLOT;
  return images[index % images.length];
}

export interface CardSlots<T extends SlotImage = SlotImage> {
  main: T | SlotImage;
  hover: T | SlotImage;

  count: number;
}


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


export function gallerySlots<T extends SlotImage>(images: T[]): GallerySlots<T> {
  return {
    all: images,
    hero: pickSlot(images, 0),
    smallPair: [pickSlot(images, 1), pickSlot(images, 2)],
    bottomHero: pickSlot(images, 3),
    extras: images.slice(4),
  };
}


export function heroSlot<T extends SlotImage>(images: T[]): T | SlotImage {
  return pickSlot(images, 0);
}
