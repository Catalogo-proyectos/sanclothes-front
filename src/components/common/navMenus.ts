import {
  BookOpen,
  History,
  LayoutGrid,
  Landmark,
  MessageCircle,
  Podcast,
  ScrollText,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { OversizeTeeIcon, PantsIcon, ShirtIcon, SportJerseyIcon, TeeIcon } from './GarmentIcons';
import type { NavCategory } from './navData';

export type MenuIcon = LucideIcon | typeof TeeIcon;

export interface MenuLink {
  label: string;
  href: string;
  
  icon: MenuIcon;
  
  preview?: string;
  
  styleId?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  menu?: MenuLink[];
}

export function activeItemId(pathname: string): string | null {
  if (pathname === '/') return 'inicio';
  if (pathname === '/catalog' || pathname.startsWith('/products/')) return 'catalogo';
  if (pathname === '/comunidad') return 'comunidad';
  if (pathname === '/nosotros' || pathname === '/about') return 'nosotros';
  return null;
}

const STYLE_ICONS: Record<string, MenuIcon> = {
  casual: TeeIcon,
  streetwear: OversizeTeeIcon,
  'old-money': ShirtIcon,
  sports: SportJerseyIcon,
};

const STYLE_PREVIEWS: Record<string, string> = {
  casual: '/img/web/nav/casual-drop.webp',
  streetwear: '/img/web/nav/street-drop.webp',
  'old-money': '/img/web/nav/old-drop.webp',
  sports: '/img/web/nav/sport-drop.webp',
};

export const titleCase = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export function buildNavItems(navCategories: NavCategory[]): NavItem[] {
  return [
    { id: 'inicio', label: 'Inicio', href: '/' },
    {
      id: 'catalogo',
      label: 'Catálogo',
      href: '/catalog',
      menu: [
        {
          label: 'Ver todo el catálogo',
          href: '/catalog',
          icon: LayoutGrid,
          preview: '/img/web/nav/catalogo-completo-drop.webp',
        },
        ...navCategories.map((cat) => ({
          label: titleCase(cat.name),
          href: cat.href,
          icon: STYLE_ICONS[cat.id] ?? PantsIcon,
          preview: STYLE_PREVIEWS[cat.id] ?? cat.featuredImage,
          styleId: cat.id,
        })),
      ],
    },
    {
      id: 'comunidad',
      label: 'Comunidad',
      href: '/comunidad',
      menu: [
        { label: 'Sant Club', href: '/comunidad#sant-club', icon: Users },
        { label: 'Grupo de WhatsApp', href: '/comunidad#whatsapp-community', icon: MessageCircle },
        { label: 'Manifiesto', href: '/comunidad#manifiesto', icon: ScrollText },
        { label: 'Cómo sumarte', href: '/comunidad#unirse', icon: UserPlus },
      ],
    },
    {
      id: 'nosotros',
      label: 'Nosotros',
      href: '/nosotros',
      menu: [
        { label: 'Nuestra historia', href: '/nosotros#nosotros-hero', icon: BookOpen },
        { label: 'Podcast', href: '/nosotros#podcast', icon: Podcast },
        { label: 'Cronología', href: '/nosotros#cronologia', icon: History },
        { label: 'Pilares', href: '/nosotros#pilares', icon: Landmark },
      ],
    },
  ];
}
