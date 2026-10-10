import { describe, expect, it } from 'vitest';
import { arrangementFor, bentoTitle, buildSectionBody, buildSections } from '@/lib/catalog/sections';
import type { CatalogProduct } from '@/types/api';

let seq = 0;
function product(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  seq += 1;
  return {
    productId: `p${seq}`,
    slug: `p${seq}`,
    title: `Prenda ${seq}`,
    description: '',
    price: 100_000,
    discountPrice: null,
    images: [],
    cuts: ['CLASSIC'],
    category: 'REMERAS',
    sizes: ['M'],
    stockStatus: 'IN_STOCK',
    styles: [],
    categoryName: 'Remeras',
    color: null,
    bento: null,

    createdAt: new Date(Date.UTC(2026, 0, 1) + seq * 60_000).toISOString(),
    ...overrides,
  };
}
const bento = (priority = 100, extra: Partial<CatalogProduct> = {}) =>
  product({ bento: { title: null, copy: null, image: null, priority }, ...extra });
const many = (n: number, extra: Partial<CatalogProduct> = {}) => Array.from({ length: n }, () => product(extra));

describe('arrangementFor', () => {
  it.each([
    [0, 'banner'],
    [1, 'split'],
    [2, 'stack'],
    [3, 'trio'],
    [4, 'quad'],
    [9, 'quad'],
  ] as const)('%i al lado → %s', (n, expected) => {
    expect(arrangementFor(n)).toBe(expected);
  });
});

describe('buildSectionBody', () => {
  it('sin bento: solo grilla, sin bandas', () => {
    const body = buildSectionBody(many(3));
    expect(body.bands).toEqual([]);
    expect(body.grid).toHaveLength(3);
    expect(body.hiddenCount).toBe(0);
  });

  it('un bento toma hasta 4 productos al lado y el resto va a la grilla', () => {
    const b = bento();
    const rest = many(6);
    const body = buildSectionBody([b, ...rest]);
    expect(body.bands).toHaveLength(1);
    expect(body.bands[0]!.bento).toBe(b);
    expect(body.bands[0]!.side).toEqual(rest.slice(0, 4));
    expect(body.bands[0]!.arrangement).toBe('quad');
    expect(body.grid).toEqual(rest.slice(4));
  });

  it.each([0, 1, 2, 3])('bento con %i productos al lado usa el armado correspondiente', (n) => {
    const body = buildSectionBody([bento(), ...many(n)]);
    expect(body.bands[0]!.side).toHaveLength(n);
    expect(body.bands[0]!.arrangement).toBe(arrangementFor(n));
    expect(body.grid).toEqual([]);
  });

  it('varios bentos: por prioridad, cada uno con sus productos, ninguno repetido', () => {
    const late = bento(50);
    const first = bento(1);
    const rest = many(5);
    const body = buildSectionBody([late, first, ...rest]);
    expect(body.bands.map((band) => band.bento)).toEqual([first, late]);
    expect(body.bands[0]!.side).toEqual(rest.slice(0, 4));
    expect(body.bands[1]!.side).toEqual(rest.slice(4));
    expect(body.bands[1]!.arrangement).toBe('split');
    const ids = [...body.bands.flatMap((band) => [band.bento, ...band.side]), ...body.grid].map((p) => p.productId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a igual prioridad gana el bento más nuevo', () => {
    const older = bento(10);
    const newer = bento(10);
    expect(buildSectionBody([older, newer]).bands.map((b) => b.bento)).toEqual([newer, older]);
  });

  it('limita la grilla a 2 filas y cuenta lo oculto; null = sin límite', () => {
    const items = many(13);
    const limited = buildSectionBody(items);
    expect(limited.grid).toHaveLength(8);
    expect(limited.hiddenCount).toBe(5);
    const all = buildSectionBody(items, { maxGridRows: null });
    expect(all.grid).toHaveLength(13);
    expect(all.hiddenCount).toBe(0);
  });
});

describe('buildSections', () => {
  const categories = [
    { code: 'CHAQUETAS', name: 'Chaquetas', sortOrder: 10 },
    { code: 'REMERAS', name: 'Remeras', sortOrder: 20 },
  ];

  it('una sección por tipo de prenda, en el orden del admin; desconocidos al final', () => {
    const products = [
      product({ category: 'REMERAS' }),
      product({ category: 'COMBOS', categoryName: 'COMBOS' }),
      product({ category: 'CHAQUETAS', categoryName: 'Chaquetas' }),
    ];
    const sections = buildSections(products, categories);
    expect(sections.map((s) => s.categoryCode)).toEqual(['CHAQUETAS', 'REMERAS', 'COMBOS']);
    expect(sections[0]!.categoryName).toBe('Chaquetas');
    expect(sections.every((s) => s.total === 1)).toBe(true);
  });

  it('el bento de una sección solo lleva productos de esa sección', () => {
    const jacketBento = bento(1, { category: 'CHAQUETAS', categoryName: 'Chaquetas' });
    const jackets = many(2, { category: 'CHAQUETAS', categoryName: 'Chaquetas' });
    const tees = many(3);
    const [chaquetas, remeras] = buildSections([jacketBento, ...tees, ...jackets], categories);
    expect(chaquetas!.bands[0]!.side.every((p) => p.category === 'CHAQUETAS')).toBe(true);
    expect(chaquetas!.bands[0]!.side).toHaveLength(2);
    expect(remeras!.bands).toEqual([]);
    expect(remeras!.grid).toHaveLength(3);
  });

  it('dentro de una sección, los más nuevos primero', () => {
    const old = product();
    const recent = product();
    const [section] = buildSections([old, recent], categories);
    expect(section!.grid).toEqual([recent, old]);
  });
});

describe('bentoTitle', () => {
  it('usa el título del admin o, si falta, el nombre del tipo de prenda', () => {
    expect(bentoTitle(bento(1, { bento: { title: 'Invierno', copy: null, image: null, priority: 1 } }))).toBe('Invierno');
    expect(bentoTitle(bento(1, { categoryName: 'Chaquetas', bento: { title: '  ', copy: null, image: null, priority: 1 } }))).toBe('Chaquetas');
  });
});
