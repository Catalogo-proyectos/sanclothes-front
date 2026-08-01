'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Search, X, Menu } from 'lucide-react';
import CartIcon from './CartIcon';
import CartDrawer from '../checkout/CartDrawer';
import { useAuth } from '@/hooks/useAuth';
import { NAV_CATEGORIES } from './navData';
import MegaMenuPanel from './MegaMenuPanel';

/* ── Throttled & Optimized Hide-on-scroll-down Hook ── */

function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const lastY = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const threshold = 10;
    const onScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          const newAtTop = y < 20;
          setAtTop((prev) => (prev !== newAtTop ? newAtTop : prev));

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

  return { hidden, atTop };
}

/* ── Decode dropdown artwork while the main thread is idle ── */

function useDecodeNavImages() {
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      for (const cat of NAV_CATEGORIES) {
        const img = new Image();
        img.fetchPriority = 'low';
        img.src = cat.featuredImage;
        void img.decode().catch(() => {});
      }
    };
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const handle = hasIdle
      ? window.requestIdleCallback(run, { timeout: 2500 })
      : window.setTimeout(run, 1200);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(handle);
      else clearTimeout(handle);
    };
  }, []);
}

/* ── Header Component ── */

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isLoggedIn = useAuth((s) => s.isLoggedIn);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { hidden, atTop } = useScrollDirection();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useDecodeNavImages();

  // Smooth hover handlers with grace period debounce
  const handleMouseEnterHeader = useCallback(() => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setIsHeaderHovered(true);
  }, []);

  const handleMouseLeaveHeader = useCallback(() => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setIsHeaderHovered(false);
      setHoveredCategory(null);
    }, 120);
  }, []);

  const handleMouseEnterCategory = useCallback((catId: string) => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setIsHeaderHovered(true);
    setHoveredCategory(catId);
  }, []);

  const closeDropdown = useCallback(() => setHoveredCategory(null), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  useEffect(() => () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
  }, []);

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

  // The transparent header with white text only works over a dark hero. Every route
  // renders one behind the header (Hero on "/", PageHero elsewhere) except the product
  // detail page, which opens straight onto the light surface — there, white-on-#f6f8f9
  // measures ~1.05:1 contrast and the nav is effectively invisible. On those routes the
  // header stays in its solid state from the very top.
  const hasDarkHeroBehindHeader = !pathname.startsWith('/products/');
  const isHeaderActive =
    !hasDarkHeroBehindHeader || !atTop || isHeaderHovered || hoveredCategory !== null || isSearchOpen;

  const headerBg = isHeaderActive
    ? 'bg-white border-b border-[#17191c]/[0.08] shadow-sm'
    : 'bg-transparent border-b border-transparent';

  const textColor = isHeaderActive ? 'text-[#17191c]' : 'text-white';
  const activeLineBg = isHeaderActive ? 'bg-[#17191c]' : 'bg-white';
  const logoFilter = isHeaderActive ? '' : 'brightness-0 invert';

  const shouldHideHeader = hidden && !isMobileMenuOpen && !isHeaderHovered && !hoveredCategory && !isSearchOpen;
  const isDropdownOpen = hoveredCategory !== null;

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
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out will-change-transform transform-gpu ${headerBg} ${
          shouldHideHeader ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* ── Main Bar ── */}
        <div className="w-full px-5 sm:px-8 lg:px-12 h-16 sm:h-[72px] flex items-center justify-between relative">

          {/* LEFT: Logo */}
          <div className="flex items-center gap-3 z-10">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="Ir al inicio">
              <img
                src="/img/logo/Sant_ISO_Negro.png"
                alt="SANTS CLOTHES"
                width={144}
                height={144}
                className={`h-8 sm:h-9 w-auto object-contain transition-all duration-300 group-hover:scale-110 ${logoFilter}`}
              />
              <span className={`font-[family-name:var(--font-bebas)] text-xl sm:text-2xl tracking-[0.15em] font-black leading-none hidden sm:block drop-shadow-sm transition-colors duration-300 ${textColor}`}>
                SANTS
              </span>
            </Link>
          </div>

          {/* CENTER: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {NAV_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onMouseEnter={() => handleMouseEnterCategory(cat.id)}
                className="relative"
              >
                <Link
                  href={cat.href}
                  className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 py-6 block ${
                    hoveredCategory === cat.id
                      ? `${textColor} opacity-100 scale-105`
                      : `${textColor} hover:opacity-75`
                  }`}
                >
                  {cat.name}
                </Link>
                {/* GPU-Accelerated Active indicator line */}
                <div
                  className={`absolute bottom-4 left-0 right-0 h-[2px] ${activeLineBg} transition-transform duration-300 ease-out origin-center ${
                    hoveredCategory === cat.id ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </div>
            ))}


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
            <CartIcon onClick={openCart} isWhiteText={!isHeaderActive} />

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

        {/* ── Desktop Mega-Dropdown ── */}
        {/* Stays mounted (collapsed) so the artwork is fetched and decoded long before
            the first hover. The reveal uses the grid-template-rows 0fr→1fr technique so
            the browser resolves the open height itself — no JS measurement pass, which
            is what made the first open mis-size. `contain` scopes the reflow. */}
        <div
          className={`hidden lg:grid overflow-hidden bg-white border-b border-[#17191c]/[0.08] shadow-2xl [contain:layout_style] transition-[grid-template-rows,opacity] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isDropdownOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
          style={{ pointerEvents: isDropdownOpen ? 'auto' : 'none' }}
          aria-hidden={!isDropdownOpen}
          inert={!isDropdownOpen}
          onMouseEnter={handleMouseEnterHeader}
          onMouseLeave={handleMouseLeaveHeader}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="max-w-7xl mx-auto pl-8 sm:pl-12 lg:pl-16 pr-0 py-8 relative">
              {NAV_CATEGORIES.map((cat) => (
                <MegaMenuPanel
                  key={cat.id}
                  cat={cat}
                  isActive={cat.id === hoveredCategory}
                  onNavigate={closeDropdown}
                />
              ))}
            </div>
          </div>
        </div>

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

      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}
