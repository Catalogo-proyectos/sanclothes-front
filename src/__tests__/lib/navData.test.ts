import { describe, expect, it } from 'vitest';
import { NAV_CATEGORIES, navCategoriesFromTaxonomy } from '@/components/common/navData';
import { FALLBACK_TAXONOMY, type CatalogTaxonomy } from '@/lib/services/taxonomy';

describe('navCategoriesFromTaxonomy', () => {
  it('con la taxonomía de respaldo mantiene los 4 estilos e imágenes de siempre', () => {
    const nav = navCategoriesFromTaxonomy(FALLBACK_TAXONOMY);
    expect(nav.map((c) => c.id)).toEqual(NAV_CATEGORIES.map((c) => c.id));
    for (const item of nav) {
      const base = NAV_CATEGORIES.find((c) => c.id === item.id)!;
      expect(item.featuredImage).toBe(base.featuredImage);
      expect(item.href).toBe(`/catalog?category=${item.id}`);

      expect(item.col1Links.every((l) => l.href === item.href)).toBe(true);
    }
  });

  it('usa los tipos de prenda reales del estilo, su portada y estilos nuevos del admin', () => {
    const taxonomy: CatalogTaxonomy = {
      styles: [
        {
          code: 'streetwear',
          name: 'Streetwear',
          description: null,
          sortOrder: 10,
          coverImage: 'https://cdn.santclothes.com.py/street.webp',
          coverImageMobile: null,
          categories: [{ code: 'CHAQUETAS', name: 'Chaquetas', count: 3 }],
        },
        { code: 'y2k', name: 'Y2K', description: null, sortOrder: 20, coverImage: null, coverImageMobile: null, categories: [] },
      ],
      categories: [],
    };
    const [street, y2k] = navCategoriesFromTaxonomy(taxonomy);
    expect(street!.featuredImage).toBe('https://cdn.santclothes.com.py/street.webp');
    expect(street!.col1Links).toEqual([
      { label: 'Ver Todo', href: '/catalog?category=streetwear' },
      { label: 'Chaquetas', href: '/catalog?category=streetwear&tipo=CHAQUETAS' },
    ]);
    expect(street!.col2Links).toEqual([]);
    expect(y2k).toMatchObject({ id: 'y2k', name: 'Y2K', href: '/catalog?category=y2k' });
    expect(y2k!.featuredImage).toBeTruthy();
  });
});
