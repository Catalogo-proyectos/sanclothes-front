'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Search, ChevronDown, X, ShoppingBag } from 'lucide-react';
import CartIcon from './CartIcon';
import CartDrawer from '../checkout/CartDrawer';
import { useAuth } from '@/hooks/useAuth';

interface StyleNavItem {
  id: string;
  name: string;
  href: string;
  subcategories: { name: string; href: string }[];
}

const BRAND_NAV_STYLES: StyleNavItem[] = [
  {
    id: 'streetwear',
    name: 'STREETWEAR',
    href: '/catalog?category=streetwear',
    subcategories: [
      { name: 'HOMBRE (HOODIES 400G & REMERAS)', href: '/catalog?category=streetwear&gender=men' },
      { name: 'MUJER (OVERSIZED & CROPPED TOPS)', href: '/catalog?category=streetwear&gender=women' },
      { name: 'UNISEX (CÁPSULA STREET ARCHITECTS)', href: '/catalog?category=streetwear&gender=unisex' },
    ],
  },
  {
    id: 'old-money',
    name: 'OLD MONEY',
    href: '/catalog?category=old-money',
    subcategories: [
      { name: 'HOMBRE (POLOS CANALÉ & GABARDINA)', href: '/catalog?category=old-money&gender=men' },
      { name: 'MUJER (CHALECOS & SILUETAS ATELIER)', href: '/catalog?category=old-money&gender=women' },
      { name: 'UNISEX (SUEDE TRACKSUIT COLLECTION)', href: '/catalog?category=old-money&gender=unisex' },
    ],
  },
  {
    id: 'casual',
    name: 'MODA CASUAL',
    href: '/catalog?category=casual',
    subcategories: [
      { name: 'HOMBRE (CAMISAS LINO & SHORTS)', href: '/catalog?category=casual&gender=men' },
      { name: 'MUJER (DAILY BASICS & TOPS LINO)', href: '/catalog?category=casual&gender=women' },
      { name: 'UNISEX (ESSENTIALS TRIO PACK)', href: '/catalog?category=casual&gender=unisex' },
    ],
  },
  {
    id: 'sports',
    name: 'SPORTS',
    href: '/catalog?category=performance',
    subcategories: [
      { name: 'HOMBRE (PANTS TÉCNICOS & RUNNING)', href: '/catalog?category=performance&gender=men' },
      { name: 'MUJER (ACTIVEWEAR & TOPS PERFORMANCE)', href: '/catalog?category=performance&gender=women' },
      { name: 'UNISEX (SANTS SPORT ACCELERATION)', href: '/catalog?category=performance&gender=unisex' },
    ],
  },
];

export default function Header() {
  const [activeHoverStyle, setActiveHoverStyle] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-[#f6f8f9] text-[#17191c] border-b border-[#b6b2a7]/40 selection:bg-[#17191c] selection:text-[#f6f8f9]"
        onMouseLeave={() => setActiveHoverStyle(null)}
      >
        {/* Main Navbar Grid (Paint Reference Layout: Left Styles, Center Logo, Right General Nav) */}
        <div className="w-full px-6 sm:px-12 h-20 grid grid-cols-12 items-center relative z-50 bg-[#f6f8f9]">
          
          {/* 1. LEFT COLUMN: BRAND STYLES & HOVER SUBCATEGORIES DROPDOWN */}
          <div className="col-span-4 hidden md:flex items-center gap-6 relative">
            {BRAND_NAV_STYLES.map((style) => {
              const isHovered = activeHoverStyle === style.id;

              return (
                <div
                  key={style.id}
                  onMouseEnter={() => setActiveHoverStyle(style.id)}
                  className="relative py-7"
                >
                  <Link
                    href={style.href}
                    className={`text-[11px] font-mono font-bold tracking-[0.2em] uppercase transition-colors flex items-center gap-1.5 ${
                      isHovered ? 'text-[#17191c] border-b-2 border-[#17191c] pb-1' : 'text-[#50524a] hover:text-[#17191c]'
                    }`}
                  >
                    <span>{style.name}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isHovered ? 'rotate-180 text-[#17191c]' : 'text-[#50524a]'}`} />
                  </Link>

                  {/* Hover Dropdown showing Hombre, Mujer, Unisex */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-16 w-72 bg-[#f6f8f9] border border-[#b6b2a7] p-4 shadow-none z-50"
                        style={{ borderRadius: '0px' }}
                      >
                        <div className="text-[10px] font-mono font-bold text-[#50524a] uppercase tracking-widest mb-3 border-b border-[#b6b2a7]/40 pb-2">
                          LÍNEAS — {style.name}
                        </div>
                        <ul className="space-y-2.5">
                          {style.subcategories.map((sub, idx) => (
                            <li key={idx}>
                              <Link
                                href={sub.href}
                                onClick={() => setActiveHoverStyle(null)}
                                className="text-[11px] font-mono font-bold text-[#50524a] hover:text-[#17191c] uppercase tracking-wider block hover:translate-x-1 transition-transform"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* 2. CENTER COLUMN: LOGO & NOMBRE SANTS CLOTHES */}
          <div className="col-span-12 md:col-span-4 flex flex-col items-center justify-center text-center">
            <Link href="/" className="group block">
              <span className="text-3xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wider text-[#17191c] uppercase leading-none block group-hover:scale-105 transition-transform duration-300">
                SANTS CLOTHES®
              </span>
            </Link>
          </div>

          {/* 3. RIGHT COLUMN: GENERAL NAVIGATION, BUSCAR, CUENTA & CARRITO */}
          <div className="col-span-4 hidden md:flex items-center justify-end gap-6">
            <Link
              href="/catalog"
              className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#50524a] hover:text-[#17191c] transition-colors"
            >
              CATÁLOGO
            </Link>

            <Link
              href="/journal"
              className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[#50524a] hover:text-[#17191c] transition-colors"
            >
              SOBRE NOSOTROS
            </Link>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Buscar en el catálogo"
              className="text-[#50524a] hover:text-[#17191c] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-3 text-[11px] font-mono font-bold tracking-wider uppercase">
                <Link href="/dashboard" className="text-[#50524a] hover:text-[#17191c] transition-colors flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.firstName || 'MI CUENTA'}</span>
                </Link>
                <button
                  onClick={logout}
                  aria-label="Cerrar sesión"
                  className="text-[#50524a] hover:text-[#17191c] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[11px] font-mono font-bold tracking-[0.1em] text-[#b6b2a7] hover:text-[#f6f8f9] transition-colors uppercase flex items-center gap-1"
              >
                <User className="w-4 h-4" />
              </Link>
            )}

            <CartIcon onClick={() => setIsCartOpen(true)} />
          </div>
        </div>

        {/* Search Overlay Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#17191c] border-b border-[#50524a] px-6 sm:px-12 py-4 flex items-center justify-between z-40 overflow-hidden"
            >
              <div className="flex items-center gap-3 w-full max-w-3xl">
                <Search className="w-4 h-4 text-[#b6b2a7]" />
                <input
                  type="text"
                  placeholder="BUSCAR HOODIES, REMERAS, PANTALONES..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-[#f6f8f9] text-xs font-mono font-bold tracking-wider uppercase focus:outline-none placeholder:text-[#b6b2a7]/60"
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-[#b6b2a7] hover:text-[#f6f8f9] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}


