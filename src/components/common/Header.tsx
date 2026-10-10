'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { User, LogOut, Search, X, Menu } from 'lucide-react';
import CartIcon from './CartIcon';
import HeaderNav from './HeaderNav';
import SegmentOutline from './SegmentOutline';
import { useAuth } from '@/hooks/useAuth';
import { useCatalogFilter } from '@/hooks/useCatalogFilter';
import { NAV_CATEGORIES, type NavCategory } from './navData';

const SearchModal = dynamic(() => import('./SearchModal'), { ssr: false });
const CartDrawer = dynamic(() => import('../checkout/CartDrawer'), { ssr: false });

type MobileMenuComponent = (typeof import('./MobileMenu'))['default'];

const KNOWN_ROUTES = new Set([
  '/',
  '/catalog',
  '/comunidad',
  '/nosotros',
  '/about',
  '/login',
  '/checkout',
  '/dashboard',
  '/reset-password',
]);

const isKnownRoute = (path: string) =>
  KNOWN_ROUTES.has(path) || path.startsWith('/products/') || path.startsWith('/pedido/');

interface HeaderProps {
  
  navCategories?: NavCategory[];
}

export default function Header({ navCategories = NAV_CATEGORIES }: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [MobileMenu, setMobileMenu] = useState<MobileMenuComponent | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isLoggedIn = useAuth((s) => s.isLoggedIn);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const syncFromStorage = useAuth((s) => s.syncFromStorage);

useEffect(() => {
    void syncFromStorage();
  }, [syncFromStorage]);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuImportRef = useRef<Promise<{ default: MobileMenuComponent }> | null>(null);

const activeStyle = useCatalogFilter((s) => s.style);
  const activeCategoryId = pathname === '/catalog' ? activeStyle : null;

  const openCart = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsCartOpen(true);
  }, []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const loadMobileMenu = useCallback(() => {
    if (MobileMenu) return;
    const pendingImport = mobileMenuImportRef.current ?? import('./MobileMenu');
    mobileMenuImportRef.current = pendingImport;
    void pendingImport.then((module) => setMobileMenu(() => module.default));
  }, [MobileMenu]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

const segmentFill = 'bg-black/30 backdrop-blur-md';

const segmentShape = 'relative isolate items-stretch [--s:15.6px] sm:[--s:18.2px]';
  const cutSpace = 'block w-[15.6px] shrink-0 sm:w-[18.2px]';
  const SHAPES = {
    start: 'polygon(0 0, 100% 0, calc(100% - var(--s)) 100%, 0 100%)',
    middle: 'polygon(var(--s) 0, 100% 0, calc(100% - var(--s)) 100%, 0 100%)',
    end: 'polygon(var(--s) 0, 100% 0, 100% 100%, 0 100%)',
  };
  
  const iconButton = 'flex h-10 w-10 max-[359px]:w-9 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

if (!isKnownRoute(pathname)) {
    return null;
  }

  return (
    <>
      <header className="pointer-events-none fixed top-0 left-0 right-0 z-50 text-white">

<div className="mx-auto flex h-16 max-w-[496px] items-stretch justify-center px-2 py-2 sm:h-[72px] sm:max-w-[512px] sm:px-4 lg:max-w-none lg:px-6 lg:[@media(pointer:coarse)]:!max-w-[512px] lg:[@media(pointer:coarse)]:!px-4">

<div className={`pointer-events-auto flex min-w-0 flex-1 lg:flex-none lg:[@media(pointer:coarse)]:!flex-1 ${segmentShape}`}>
            <span aria-hidden className={`absolute inset-0 -z-10 rounded-l-[10px] ${segmentFill}`} style={{ clipPath: SHAPES.start }} />
            <SegmentOutline kind="start" />
            <div className="relative flex flex-1 items-center py-[1.5px] pl-3 pr-2 max-[359px]:pl-2.5 sm:pl-5 sm:pr-4 lg:flex-none lg:[@media(pointer:coarse)]:!flex-1">
              <Link href="/" className="group flex items-center gap-2.5 max-[359px]:gap-2 sm:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" aria-label="SANT CLOTHES, ir al inicio">
                <Image
                  src="/img/web/logo/sant-iso-negro.webp"
                  alt=""
                  width={144}
                  height={144}
                  loading="eager"
                  sizes="(max-width: 639px) 28px, 34px"
                  className="h-7 w-auto object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-110 sm:h-[34px]"
                />
                <span className="flex flex-col">
                  <span className="font-[family-name:var(--font-bebas)] text-[21px] leading-none tracking-[0.06em] text-white max-[359px]:text-[18px] sm:text-[25px]">
                    SANT CLOTHES
                  </span>
                  <span className="mt-1 font-mono text-[8px] font-bold uppercase leading-none tracking-[0.42em] text-[#b6b2a7] sm:text-[9px]">
                    SANT CLUB
                  </span>
                </span>
              </Link>
            </div>
            <span aria-hidden className={cutSpace} />
          </div>

<nav aria-label="Principal" className={`pointer-events-auto ${segmentShape} -ml-[10px] hidden shrink-0 lg:flex lg:[@media(pointer:coarse)]:!hidden`}>
            <span aria-hidden className={`absolute inset-0 -z-10 ${segmentFill}`} style={{ clipPath: SHAPES.middle }} />
            <SegmentOutline kind="middle" />
            <span aria-hidden className={cutSpace} />
            <div className="relative flex min-w-0 flex-1 items-stretch py-[1.5px]">
              <HeaderNav navCategories={navCategories} pathname={pathname} />
            </div>
            <span aria-hidden className={cutSpace} />
          </nav>

<div className={`pointer-events-auto flex shrink-0 ${segmentShape} -ml-[8px] sm:-ml-[10px]`}>
            <span aria-hidden className={`absolute inset-0 -z-10 rounded-r-[10px] ${segmentFill}`} style={{ clipPath: SHAPES.end }} />
            <SegmentOutline kind="end" />
            <span aria-hidden className={cutSpace} />
            <div className="relative flex items-center gap-0.5 py-[1.5px] pl-1 pr-2 sm:gap-1 sm:pl-2 sm:pr-3">
              <button
                ref={searchButtonRef}
                onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }}
                aria-label="Buscar"
                className={iconButton}
              >
                <Search className="h-5 w-5 stroke-[1.75]" />
              </button>

              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" aria-label="Mi cuenta" className={`hidden sm:flex ${iconButton}`}>
                    <User className="h-5 w-5 stroke-[1.75]" />
                  </Link>
                  <button onClick={logout} aria-label="Cerrar sesión" className={`hidden sm:flex ${iconButton}`}>
                    <LogOut className="h-5 w-5 stroke-[1.75]" />
                  </button>
                </>
              ) : (
                <Link href="/login" aria-label="Iniciar sesión" className={`hidden sm:flex ${iconButton}`}>
                  <User className="h-5 w-5 stroke-[1.75]" />
                </Link>
              )}

              <CartIcon onClick={openCart} isWhiteText={true} />

              <button
                ref={menuButtonRef}
                onPointerEnter={loadMobileMenu}
                onFocus={loadMobileMenu}
                onClick={() => {
                  loadMobileMenu();
                  setIsMobileMenuOpen((v) => !v);
                }}
                aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                className={`lg:hidden lg:[@media(pointer:coarse)]:!flex ${iconButton}`}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 stroke-[1.75]" />
                ) : (
                  <Menu className="h-5 w-5 stroke-[1.75]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

{isSearchOpen && (
        <SearchModal isOpen onClose={() => setIsSearchOpen(false)} navCategories={navCategories} returnFocusRef={searchButtonRef} />
      )}

{MobileMenu && (
        <MobileMenu
          open={isMobileMenuOpen}
          onClose={closeMobileMenu}
          navCategories={navCategories}
          pathname={pathname}
          activeStyleId={activeCategoryId}
          isLoggedIn={isLoggedIn}
          firstName={user?.firstName}
          onLogout={logout}
          returnFocusRef={menuButtonRef}
        />
      )}

      {isCartOpen && <CartDrawer isOpen onClose={closeCart} />}
    </>
  );
}
