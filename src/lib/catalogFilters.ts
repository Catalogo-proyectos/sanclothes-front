import { CatalogProduct } from '@/types/api';

/**
 * The chip rail is the only category control in the header, so its ids are the
 * canonical filter vocabulary for the whole storefront: the rail writes them,
 * the grid reads them, and `?c=` carries them in the URL so a filtered view is
 * shareable without a route change.
 */
export type ChipId = 'todo' | 'hombre' | 'mujer' | 'new-drop' | 'essentials' | 'sale';

export interface CatalogChip {
  id: ChipId;
  label: string;
  /** Mono line shown under the grid heading once the chip is active. */
  caption: string;
  matches: (product: CatalogProduct) => boolean;
}

const ESSENTIAL_CATEGORIES = new Set(['remeras', 'polos', 'pantalones']);

export const CATALOG_CHIPS: CatalogChip[] = [
  {
    id: 'todo',
    label: 'Todo',
    caption: 'Catálogo completo · Todas las líneas',
    matches: () => true,
  },
  {
    id: 'hombre',
    label: 'Hombre',
    caption: 'Corte masculino · Tallas S a XL',
    matches: (p) => p.cuts.includes('MASCULINO'),
  },
  {
    id: 'mujer',
    label: 'Mujer',
    caption: 'Corte femenino · Tallas XS a L',
    matches: (p) => p.cuts.includes('FEMENINO'),
  },
  {
    id: 'new-drop',
    label: 'New Drop',
    caption: 'Streetwear SS26 · Producción limitada',
    matches: (p) => p.category === 'streetwear',
  },
  {
    id: 'essentials',
    label: 'Essentials',
    caption: 'Base del guardarropa · Reposición continua',
    matches: (p) => ESSENTIAL_CATEGORIES.has(p.category),
  },
  {
    id: 'sale',
    label: 'Sale',
    caption: 'Precio rebajado · Hasta agotar stock',
    matches: (p) => p.discountPrice != null || p.flashSale != null,
  },
];

export const DEFAULT_CHIP: ChipId = 'todo';

export function getChip(id: ChipId): CatalogChip {
  return CATALOG_CHIPS.find((c) => c.id === id) ?? CATALOG_CHIPS[0];
}

export function isChipId(value: string | null | undefined): value is ChipId {
  return !!value && CATALOG_CHIPS.some((c) => c.id === value);
}

export function filterByChip(products: CatalogProduct[], id: ChipId): CatalogProduct[] {
  const chip = getChip(id);
  return products.filter(chip.matches);
}

/**
 * The four style lines the header navigates to. These ids are the slugs carried
 * in `?category=` — the header writes them, the grid reads them — so they must
 * stay in step with NAV_CATEGORIES' ids in navData.ts.
 *
 * A style is a bucket over the product `category` field, which is finer grained
 * (a hoodie and a graphic tee are both streetwear). Unknown categories simply
 * don't belong to any style, so a new backend category is invisible to the style
 * filter until it's listed here.
 */
export type StyleId = 'streetwear' | 'old-money' | 'casual' | 'sports';

export interface CatalogStyle {
  id: StyleId;
  label: string;
  /** Mono line shown under the grid heading while the style is active. */
  caption: string;
  categories: string[];
  /**
   * Hero artwork for the style. All of these are the same 12:5 build as the
   * default catalog hero — wordmark baked in, model stepping in front of the
   * letters — which is why CatalogHero can swap the source without touching its
   * frame. A style with no artwork of its own falls back to DEFAULT_CATALOG_HERO.
   */
  hero?: CatalogHeroArt;
}

export interface CatalogHeroArt {
  src: string;
  mobileSrc?: string;
  alt: string;
}

export const DEFAULT_CATALOG_HERO: CatalogHeroArt = {
  src: '/img/hero/Hero-Catalogo2.jpeg',
  mobileSrc: '/img/hero/Hero Movil Streetweater.jpeg',
  alt: 'SANT CLOTHES — campera varsity SS24',
};

export const CATALOG_STYLES: CatalogStyle[] = [
  {
    id: 'streetwear',
    label: 'Streetwear',
    caption: 'Drop SS26 · Gramaje alto y siluetas oversized',
    categories: ['streetwear', 'hoodies'],
    hero: {
      src: '/img/hero/Hero-Catalogo2.jpeg',
      mobileSrc: '/img/hero/Hero Movil Streetweater.jpeg',
      alt: 'SANT CLOTHES — colección Streetwear',
    },
  },
  {
    id: 'old-money',
    label: 'Old Money',
    caption: 'Silent luxury · Tejidos nobles y cortes limpios',
    categories: ['old-money', 'polos'],
    hero: {
      src: '/img/hero/Sants Hero Old Money.jpeg',
      mobileSrc: '/img/hero/Hero Movil Old Money.jpeg',
      alt: 'SANT CLOTHES — medio cierre Old Money en algodón perchado',
    },
  },
  {
    id: 'casual',
    label: 'Casual',
    caption: 'Base del guardarropa · Uso diario',
    categories: ['casual', 'remeras', 'pantalones'],
    hero: {
      src: '/img/hero/Sants Casual.jpeg',
      mobileSrc: '/img/hero/Hero Movil Casual.jpeg',
      alt: 'SANT CLOTHES — remera Santclub de la línea Casual',
    },
  },
  {
    id: 'sports',
    label: 'Sports',
    caption: 'Performance · Prendas técnicas',
    categories: ['sports', 'performance', 'tracksuits'],
    hero: {
      src: '/img/hero/Sants Hero Sport.jpeg',
      mobileSrc: '/img/hero/Hero Movil Sport.jpeg',
      alt: 'SANT CLOTHES — camiseta Sport Division 01',
    },
  },
];

export function getStyle(id: StyleId | null): CatalogStyle | null {
  return CATALOG_STYLES.find((s) => s.id === id) ?? null;
}

export function getCatalogHero(id: StyleId | null): CatalogHeroArt {
  return getStyle(id)?.hero ?? DEFAULT_CATALOG_HERO;
}

export function isStyleId(value: string | null | undefined): value is StyleId {
  return !!value && CATALOG_STYLES.some((s) => s.id === value);
}

/** A null id means "no style selected" and lets every product through. */
export function filterByStyle(products: CatalogProduct[], id: StyleId | null): CatalogProduct[] {
  const style = getStyle(id);
  if (!style) return products;
  const categories = new Set(style.categories);
  return products.filter((p) => categories.has(p.category));
}
