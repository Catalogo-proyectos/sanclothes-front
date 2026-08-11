'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Search, X, Menu } from 'lucide-react';
import SearchModal from './SearchModal';
import CartIcon from './CartIcon';
import CartDrawer from '../checkout/CartDrawer';
import { useAuth } from '@/hooks/useAuth';
import { useCatalogFilter } from '@/hooks/useCatalogFilter';
import { NAV_CATEGORIES } from './navData';

/* ── Throttled & Optimized Hide-on-scroll-down Hook ── */

function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const threshold = 10;
    const onScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          if (Math.abs(y - lastY.current) >= threshold) {
            const newHidden = y > lastY.current && y > 80;
            setHidden((prev) => (prev !== newHidden ? newHidden : prev));
            lastY.current = y;
          }
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { hidden };
}

/* ── Tracks whether the home hero has been fully scrolled past ──
   Home renders a "#hero-cover-zone" element exactly as tall as the hero (see Hero.tsx);
   other routes don't have one. Once its bottom edge scrolls above the viewport, the hero
   is completely gone and the header should never hide again — only while the hero is still
   partly on screen does the normal hide-on-scroll-down behavior apply. Routes without the
   marker (no hero) are treated as "past" immediately, matching their existing solid header. */
function useIsPastHero(pathname: string) {
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    const el = document.getElementById('hero-cover-zone');
    if (!el) {
      setIsPastHero(true);
      return;
    }
    setIsPastHero(false);

    const observer = new IntersectionObserver(
      ([entry]) => setIsPastHero(entry.boundingClientRect.bottom <= 0),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  return isPastHero;
}

/* ── Header Component ── */

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isLoggedIn = useAuth((s) => s.isLoggedIn);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { hidden } = useScrollDirection();
  const pathname = usePathname();
  const isPastHero = useIsPastHero(pathname);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Read from the store rather than useSearchParams: this header sits in the root
  // layout, and useSearchParams there would force every route to render dynamically.
  // ProductGrid writes the style whenever /catalog reads `?category=`, and the
  // pathname guard keeps a stale value from marking a link on other routes.
  const activeStyle = useCatalogFilter((s) => s.style);
  const activeCategoryId = pathname === '/catalog' ? activeStyle : null;

  // The catch-all sits next to the four style lines: same route, no `?category=`,
  // so it's the active one exactly when no style is.
  const isFullCatalogActive = pathname === '/catalog' && activeStyle === null;

  // Smooth hover handlers with grace period debounce
  const handleMouseEnterHeader = useCallback(() => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setIsHeaderHovered(true);
  }, []);

  const handleMouseLeaveHeader = useCallback(() => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => setIsHeaderHovered(false), 120);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  useEffect(() => () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
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

  // The transparent header with white text only works over a dark hero. Every route
  // renders one behind the header (Hero on "/", PageHero elsewhere) except the product
  // detail page, which opens straight onto the light surface — there, white-on-#f6f8f9
  // measures ~1.05:1 contrast and the nav is effectively invisible. On those routes the
  // header stays in its solid state from the very top. On "/" it flips to solid black
  // text only once the hero has been fully scrolled past (isPastHero), not on the first
  // pixel of scroll — while any part of the hero is still on screen the header stays
  // transparent with white text.
  const hasDarkHeroBehindHeader = !pathname.startsWith('/products/') && !pathname.startsWith('/catalog');
  const isHeaderActive = !hasDarkHeroBehindHeader || isPastHero || isSearchOpen;

  // Header is transparent with backdrop blur
  const headerBg = 'bg-black/30 backdrop-blur-md border-b border-white/10 text-white';

  // Text, icons, and logo are white when header is transparent
  const textColor = 'text-white';
  const logoFilter = 'brightness-0 invert';

  // Never hide header on scroll - stays fixed and transparent at all times
  const shouldHideHeader = false;

  return (
    <>
      {/* Invisible Mouse Sensor Bar at the very top of screen */}
      <div
        className="fixed top-0 left-0 right-0 h-4 z-[51] pointer-events-auto"
        onMouseEnter={handleMouseEnterHeader}
      />

      <header
        onMouseEnter={handleMouseEnterHeader}
        onMouseLeave={handleMouseLeaveHeader}
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out will-change-transform transform-gpu ${headerBg} ${shouldHideHeader ? '-translate-y-full' : 'translate-y-0'
          }`}
      >
        {/* ── Main Bar ── */}
        <div className="w-full px-5 sm:px-8 lg:px-12 h-16 sm:h-[72px] flex items-center justify-between relative">

          {/* LEFT: Logo */}
          <div className="flex items-center gap-3 z-10">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="Ir al inicio">
              <img
                src="/img/logo/Sant_ISO_Negro.png"
                alt="SANT CLOTHES"
                width={144}
                height={144}
                className={`h-8 sm:h-9 w-auto object-contain transition-all duration-300 group-hover:scale-110 ${logoFilter}`}
              />
              <span className={`font-[family-name:var(--font-bebas)] text-xl sm:text-2xl tracking-[0.15em] font-black leading-none hidden sm:block drop-shadow-sm transition-colors duration-300 ${textColor}`}>
                SANT
              </span>
            </Link>
          </div>

          {/* CENTER: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative block whitespace-nowrap py-6 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-opacity duration-300 ${textColor} ${
                    isActive || !activeCategoryId
                      ? 'opacity-100 hover:opacity-75'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {cat.name}
                  {isActive && (
                    <motion.span
                      layoutId="nav-category-underline"
                      aria-hidden
                      className="absolute left-0 right-0 bottom-4 h-[2px] bg-white"
                      transition={{ type: 'spring', stiffness: 520, damping: 42, mass: 0.7 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* The style links are plain text; this one carries a border so it reads
                as the way out of a filtered view rather than a fifth style. */}
            <Link
              href="/catalog"
              aria-current={isFullCatalogActive ? 'page' : undefined}
              className={`flex h-8 shrink-0 items-center whitespace-nowrap border px-3 sm:px-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors duration-300 ${
                isFullCatalogActive
                  ? 'border-white bg-white text-[#17191c]'
                  : 'border-white/40 text-white hover:border-white hover:bg-white/10'
              }`}
            >
              Catálogo
            </Link>
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 z-10">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar"
              className={`w-10 h-10 flex items-center justify-center transition-colors duration-300 hover:opacity-70 ${textColor}`}
            >
              <Search className="w-[18px] h-[18px] stroke-[2]" />
            </button>

            {/* Account */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className={`w-10 h-10 flex items-center justify-center transition-colors duration-300 hover:opacity-70 ${textColor}`}
                  aria-label="Mi cuenta"
                >
                  <User className="w-[18px] h-[18px] stroke-[2]" />
                </Link>
                <button
                  onClick={logout}
                  aria-label="Cerrar sesión"
                  className={`w-10 h-10 flex items-center justify-center transition-colors duration-300 hover:opacity-70 ${textColor}`}
                >
                  <LogOut className="w-[18px] h-[18px] stroke-[2]" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`hidden sm:flex w-10 h-10 items-center justify-center transition-colors duration-300 hover:opacity-70 ${textColor}`}
                aria-label="Iniciar sesión"
              >
                <User className="w-[18px] h-[18px] stroke-[2]" />
              </Link>
            )}

            {/* Cart */}
            <CartIcon onClick={openCart} isWhiteText={true} />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className={`lg:hidden w-10 h-10 flex items-center justify-center transition-colors duration-300 hover:opacity-70 ml-1 ${textColor}`}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[2]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2]" />
              )}
            </button>
          </div>
        </div>

      </header>

      {/* ── Search Modal ── */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

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
                    aria-current={cat.id === activeCategoryId ? 'page' : undefined}
                    className="block py-3 border-b border-[#17191c]/[0.06]"
                  >
                    <span
                      className={`font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-[0.08em] leading-none ${
                        cat.id === activeCategoryId
                          ? 'text-[#17191c] underline decoration-2 underline-offset-8'
                          : // Only dim the others once something is actually selected —
                            // with no filter on, the four read as equals.
                            activeCategoryId
                            ? 'text-[#17191c]/45'
                            : 'text-[#17191c]'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </Link>

                  <div className="flex flex-wrap gap-4 py-3 pl-1">
                    {cat.col1Links.slice(1, 4).map((line, j) => (
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
                  aria-current={isFullCatalogActive ? 'page' : undefined}
                  className={`self-start border px-5 py-3 text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors ${
                    isFullCatalogActive
                      ? 'border-[#17191c] bg-[#17191c] text-white'
                      : 'border-[#17191c]/25 text-[#17191c]/60 hover:border-[#17191c] hover:text-[#17191c]'
                  }`}
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

      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}
