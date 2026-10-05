'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { User, LogOut, Search, X, Menu } from 'lucide-react';
import CartIcon from './CartIcon';
import { useAuth } from '@/hooks/useAuth';
import { useCatalogFilter } from '@/hooks/useCatalogFilter';
import { NAV_CATEGORIES, type NavCategory } from './navData';

const SearchModal = dynamic(() => import('./SearchModal'), { ssr: false });
const CartDrawer = dynamic(() => import('../checkout/CartDrawer'), { ssr: false });

const MOBILE_MENU_IMAGES: Record<string, string> = {
  casual: '/img/hero/Hero Movil Casual.jpeg',
  streetwear: '/img/hero/Hero Movil Streetweater.jpeg',
  'old-money': '/img/hero/Hero Movil Old Money.jpeg',
  sports: '/img/hero/Hero Movil Sport.jpeg',
};
interface HeaderProps {
  /** Catálogo v2: menú armado con la taxonomía del admin (layout). */
  navCategories?: NavCategory[];
}

export default function Header({ navCategories = NAV_CATEGORIES }: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isLoggedIn = useAuth((s) => s.isLoggedIn);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();





  const activeStyle = useCatalogFilter((s) => s.style);
  const activeCategoryId = pathname === '/catalog' ? activeStyle : null;

  const isKnownRoute = (path: string) => {
    if (path === '/mantenimiento' || path === '/error-preview' || path === '/404') return false;
    const knownExact = ['/', '/catalog', '/comunidad', '/nosotros', '/about', '/login', '/checkout', '/dashboard', '/reset-password'];
    if (knownExact.includes(path)) return true;
    if (path.startsWith('/products/')) return true;
    return false;
  };

  const isFullCatalogActive = pathname === '/catalog' && activeStyle === null;

  const openCart = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsCartOpen(true);
  }, []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);









  const headerBg = 'bg-black/30 backdrop-blur-md border-b border-white/10 text-white';


  const textColor = 'text-white';
  const logoFilter = 'brightness-0 invert';


  if (!isKnownRoute(pathname)) {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 translate-y-0 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out transform-gpu ${headerBg}`}
      >

        <div className="w-full px-5 sm:px-8 lg:px-12 h-16 sm:h-[72px] flex items-center justify-between relative">


          <div className="flex items-center gap-3 z-10">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="Ir al inicio">
              <Image
                src="/img/logo/Sant_ISO_Negro.png"
                alt="SANT CLOTHES"
                width={144}
                height={144}
                loading="eager"
                sizes="(max-width: 639px) 32px, 36px"
                className={`h-8 sm:h-9 w-auto object-contain transition-all duration-300 group-hover:scale-110 ${logoFilter}`}
              />
            </Link>
          </div>


          <nav className="hidden lg:flex lg:[@media(pointer:coarse)]:!hidden items-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 absolute left-[45%] -translate-x-1/2">
            {navCategories.map((cat) => {
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


          <div className="flex items-center gap-1 sm:gap-2 z-10">

            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar"
              className={`w-10 h-10 flex items-center justify-center transition-colors duration-300 hover:opacity-70 ${textColor}`}
            >
              <Search className="w-[18px] h-[18px] stroke-[2]" />
            </button>


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


            <CartIcon onClick={openCart} isWhiteText={true} />


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


      {isSearchOpen && (
        <SearchModal isOpen onClose={() => setIsSearchOpen(false)} />
      )}


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
                {navCategories.map((cat, i) => {
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
                            {[...cat.col1Links.slice(1, 3), ...cat.col2Links.slice(0, 1)].map((line) => (
                              <span
                                key={line.label}
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
              {navCategories.map((cat, i) => (
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
                        :

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

      {isCartOpen && <CartDrawer isOpen onClose={closeCart} />}
    </>
  );
}
