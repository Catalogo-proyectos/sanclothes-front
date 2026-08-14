import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { BackendProduct } from '@/types/backend';
import { PLACEHOLDER_PRODUCT } from '@/lib/images/constants';

/**
 * `config` lee process.env al importarse, así que el origen de media se controla
 * por mock: es el único parámetro que cambia el comportamiento de normalizeImageUrl.
 */
const mediaOrigin = { value: 'https://cdn.santclothes.test' };

vi.mock('@/lib/config', () => ({
  config: {
    get api() {
      return { mediaOrigin: mediaOrigin.value, baseUrl: '', healthUrl: '', useMock: true };
    },
  },
}));

const { normalizeImageUrl } = await import('@/lib/images/url');
const { pickSlot, cardSlots, gallerySlots, heroSlot } = await import('@/lib/images/slots');
const { imagesForCut, resolveGallerySlots } = await import('@/lib/images/resolve');

beforeEach(() => {
  mediaOrigin.value = 'https://cdn.santclothes.test';
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeProduct(overrides: Partial<BackendProduct> = {}): BackendProduct {
  return {
    productId: 'prod_01',
    slug: 'camisa-oversized',
    name: 'Camisa Oversized',
    category: 'HOMBRE',
    dropType: 'DROP_01',
    price: 180000,
    isDropActive: true,
    images: [],
    imagesByCut: {},
    variants: {},
    availableCuts: [],
    discountPercent: 0,
    tags: [],
    isLimitedDrop: false,
    ...overrides,
  };
}

describe('normalizeImageUrl', () => {
  it('reapunta cada host conocido al origen de media vigente', () => {
    const hosts = [
      'https://cdn.trecepy.com/catalog/foto.jpg',
      'https://cdn.trece13.com/catalog/foto.jpg',
      'http://localhost:5012/catalog/foto.jpg',
      'http://localhost:5014/uploads/catalog/foto.jpg',
    ];

    expect(hosts.map((h) => normalizeImageUrl(h))).toEqual([
      'https://cdn.santclothes.test/catalog/foto.jpg',
      'https://cdn.santclothes.test/catalog/foto.jpg',
      'https://cdn.santclothes.test/catalog/foto.jpg',
      'https://cdn.santclothes.test/uploads/catalog/foto.jpg',
    ]);
  });

  it('respeta rutas relativas del propio front', () => {
    expect(normalizeImageUrl('/img/hero/portada.webp')).toBe('/img/hero/portada.webp');
  });

  it('respeta data: y blob:', () => {
    expect(normalizeImageUrl('data:image/webp;base64,AAAA')).toBe('data:image/webp;base64,AAAA');
    expect(normalizeImageUrl('blob:http://localhost/abc')).toBe('blob:http://localhost/abc');
  });

  it('deja intacto un host que no es de media', () => {
    const externa = 'https://images.unsplash.com/photo-123';
    expect(normalizeImageUrl(externa)).toBe(externa);
  });

  it('devuelve null para vacíos para que el llamador elija el fallback', () => {
    expect(normalizeImageUrl(null)).toBeNull();
    expect(normalizeImageUrl(undefined)).toBeNull();
    expect(normalizeImageUrl('   ')).toBeNull();
  });

  it('sin origen configurado usa la URL tal como vino de la base', () => {
    mediaOrigin.value = '';
    expect(normalizeImageUrl('https://cdn.trecepy.com/catalog/foto.jpg')).toBe(
      'https://cdn.trecepy.com/catalog/foto.jpg'
    );
  });

  it('tolera un origen con barra final sin duplicarla', () => {
    mediaOrigin.value = 'https://cdn.santclothes.test/';
    expect(normalizeImageUrl('http://localhost:5012/catalog/foto.jpg')).toBe(
      'https://cdn.santclothes.test/catalog/foto.jpg'
    );
  });
});

describe('imagesForCut', () => {
  const product = makeProduct({
    availableCuts: ['CLASSIC', 'OVERSIZED'],
    imagesByCut: {
      CLASSIC: ['http://localhost:5012/catalog/classic-1.jpg', 'http://localhost:5012/catalog/classic-2.jpg'],
      OVERSIZED: ['http://localhost:5012/catalog/ov-1.jpg'],
    },
  });

  it('devuelve las fotos del corte pedido, normalizadas', () => {
    const images = imagesForCut(product, 'OVERSIZED');
    expect(images).toHaveLength(1);
    expect(images[0].url).toBe('https://cdn.santclothes.test/catalog/ov-1.jpg');
    expect(images[0].cut).toBe('OVERSIZED');
  });

  it('cae al primer corte con fotos si el pedido no tiene ninguna', () => {
    const images = imagesForCut(product, 'INEXISTENTE');
    expect(images).toHaveLength(2);
    expect(images[0].cut).toBe('CLASSIC');
  });

  it('usa el array legacy cuando no hay imagesByCut', () => {
    const legacy = makeProduct({
      images: ['https://cdn.trecepy.com/catalog/legacy.jpg'],
      imagesByCut: {},
      availableCuts: [],
    });

    const images = imagesForCut(legacy, null);
    expect(images).toHaveLength(1);
    expect(images[0].url).toBe('https://cdn.santclothes.test/catalog/legacy.jpg');
    expect(images[0].cut).toBeNull();
  });

  it('devuelve vacío si el producto no tiene ninguna foto', () => {
    expect(imagesForCut(makeProduct(), null)).toEqual([]);
  });

  it('descarta entradas vacías en vez de propagar strings inválidos', () => {
    const sucio = makeProduct({
      availableCuts: ['CLASSIC'],
      imagesByCut: { CLASSIC: ['', '   ', 'http://localhost:5012/catalog/ok.jpg'] },
    });

    expect(imagesForCut(sucio, 'CLASSIC')).toHaveLength(1);
  });

  it('describe el corte en el alt cuando no es el corte por defecto', () => {
    expect(imagesForCut(product, 'OVERSIZED')[0].alt).toContain('corte OVERSIZED');
    expect(imagesForCut(product, 'CLASSIC')[0].alt).not.toContain('corte');
  });
});

describe('pickSlot', () => {
  const images = [
    { url: 'a.jpg', alt: 'a' },
    { url: 'b.jpg', alt: 'b' },
  ];

  it('devuelve el placeholder cuando no hay fotos', () => {
    expect(pickSlot([], 0).url).toBe(PLACEHOLDER_PRODUCT);
    expect(pickSlot([], 3).url).toBe(PLACEHOLDER_PRODUCT);
  });

  it('devuelve el slot exacto si existe', () => {
    expect(pickSlot(images, 1).url).toBe('b.jpg');
  });

  it('cicla en vez de repetir siempre la primera', () => {
    expect(pickSlot(images, 2).url).toBe('a.jpg');
    expect(pickSlot(images, 3).url).toBe('b.jpg');
  });
});

describe('cardSlots', () => {
  it('reparte principal y hover con dos o más fotos', () => {
    const { main, hover, count } = cardSlots([
      { url: 'a.jpg', alt: 'a' },
      { url: 'b.jpg', alt: 'b' },
    ]);

    expect(main.url).toBe('a.jpg');
    expect(hover.url).toBe('b.jpg');
    expect(count).toBe(2);
  });

  it('con una sola foto informa count=1 para que la card no cruce imágenes', () => {
    const { main, hover, count } = cardSlots([{ url: 'a.jpg', alt: 'a' }]);
    expect(main.url).toBe('a.jpg');
    expect(hover.url).toBe('a.jpg');
    expect(count).toBe(1);
  });

  it('sin fotos cae al placeholder en ambos slots', () => {
    const { main, hover, count } = cardSlots([]);
    expect(main.url).toBe(PLACEHOLDER_PRODUCT);
    expect(hover.url).toBe(PLACEHOLDER_PRODUCT);
    expect(count).toBe(0);
  });
});

describe('gallerySlots', () => {
  const build = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ url: `${i}.jpg`, alt: `foto ${i}` }));

  it.each([1, 2, 4, 7])('nunca deja un slot indefinido con %i fotos', (n) => {
    const slots = gallerySlots(build(n));

    expect(slots.hero.url).toBeTruthy();
    expect(slots.smallPair[0].url).toBeTruthy();
    expect(slots.smallPair[1].url).toBeTruthy();
    expect(slots.bottomHero.url).toBeTruthy();
  });

  it('manda a extras solo lo que sobra del cuarto slot', () => {
    expect(gallerySlots(build(7)).extras).toHaveLength(3);
    expect(gallerySlots(build(4)).extras).toHaveLength(0);
  });

  it('con 4 fotos usa una distinta en cada slot', () => {
    const slots = gallerySlots(build(4));
    const urls = [slots.hero.url, slots.smallPair[0].url, slots.smallPair[1].url, slots.bottomHero.url];
    expect(new Set(urls).size).toBe(4);
  });

  it('sin fotos deja los cuatro slots en el placeholder', () => {
    const slots = gallerySlots([]);
    expect(slots.hero.url).toBe(PLACEHOLDER_PRODUCT);
    expect(slots.bottomHero.url).toBe(PLACEHOLDER_PRODUCT);
    expect(slots.extras).toEqual([]);
  });
});

describe('resolveGallerySlots', () => {
  it('cambia la galería completa al cambiar de corte', () => {
    const product = makeProduct({
      availableCuts: ['CLASSIC', 'OVERSIZED'],
      imagesByCut: {
        CLASSIC: ['http://localhost:5012/catalog/c1.jpg', 'http://localhost:5012/catalog/c2.jpg'],
        OVERSIZED: ['http://localhost:5012/catalog/o1.jpg', 'http://localhost:5012/catalog/o2.jpg'],
      },
    });

    expect(resolveGallerySlots(product, 'CLASSIC').hero.url).toContain('c1.jpg');
    expect(resolveGallerySlots(product, 'OVERSIZED').hero.url).toContain('o1.jpg');
  });
});

describe('heroSlot', () => {
  it('toma siempre la principal', () => {
    expect(heroSlot([{ url: 'a.jpg', alt: 'a' }, { url: 'b.jpg', alt: 'b' }]).url).toBe('a.jpg');
  });
});
