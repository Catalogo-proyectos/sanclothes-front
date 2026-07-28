'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Search, X, Menu } from 'lucide-react';
import CartIcon from './CartIcon';
import CartDrawer from '../checkout/CartDrawer';
import { useAuth } from '@/hooks/useAuth';

/* ── Navigation Data ── */

interface NavCategory {
  id: string;
  name: string;
  href: string;
  lines: { label: string; href: string }[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'streetwear',
    name: 'STREETWEAR',
    href: '/catalog?category=streetwear',
    lines: [
      { label: 'HOMBRE', href: '/catalog?category=streetwear&gender=men' },
      { label: 'MUJER', href: '/catalog?category=streetwear&gender=women' },
      { label: 'UNISEX', href: '/catalog?category=streetwear&gender=unisex' },
    ],
  },
  {
    id: 'old-money',
    name: 'OLD MONEY',
    href: '/catalog?category=old-money',
    lines: [
      { label: 'HOMBRE', href: '/catalog?category=old-money&gender=men' },
      { label: 'MUJER', href: '/catalog?category=old-money&gender=women' },
      { label: 'UNISEX', href: '/catalog?category=old-money&gender=unisex' },
    ],
  },
  {
    id: 'casual',
    name: 'CASUAL',
    href: '/catalog?category=casual',
    lines: [
      { label: 'HOMBRE', href: '/catalog?category=casual&gender=men' },
      { label: 'MUJER', href: '/catalog?category=casual&gender=women' },
      { label: 'UNISEX', href: '/catalog?category=casual&gender=unisex' },
    ],
  },
  {
    id: 'sports',
    name: 'SPORTS',
    href: '/catalog?category=performance',
    lines: [
      { label: 'HOMBRE', href: '/catalog?category=performance&gender=men' },
      { label: 'MUJER', href: '/catalog?category=performance&gender=women' },
      { label: 'UNISEX', href: '/catalog?category=performance&gender=unisex' },
    ],
  },
];

/* ── Hide-on-scroll-down Hook ── */

function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const threshold = 10;
    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 20);
      if (Math.abs(y - lastY.current) < threshold) return;
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { hidden, atTop };
}

/* ── Header Component ── */

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { hidden, atTop } = useScrollDirection();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setHoveredCategory(null);
  }, [pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const isHeaderActive = !atTop || isHeaderHovered || hoveredCategory !== null || isSearchOpen;

  const headerBg = isHeaderActive
    ? 'bg-[#f6f8f9] border-b border-[#17191c]/[0.06] shadow-sm'
    : 'bg-transparent border-b border-transparent';

  const shouldHideHeader = hidden && !isMobileMenuOpen && !isHeaderHovered && !hoveredCategory && !isSearchOpen;

  return (
    <>
      {/* Invisible Mouse Sensor Bar at the very top of screen */}
      <div
        className="fixed top-0 left-0 right-0 h-4 z-[51] pointer-events-auto"
        onMouseEnter={() => setIsHeaderHovered(true)}
      />

      <header
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => {
          setIsHeaderHovered(false);
          setHoveredCategory(null);
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${headerBg} ${
          shouldHideHeader ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* ── Main Bar ── */}
        <div className="w-full px-5 sm:px-8 lg:px-12 h-16 sm:h-[72px] flex items-center justify-between relative">

          {/* LEFT: Logo */}
          <div className="flex items-center gap-3 z-10">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="Ir al inicio">
              <img
                src="/img/Sant_ISO_Negro.png"
                alt="SANTS CLOTHES"
                className="h-8 sm:h-9 w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-110"
              />
              <span className="font-[family-name:var(--font-bebas)] text-xl sm:text-2xl tracking-[0.15em] text-[#17191c] font-black leading-none hidden sm:block drop-shadow-sm">
                SANTS
              </span>
            </Link>
          </div>

          {/* CENTER: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                className="relative"
              >
                <Link
                  href={cat.href}
                  className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 py-6 block ${
                    hoveredCategory === cat.id
                      ? 'text-[#17191c] opacity-100 scale-105'
                      : 'text-[#17191c] hover:opacity-75'
                  }`}
                >
                  {cat.name}
                </Link>
                {/* Active indicator line */}
                <motion.div
                  className="absolute bottom-4 left-0 right-0 h-[2px] bg-[#17191c]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hoveredCategory === cat.id ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'center' }}
                />
              </div>
            ))}

            {/* Separator */}
            <div className="w-px h-4 bg-[#17191c]/20" />

            <Link
              href="/catalog"
              className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#17191c] hover:opacity-75 transition-opacity duration-300 py-6 block"
            >
              CATÁLOGO
            </Link>
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 z-10">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar"
              className="w-10 h-10 flex items-center justify-center text-[#17191c] hover:opacity-70 transition-opacity duration-200"
            >
              <Search className="w-[18px] h-[18px] stroke-[2]" />
            </button>

            {/* Account */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className="w-10 h-10 flex items-center justify-center text-[#17191c] hover:opacity-70 transition-opacity duration-200"
                  aria-label="Mi cuenta"
                >
                  <User className="w-[18px] h-[18px] stroke-[2]" />
                </Link>
                <button
                  onClick={logout}
                  aria-label="Cerrar sesión"
                  className="w-10 h-10 flex items-center justify-center text-[#17191c] hover:opacity-70 transition-opacity duration-200"
                >
                  <LogOut className="w-[18px] h-[18px] stroke-[2]" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex w-10 h-10 items-center justify-center text-[#17191c] hover:opacity-70 transition-opacity duration-200"
                aria-label="Iniciar sesión"
              >
                <User className="w-[18px] h-[18px] stroke-[2]" />
              </Link>
            )}

            {/* Cart */}
            <CartIcon onClick={() => setIsCartOpen(true)} />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-[#17191c] hover:opacity-70 transition-opacity duration-200 ml-1"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[2]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2]" />
              )}
            </button>
          </div>
        </div>

        {/* ── Desktop Mega-Dropdown ── */}
        <AnimatePresence>
          {hoveredCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block overflow-hidden bg-[#f6f8f9] border-b border-[#17191c]/[0.06]"
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="max-w-7xl mx-auto px-12 py-8 grid grid-cols-4 gap-16">
                {NAV_CATEGORIES.filter((c) => c.id === hoveredCategory).map((cat) => (
                  <div key={cat.id} className="col-span-1">
                    <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#17191c]/40 mb-5">
                      LÍNEAS — {cat.name}
                    </p>
                    <ul className="space-y-3">
                      {cat.lines.map((line, i) => (
                        <li key={i}>
                          <Link
                            href={line.href}
                            onClick={() => setHoveredCategory(null)}
                            className="text-sm font-medium text-[#17191c]/70 hover:text-[#17191c] transition-colors duration-200 block"
                          >
                            {line.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="col-span-1">
                  <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#17191c]/40 mb-5">
                    ACCESO RÁPIDO
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/catalog"
                        onClick={() => setHoveredCategory(null)}
                        className="text-sm font-medium text-[#17191c]/70 hover:text-[#17191c] transition-colors duration-200 block"
                      >
                        Todo el catálogo
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/catalog?sort=new"
                        onClick={() => setHoveredCategory(null)}
                        className="text-sm font-medium text-[#17191c]/70 hover:text-[#17191c] transition-colors duration-200 block"
                      >
                        Lo más nuevo
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search Overlay ── */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-[#f6f8f9]/98 backdrop-blur-xl flex flex-col items-center justify-start pt-[20vh]"
            >
              <button
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="absolute top-6 right-6 sm:right-8 w-10 h-10 flex items-center justify-center text-[#17191c]/40 hover:text-[#17191c] transition-colors"
                aria-label="Cerrar búsqueda"
              >
                <X className="w-5 h-5 stroke-[1.8]" />
              </button>

              <div className="w-full max-w-xl px-6">
                <div className="border-b-2 border-[#17191c] pb-3 flex items-center gap-4">
                  <Search className="w-5 h-5 text-[#17191c]/40 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-[#17191c] text-xl sm:text-2xl font-light tracking-tight focus:outline-none placeholder:text-[#17191c]/25"
                  />
                </div>
                <p className="mt-4 text-[11px] tracking-[0.15em] uppercase text-[#17191c]/30 font-medium">
                  Hoodies · Remeras · Pantalones · Polos
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile Full-Screen Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-[#f6f8f9] pt-20 overflow-y-auto lg:hidden"
          >
            <nav className="px-6 sm:px-8 py-8 flex flex-col gap-2">
              {NAV_CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={cat.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 border-b border-[#17191c]/[0.06]"
                  >
                    <span className="font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-[0.08em] text-[#17191c] leading-none">
                      {cat.name}
                    </span>
                  </Link>

                  <div className="flex gap-4 py-3 pl-1">
                    {cat.lines.map((line, j) => (
                      <Link
                        key={j}
                        href={line.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#17191c]/40 hover:text-[#17191c] transition-colors"
                      >
                        {line.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Extra links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 pt-6 border-t border-[#17191c]/[0.06] flex flex-col gap-4"
              >
                <Link
                  href="/catalog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[12px] font-semibold tracking-[0.18em] uppercase text-[#17191c]/60 hover:text-[#17191c] transition-colors"
                >
                  CATÁLOGO COMPLETO
                </Link>

                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-[12px] font-semibold tracking-[0.18em] uppercase text-[#17191c]/60 hover:text-[#17191c] transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      {user?.firstName || 'MI CUENTA'}
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="text-[12px] font-semibold tracking-[0.18em] uppercase text-[#17191c]/40 hover:text-[#17191c] transition-colors text-left flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      CERRAR SESIÓN
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[12px] font-semibold tracking-[0.18em] uppercase text-[#17191c]/60 hover:text-[#17191c] transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    INICIAR SESIÓN
                  </Link>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
