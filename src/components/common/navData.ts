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

/**
 * featuredImage points at pre-sized 800x672 WebP derivatives in /img/nav, not the
 * originals in /img/hero. The originals are 4160x6240 / ~10MB each and were being
 * decoded into a 380x320 box.
 */
export const NAV_CATEGORIES: NavCategory[] = [
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
    featuredImage: '/img/nav/streetwear.webp',
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
    featuredImage: '/img/nav/old-money.webp',
    featuredTag: 'SILENT LUXURY',
  },
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
    featuredImage: '/img/nav/casual.webp',
    featuredTag: 'DAILY ESSENTIALS',
  },
  {
    id: 'sports',
    name: 'SPORTS',
    displayTitle: 'Performance',
    href: '/catalog?category=performance',
    col1Title: 'Activewear',
    col1Links: [
      { label: 'Ver Todo', href: '/catalog?category=performance' },
      { label: 'Prendas Técnicas', href: '/catalog?category=performance&type=technical' },
      { label: 'Tees & Musculosas', href: '/catalog?category=performance&type=tees' },
      { label: 'Shorts de Entrenamiento', href: '/catalog?category=performance&type=shorts' },
      { label: 'Buzos Performance', href: '/catalog?category=performance&type=hoodies' },
    ],
    col2Links: [
      { label: 'Leggings & Mallas', href: '/catalog?category=performance&type=leggings' },
      { label: 'Colección Hombre', href: '/catalog?category=performance&gender=men' },
      { label: 'Colección Mujer', href: '/catalog?category=performance&gender=women' },
      { label: 'High Mobility', href: '/catalog?category=performance&type=mobility' },
      { label: 'Accesorios Active', href: '/catalog?category=performance&type=accessories' },
    ],
    featuredImage: '/img/nav/sports.webp',
    featuredTag: 'HIGH PERFORMANCE',
  },
];
