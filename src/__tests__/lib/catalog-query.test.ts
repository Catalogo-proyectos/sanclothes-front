import { describe, expect, it } from 'vitest';
import {
  applyFilters,
  availableSizes,
  catalogHref,
  filterByStyleCode,
  hasActiveFilters,
  parseCatalogQuery,
  sortProducts,
} from '@/lib/catalog/query';
import type { CatalogProduct } from '@/types/api';

const params = (qs: string) => new URLSearchParams(qs);

let seq = 0;
function product(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  seq += 1;
  return {
    productId: `q${seq}`,
    slug: `q${seq}`,
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

describe('parseCatalogQuery / catalogHref', () => {
  it('lee todos los parámetros y descarta valores inválidos', () => {
    const q = parseCatalogQuery(params('category=streetwear&tipo=CHAQUETAS&talle=s,%20m&genero=mujer&min=50000&max=abc&disponible=1&orden=precio-desc'));
    expect(q).toEqual({
      style: 'streetwear',
      tipo: 'CHAQUETAS',
      sizes: ['S', 'M'],
      gender: 'mujer',
      min: 50_000,
      max: null,
      onlyAvailable: true,
      sort: 'precio-desc',
    });
    expect(parseCatalogQuery(params('genero=otro&orden=raro')).gender).toBeNull();
    expect(parseCatalogQuery(params('orden=raro')).sort).toBe('nuevos');
  });

  it('los links viejos ?category=streetwear siguen funcionando y vuelven igual', () => {
    const q = parseCatalogQuery(params('category=streetwear'));
    expect(q.style).toBe('streetwear');
    expect(hasActiveFilters(q)).toBe(false);
    expect(catalogHref(q)).toBe('/catalog?category=streetwear');
    expect(catalogHref({})).toBe('/catalog');
  });

  it('filtra el tipo sin distinguir mayúsculas y acepta el gender= de los links viejos', () => {
    const jacket = product({ category: 'CHAQUETAS' });
    expect(applyFilters([jacket, product()], parseCatalogQuery(params('tipo=chaquetas')))).toEqual([jacket]);
    expect(parseCatalogQuery(params('gender=men')).gender).toBe('hombre');
    expect(parseCatalogQuery(params('gender=women')).gender).toBe('mujer');
    expect(parseCatalogQuery(params('gender=unisex')).gender).toBeNull();
    expect(parseCatalogQuery(params('genero=mujer&gender=men')).gender).toBe('mujer');
  });

  it('tipo, talle, precio, género, disponible u orden cuentan como filtro activo', () => {
    for (const qs of ['tipo=X', 'talle=M', 'genero=hombre', 'min=1', 'max=1', 'disponible=1', 'orden=precio-asc']) {
      expect(hasActiveFilters(parseCatalogQuery(params(`category=casual&${qs}`)))).toBe(true);
    }
  });
});

describe('filterByStyleCode', () => {
  it('filtra por los estilos que manda el backend', () => {
    const a = product({ styles: ['streetwear'] });
    const b = product({ styles: ['casual', 'streetwear'] });
    const c = product({ styles: ['casual'] });
    expect(filterByStyleCode([a, b, c], 'streetwear')).toEqual([a, b]);
    expect(filterByStyleCode([a, b, c], null)).toEqual([a, b, c]);
  });

  it('con un backend viejo (sin styles en ningún producto) usa el filtro legacy', () => {
    const a = product({ category: 'streetwear' });
    const legacy = (list: CatalogProduct[], style: string) => list.filter((p) => p.category === style);
    expect(filterByStyleCode([a, product()], 'streetwear', legacy)).toEqual([a]);
  });
});

describe('applyFilters', () => {
  it('tipo, talle, precio final (con descuento) y género', () => {
    const jacket = product({ category: 'CHAQUETAS', sizes: ['L'], price: 300_000, discountPrice: 250_000, cuts: ['MASCULINO'] });
    const tee = product({ sizes: ['S', 'M'], price: 80_000, cuts: ['FEMENINO'] });
    const unisex = product({ sizes: ['M'], price: 120_000, cuts: ['UNISEX'] });
    const all = [jacket, tee, unisex];
    expect(applyFilters(all, parseCatalogQuery(params('tipo=CHAQUETAS')))).toEqual([jacket]);
    expect(applyFilters(all, parseCatalogQuery(params('talle=m')))).toEqual([tee, unisex]);
    expect(applyFilters(all, parseCatalogQuery(params('min=100000&max=260000')))).toEqual([jacket, unisex]);
    expect(applyFilters(all, parseCatalogQuery(params('genero=hombre')))).toEqual([jacket, unisex]);
    expect(applyFilters(all, parseCatalogQuery(params('genero=mujer')))).toEqual([tee, unisex]);
  });

  it('disponible: con talle elegido exige stock en ese talle', () => {
    const p = product({
      sizes: ['S', 'M'],
      variants: [
        { variantId: 'a', sku: 'A', cut: 'CLASSIC', size: 'S', price: 1, stock: 3 },
        { variantId: 'b', sku: 'B', cut: 'CLASSIC', size: 'M', price: 1, stock: 0 },
      ],
    });
    const out = product({ stockStatus: 'OUT_OF_STOCK', variants: [{ variantId: 'c', sku: 'C', cut: 'CLASSIC', size: 'M', price: 1, stock: 0 }] });
    expect(applyFilters([p, out], parseCatalogQuery(params('disponible=1')))).toEqual([p]);
    expect(applyFilters([p], parseCatalogQuery(params('disponible=1&talle=M')))).toEqual([]);
    expect(applyFilters([p], parseCatalogQuery(params('disponible=1&talle=S')))).toEqual([p]);
  });
});

describe('sortProducts', () => {
  it('nuevos primero por defecto; precio usa el precio final', () => {
    const old = product({ price: 50_000 });
    const mid = product({ price: 200_000, discountPrice: 40_000 });
    const recent = product({ price: 100_000 });
    expect(sortProducts([old, mid, recent], 'nuevos')).toEqual([recent, mid, old]);
    expect(sortProducts([old, mid, recent], 'precio-asc')).toEqual([mid, old, recent]);
    expect(sortProducts([old, mid, recent], 'precio-desc')).toEqual([recent, old, mid]);
  });
});

describe('availableSizes', () => {
  it('ordena talles conocidos y luego el resto', () => {
    expect(availableSizes([product({ sizes: ['XL', 'm', '42'] }), product({ sizes: ['S', '38'] })])).toEqual(['S', 'M', 'XL', '38', '42']);
  });
});
