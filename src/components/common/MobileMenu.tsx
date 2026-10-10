'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown, LogOut, User, UserPlus } from 'lucide-react';
import SlashCap from './SlashCap';
import { CARD_CUT, EASE, GLASS_PANEL, PANEL_BACKDROP } from './headerStyles';
import { activeItemId, buildNavItems, type MenuLink } from './navMenus';
import type { NavCategory } from './navData';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navCategories: NavCategory[];
  pathname: string;
  
  activeStyleId: string | null;
  isLoggedIn: boolean;
  firstName?: string;
  onLogout: () => void;
  
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

const SUB_LINK =
  'group/link flex min-h-11 items-center gap-3 rounded-md pl-3 pr-3 text-[14px] font-medium text-white/90 transition-colors duration-150 active:bg-white/[0.12] hover:bg-white/[0.08] focus-visible:bg-white/[0.12] focus-visible:outline-none';

export default function MobileMenu({
  open,
  onClose,
  navCategories,
  pathname,
  activeStyleId,
  isLoggedIn,
  firstName,
  onLogout,
  returnFocusRef,
}: MobileMenuProps) {
  const shouldReduceMotion = useReducedMotion();
  const items = buildNavItems(navCategories);
  const activeId = activeItemId(pathname);

const initialExpanded = () => items.find((i) => i.id === activeId && i.menu)?.id ?? null;
  const [expandedId, setExpandedId] = useState<string | null>(initialExpanded);
  
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setExpandedId(initialExpanded());
  }
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus({ preventScroll: true });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        returnFocusRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    
  }, [onClose, open, returnFocusRef]);

  const enter = (i: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: -6 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.06 + i * 0.035, duration: 0.32, ease: EASE },
        };

  const subLink = (link: MenuLink) => (
    <Link key={link.href} href={link.href} onClick={onClose} className={SUB_LINK}>
      
      <link.icon
        aria-hidden
        className="h-[18px] w-[18px] shrink-0 text-white opacity-70 transition-opacity duration-150 group-hover/link:opacity-100"
      />
      {link.label}
      <ArrowRight
        aria-hidden
        className="ml-auto h-4 w-4 shrink-0 text-white/60 transition-[transform,color] duration-200 group-hover/link:translate-x-0.5 group-hover/link:text-white motion-reduce:transition-none"
      />
    </Link>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          
          <motion.div
            key="mobile-menu-backdrop"
            aria-hidden
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`${PANEL_BACKDROP} z-40 lg:hidden lg:[@media(pointer:coarse)]:!block`}
          />

          <motion.div
            key="mobile-menu-panel"
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-label="Menú"
            tabIndex={-1}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ transformOrigin: 'top center' }}
            className={`fixed inset-x-2 top-16 z-40 mx-auto max-h-[calc(100dvh-76px)] max-w-[480px] overflow-y-auto overscroll-contain sm:inset-x-4 sm:top-[72px] lg:hidden lg:[@media(pointer:coarse)]:!block ${GLASS_PANEL}`}
          >
            <nav aria-label="Principal" className="p-2">
              <ul>
                {items.map((item, i) => {
                  const isActive = item.id === activeId;
                  const isExpanded = item.id === expandedId;
                  const panelId = `mobile-menu-${item.id}`;
                  const styleLinks = item.menu?.filter((l) => l.styleId) ?? [];
                  const plainLinks = item.menu?.filter((l) => !l.styleId) ?? [];

                  return (
                    <motion.li key={item.id} {...enter(i)} className="border-b border-white/10 last:border-b-0">
                      <div className="flex min-h-12 items-center">
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={isActive ? 'page' : undefined}
                          className="flex flex-1 items-center self-stretch pl-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
                        >
                          
                          <span className={`relative isolate px-3 py-1.5 text-[15px] font-medium ${isActive ? 'text-[#17191c]' : 'text-white/90'}`}>
                            {isActive && <span aria-hidden className="absolute inset-0 -z-10 -skew-x-[18deg] bg-[#f6f8f9]" />}
                            {item.label}
                          </span>
                        </Link>
                        {item.menu && (
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={panelId}
                            aria-label={`${isExpanded ? 'Ocultar' : 'Ver'} secciones de ${item.label}`}
                            onClick={() => setExpandedId((v) => (v === item.id ? null : item.id))}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
                          >
                            <ChevronDown
                              aria-hidden
                              className={`h-4 w-4 stroke-[2.25] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}
                      </div>

                      {item.menu && (
                        <motion.div
                          id={panelId}
                          initial={false}
                          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                          className="overflow-hidden"

                          inert={!isExpanded}
                        >
                          <div className="pb-2">
                            {plainLinks.map(subLink)}

                            {styleLinks.length > 0 && (

<div className="mt-1 grid grid-cols-2 gap-2 px-1">
                                {styleLinks.map((link) => {
                                  const isCurrent = link.styleId === activeStyleId;
                                  return (
                                    <Link
                                      key={link.href}
                                      href={link.href}
                                      onClick={onClose}
                                      aria-current={isCurrent ? 'page' : undefined}
                                      className="group/card relative block aspect-square overflow-hidden rounded-md bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                      style={{ clipPath: CARD_CUT }}
                                    >
                                      <Image
                                        src={link.preview!}
                                        alt=""
                                        fill
                                        unoptimized
                                        className="object-cover object-[center_30%] transition-transform duration-500 group-active/card:scale-[1.03]"
                                      />
                                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />
                                      <link.icon aria-hidden className="absolute left-2.5 top-2.5 h-[18px] w-[18px] text-white" />
                                      <span
                                        className={`absolute bottom-2.5 left-3 isolate px-1.5 font-[family-name:var(--font-bebas)] text-[24px] uppercase leading-none tracking-[0.05em] ${isCurrent ? 'text-[#17191c]' : 'text-white'}`}
                                      >
                                        {isCurrent && <span aria-hidden className="absolute -inset-y-0.5 inset-x-0 -z-10 -skew-x-[18deg] bg-[#f6f8f9]" />}
                                        {link.label}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

<motion.div {...enter(items.length)} className="flex h-12 items-stretch px-2 pb-2">
              <div className="flex min-w-0 flex-1 items-stretch">
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={onClose} className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-l-[10px] border-y-[1.5px] border-l-[1.5px] border-[#d0d1d2] px-3 text-[14px] font-medium text-white/90 transition-colors hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white">
                    <User aria-hidden className="h-4 w-4 shrink-0" />
                    <span className="truncate">{firstName || 'Mi cuenta'}</span>
                  </Link>
                ) : (
                  <Link href="/login" onClick={onClose} className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-l-[10px] border-y-[1.5px] border-l-[1.5px] border-[#d0d1d2] px-3 text-[14px] font-medium text-white/90 transition-colors hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white">
                    <User aria-hidden className="h-4 w-4 shrink-0" />
                    Iniciar sesión
                  </Link>
                )}
                <SlashCap side="end" />
              </div>
              <div className="-ml-[8px] flex min-w-0 flex-1 items-stretch sm:-ml-[10px]">
                <SlashCap side="start" />
                {isLoggedIn ? (
                  <button type="button" onClick={() => { onLogout(); onClose(); }} className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-r-[10px] border-y-[1.5px] border-r-[1.5px] border-[#d0d1d2] px-3 text-[14px] font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white">
                    <LogOut aria-hidden className="h-4 w-4 shrink-0" />
                    Cerrar sesión
                  </button>
                ) : (
                  <Link href="/login?mode=register" onClick={onClose} className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-r-[10px] border-y-[1.5px] border-r-[1.5px] border-[#d0d1d2] px-3 text-[14px] font-medium text-white/90 transition-colors hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white">
                    <UserPlus aria-hidden className="h-4 w-4 shrink-0" />
                    Crear cuenta
                  </Link>
                )}
              </div>
            </motion.div>

            <p className="px-4 pb-3 pt-1 text-center font-mono text-[10px] tracking-wide text-white/45">
              © 2026 SANT CLOTHES · Desarrollado por{' '}
              <a href="https://www.instagram.com/vectrapy/" target="_blank" rel="noopener noreferrer" className="font-bold text-white/80 hover:text-white">
                VectraPY
              </a>
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
