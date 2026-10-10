export interface NavCategory {
  id: string;
  name: string;
  displayTitle: string;
  href: string;
  col1Title: string;
  col1Links: { label: string; href: string }[];
  col2Links: { label: string; href: string }[];
  featuredImage: string;
  featuredTag: string;
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'casual',
    name: 'CASUAL',
    displayTitle: 'Moda Casual',
    href: '/catalog?category=casual',
    col1Title: 'Esenciales',
    col1Links: [
      { label: 'Ver Todo', href: '/catalog?category=casual' },
      { label: 'Básicos Diarios', href: '/catalog?category=casual&type=essentials' },
      { label: 'Camisetas Premium', href: '/catalog?category=casual&type=tees' },
      { label: 'Jeans & Denim', href: '/catalog?category=casual&type=denim' },
      { label: 'Camisas Casuales', href: '/catalog?category=casual&type=shirts' },
    ],
    col2Links: [
      { label: 'Camperas Livianas', href: '/catalog?category=casual&type=jackets' },
      { label: 'Colección Hombre', href: '/catalog?category=casual&gender=men' },
      { label: 'Colección Mujer', href: '/catalog?category=casual&gender=women' },
      { label: 'Estilo Urbano', href: '/catalog?category=casual&type=urban' },
      { label: 'Accesorios', href: '/catalog?category=casual&type=accessories' },
    ],
    featuredImage: '/img/web/nav/casual-drop.webp',
    featuredTag: 'DAILY ESSENTIALS',
  },
  {
    id: 'streetwear',
    name: 'STREETWEAR',
    displayTitle: 'Streetwear Drop',
    href: '/catalog?category=streetwear',
    col1Title: 'Categorías',
    col1Links: [
      { label: 'Ver Todo', href: '/catalog?category=streetwear' },
      { label: 'Hoodies Heavyweight', href: '/catalog?category=streetwear&type=hoodies' },
      { label: 'Remeras Oversized', href: '/catalog?category=streetwear&type=tshirts' },
      { label: 'Sudaderas & Buzos', href: '/catalog?category=streetwear&type=sweatshirts' },
      { label: 'Shorts & Joggers', href: '/catalog?category=streetwear&type=bottoms' },
    ],
    col2Links: [
      { label: 'Pantalones Cargo', href: '/catalog?category=streetwear&type=cargo' },
      { label: 'Colección Hombre', href: '/catalog?category=streetwear&gender=men' },
      { label: 'Colección Mujer', href: '/catalog?category=streetwear&gender=women' },
      { label: 'Línea Unisex', href: '/catalog?category=streetwear&gender=unisex' },
      { label: 'Accesorios Street', href: '/catalog?category=streetwear&type=accessories' },
    ],
    featuredImage: '/img/web/nav/street-drop.webp',
    featuredTag: 'NEW DROP SS26',
  },
  {
    id: 'old-money',
    name: 'OLD MONEY',
    displayTitle: 'Old Money',
    href: '/catalog?category=old-money',
    col1Title: 'Colección',
    col1Links: [
      { label: 'Ver Todo', href: '/catalog?category=old-money' },
      { label: 'Polos Canalé', href: '/catalog?category=old-money&type=polos' },
      { label: 'Camisas de Lino', href: '/catalog?category=old-money&type=shirts' },
      { label: 'Punto & Suéteres', href: '/catalog?category=old-money&type=knitwear' },
      { label: 'Pantalones de Vestir', href: '/catalog?category=old-money&type=trousers' },
    ],
    col2Links: [
      { label: 'Sacos & Blazers', href: '/catalog?category=old-money&type=blazers' },
      { label: 'Colección Hombre', href: '/catalog?category=old-money&gender=men' },
      { label: 'Colección Mujer', href: '/catalog?category=old-money&gender=women' },
      { label: 'Línea Silent Luxury', href: '/catalog?category=old-money&type=silent' },
      { label: 'Marroquinería', href: '/catalog?category=old-money&type=leather' },
    ],
    featuredImage: '/img/web/nav/old-drop.webp',
    featuredTag: 'SILENT LUXURY',
  },
  {
    id: 'sports',
    name: 'SPORTS',
    displayTitle: 'Performance',
    href: '/catalog?category=sports',
    col1Title: 'Activewear',
    col1Links: [
      { label: 'Ver Todo', href: '/catalog?category=sports' },
      { label: 'Prendas Técnicas', href: '/catalog?category=sports&type=technical' },
      { label: 'Tees & Musculosas', href: '/catalog?category=sports&type=tees' },
      { label: 'Shorts de Entrenamiento', href: '/catalog?category=sports&type=shorts' },
      { label: 'Buzos Performance', href: '/catalog?category=sports&type=hoodies' },
    ],
    col2Links: [
      { label: 'Leggings & Mallas', href: '/catalog?category=sports&type=leggings' },
      { label: 'Colección Hombre', href: '/catalog?category=sports&gender=men' },
      { label: 'Colección Mujer', href: '/catalog?category=sports&gender=women' },
      { label: 'High Mobility', href: '/catalog?category=sports&type=mobility' },
      { label: 'Accesorios Active', href: '/catalog?category=sports&type=accessories' },
    ],
    featuredImage: '/img/web/nav/sport-drop.webp',
    featuredTag: 'HIGH PERFORMANCE',
  },
];

import type { CatalogTaxonomy } from '@/lib/services/taxonomy';
import { catalogHref } from '@/lib/catalog/query';

const DEFAULT_NAV_IMAGE = '/img/web/nav/casual-drop.webp';

export function navCategoriesFromTaxonomy(taxonomy: CatalogTaxonomy): NavCategory[] {
  if (taxonomy.styles.length === 0) return NAV_CATEGORIES;
  return taxonomy.styles.map((style) => {
    const base = NAV_CATEGORIES.find((c) => c.id === style.code);
    const href = catalogHref({ style: style.code });
    const typeLinks = style.categories.map((c) => ({ label: c.name, href: catalogHref({ style: style.code, tipo: c.code }) }));
    
    const legacy = (links: NavCategory['col1Links'] | undefined) => (links ?? []).map((l) => ({ label: l.label, href }));
    return {
      id: style.code,
      name: style.name.toUpperCase(),
      displayTitle: base?.displayTitle ?? style.name,
      href,
      col1Title: base?.col1Title ?? 'Colección',
      col1Links: [{ label: 'Ver Todo', href }, ...(typeLinks.length > 0 ? typeLinks : legacy(base?.col1Links).slice(1))],
      col2Links: typeLinks.length > 0 ? [] : legacy(base?.col2Links),
      featuredImage: style.coverImage ?? base?.featuredImage ?? DEFAULT_NAV_IMAGE,
      featuredTag: base?.featuredTag ?? style.name.toUpperCase(),
    };
  });
}
