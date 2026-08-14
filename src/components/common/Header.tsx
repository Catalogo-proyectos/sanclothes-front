'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { User, LogOut, Search, X, Menu } from 'lucide-react';
import SearchModal from './SearchModal';
import CartIcon from './CartIcon';
import CartDrawer from '../checkout/CartDrawer';
import { useAuth } from '@/hooks/useAuth';
import { useCatalogFilter } from '@/hooks/useCatalogFilter';
import { NAV_CATEGORIES } from './navData';

const MOBILE_MENU_IMAGES: Record<string, string> = {
  casual: '/img/hero/Hero Movil Casual.jpeg',
  streetwear: '/img/hero/Hero Movil Streetweater.jpeg',
  'old-money': '/img/hero/Hero Movil Old Money.jpeg',
  sports: '/img/hero/Hero Movil Sport.jpeg',
};

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
  const shouldReduceMotion = useReducedMotion();
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
            </Link>
          </div>

          {/* CENTER: Desktop Navigation */}
          <nav className="hidden lg:flex lg:[@media(pointer:coarse)]:!hidden items-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 absolute left-[45%] -translate-x-1/2">
            {NAV_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative block whitespace-nowrap py-6 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-opacity duration-300 ${textColor} ${isActive || !activeCategoryId
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
              className={`flex h-8 shrink-0 items-center whitespace-nowrap border px-3 sm:px-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors duration-300 ${isFullCatalogActive
                ? 'border-white bg-white text-[#17191c]'
                : 'border-white/40 text-white hover:border-white hover:bg-white/10'
                }`}
            >
              Catálogo
            </Link>

            <Link
              href="/comunidad"
              aria-current={pathname === '/comunidad' ? 'page' : undefined}
              className={`relative block whitespace-nowrap py-6 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-opacity duration-300 ${textColor} ${pathname === '/comunidad'
                ? 'opacity-100 hover:opacity-75'
                : 'opacity-60 hover:opacity-100'
                }`}
            >
              Comunidad
              {pathname === '/comunidad' && (
                <motion.span
                  layoutId="nav-category-underline"
                  aria-hidden
                  className="absolute left-0 right-0 bottom-4 h-[2px] bg-white"
                  transition={{ type: 'spring', stiffness: 520, damping: 42, mass: 0.7 }}
                />
              )}
            </Link>

            <Link
              href="/nosotros"
              aria-current={pathname === '/nosotros' ? 'page' : undefined}
              className={`relative block whitespace-nowrap py-6 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-opacity duration-300 ${textColor} ${pathname === '/nosotros'
                ? 'opacity-100 hover:opacity-75'
                : 'opacity-60 hover:opacity-100'
                }`}
            >
              Nosotros
              {pathname === '/nosotros' && (
                <motion.span
                  layoutId="nav-category-underline"
                  aria-hidden
                  className="absolute left-0 right-0 bottom-4 h-[2px] bg-white"
                  transition={{ type: 'spring', stiffness: 520, damping: 42, mass: 0.7 }}
                />
              )}
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
               className={`lg:hidden lg:[@media(pointer:coarse)]:!flex w-10 h-10 flex items-center justify-center transition-colors duration-300 hover:opacity-70 ml-1 ${textColor}`}
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
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-black/85 backdrop-blur-xl pt-20 text-[#f6f8f9] overflow-y-auto lg:hidden lg:[@media(pointer:coarse)]:!block"
          >
            <nav className="px-5 sm:px-8 pb-8">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="border-b border-white/10 pb-5"
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
                      MENU / COLECCIONES
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-bebas)] text-5xl uppercase leading-none tracking-[0.06em]">
                      SANT CLOTHES
                    </h2>
                  </div>
                  <span className="mb-1 border border-white/15 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">
                    CDE / PY
                  </span>
                </div>
              </motion.div>

              <div className="py-4">
                {NAV_CATEGORIES.map((cat, i) => {
                  const isActive = cat.id === activeCategoryId;

                  return (
                    <motion.div
                      key={cat.id}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: shouldReduceMotion ? 0 : 0.08 + 0.06 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={cat.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group -mx-3 grid grid-cols-[72px_minmax(0,1fr)] gap-4 border p-3 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${isActive
                          ? 'border-[#f6f8f9] bg-[#f6f8f9] text-[#17191c]'
                          : 'border-white/10 text-[#f6f8f9] hover:border-white/25 hover:bg-white/[0.04]'
                          }`}
                      >
                        <span className={`relative aspect-[3/4] overflow-hidden border ${isActive ? 'border-[#17191c]/15' : 'border-white/10'}`}>
                          <Image
                            src={MOBILE_MENU_IMAGES[cat.id] ?? cat.featuredImage}
                            alt={`${cat.displayTitle} - SANT CLOTHES`}
                            fill
                            sizes="72px"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </span>

                        <span className="flex min-w-0 flex-col justify-between py-0.5">
                          <span>
                            <span className="block font-[family-name:var(--font-bebas)] text-[42px] uppercase leading-[0.9] tracking-[0.055em]">
                              {cat.name}
                            </span>
                          </span>

                          <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                            {[...cat.col1Links.slice(1, 3), cat.col2Links[0]].map((line) => (
                              <span
                                key={line.href}
                                className={`font-mono text-[9px] font-bold uppercase tracking-[0.18em] ${isActive ? 'text-[#17191c]/45' : 'text-white/35'}`}
                              >
                                {line.label}
                              </span>
                            ))}
                          </span>
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.34, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="border-t border-white/10 pt-5"
              >
                <div className="grid grid-cols-2 border border-white/15">
                  <Link
                    href="/catalog"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isFullCatalogActive ? 'page' : undefined}
                    className={`col-span-2 border-b border-white/15 px-4 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${isFullCatalogActive
                      ? 'bg-[#f6f8f9] text-[#17191c]'
                      : 'text-[#f6f8f9] hover:bg-white/[0.06]'
                      }`}
                  >
                    Catalogo completo
                  </Link>
                  <Link
                    href="/comunidad"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={pathname === '/comunidad' ? 'page' : undefined}
                    className={`border-r border-white/15 px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${pathname === '/comunidad'
                      ? 'bg-[#f6f8f9] text-[#17191c]'
                      : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
                      }`}
                  >
                    Comunidad
                  </Link>
                  <Link
                    href="/nosotros"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={pathname === '/nosotros' ? 'page' : undefined}
                    className={`px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${pathname === '/nosotros'
                      ? 'bg-[#f6f8f9] text-[#17191c]'
                      : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
                      }`}
                  >
                    Nosotros
                  </Link>
                </div>

                {isLoggedIn ? (
                  <div className="mt-5 grid grid-cols-2 border border-white/15">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 border-r border-white/15 px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/65 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <User className="w-4 h-4" />
                      {user?.firstName || 'MI CUENTA'}
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-2 px-4 py-4 text-left font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/45 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <LogOut className="w-4 h-4" />
                      CERRAR SESION
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-5 flex items-center gap-2 border border-white/15 px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/65 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <User className="w-4 h-4" />
                    INICIAR SESION
                  </Link>
                )}
              </motion.div>

              {/* Mobile Menu Copyright & Credits */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 pt-6 border-t border-white/10 text-center text-[11px] font-mono text-white/50 tracking-wide"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <span>© 2026 Todos los derechos reservados.</span>
                  <span className="hidden sm:inline">·</span>
                  <span>
                    Desarrollado por{' '}
                    <a
                      href="https://www.instagram.com/vectrapy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white hover:underline transition-all cursor-pointer"
                    >
                      VectraPY
                    </a>
                  </span>
                </div>
              </motion.div>

              {false && (
                <>
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
                      className={`font-[family-name:var(--font-bebas)] text-4xl sm:text-5xl tracking-[0.08em] leading-none ${cat.id === activeCategoryId
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
                  className={`self-start border px-5 py-3 text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors ${isFullCatalogActive
                    ? 'border-[#17191c] bg-[#17191c] text-white'
                    : 'border-[#17191c]/25 text-[#17191c]/60 hover:border-[#17191c] hover:text-[#17191c]'
                    }`}
                >
                  CATÁLOGO COMPLETO
                </Link>

                <Link
                  href="/comunidad"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={pathname === '/comunidad' ? 'page' : undefined}
                  className={`text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors ${pathname === '/comunidad'
                    ? 'text-[#17191c]'
                    : 'text-[#17191c]/60 hover:text-[#17191c]'
                    }`}
                >
                  COMUNIDAD
                </Link>

                <Link
                  href="/nosotros"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={pathname === '/nosotros' ? 'page' : undefined}
                  className={`text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors ${pathname === '/nosotros'
                    ? 'text-[#17191c]'
                    : 'text-[#17191c]/60 hover:text-[#17191c]'
                    }`}
                >
                  NOSOTROS
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
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}
