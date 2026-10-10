'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { activeItemId, buildNavItems } from './navMenus';
import type { NavCategory } from './navData';

interface HeaderNavProps {
  navCategories: NavCategory[];
  pathname: string;
}

const HOVER_CLOSE_DELAY = 140;

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

export default function HeaderNav({ navCategories, pathname }: HeaderNavProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [previewHref, setPreviewHref] = useState<string | null>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const toggleRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const activeId = activeItemId(pathname);

  const items = buildNavItems(navCategories);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const close = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
    setOpenId(null);
    setPreviewHref(null);
  }, []);

  useEffect(() => {
    if (!openId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const id = openId;
        close();
        toggleRefs.current[id]?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [openId, close]);

  useEffect(() => () => cancelClose(), []);

  return (
    
    <ul ref={navRef} className="-mx-[9px] flex h-full items-stretch">
      {items.map((item) => {
        const isActive = item.id === activeId;
        const isOpen = item.id === openId;
        const panelId = `header-menu-${item.id}`;
        const textTone = isActive ? 'text-[#17191c]' : 'text-white/80 hover:text-white';
        const catalogStyles = item.id === 'catalogo' ? item.menu?.filter((link) => link.preview) ?? [] : [];
        const previewLink = catalogStyles.find((link) => link.href === previewHref) ?? catalogStyles[0];

        return (
          <li
            key={item.id}
            className="group/item relative flex h-full items-stretch"
            onMouseEnter={() => {
              if (!item.menu || !canHover()) return;
              cancelClose();
              setOpenId(item.id);
            }}
            onMouseLeave={() => {
              if (!item.menu || !canHover()) return;
              cancelClose();
              closeTimer.current = setTimeout(close, HOVER_CLOSE_DELAY);
            }}
            onBlur={(e) => {
              if (isOpen && !e.currentTarget.contains(e.relatedTarget as Node | null)) close();
            }}
          >
            {isActive ? (

<motion.span
                layoutId="header-active-slab"
                aria-hidden
                style={{ skewX: -18 }}

                className="absolute -inset-y-[1.5px] inset-x-0 bg-[#f6f8f9]"
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 40, mass: 0.8 }}
              />
            ) : (
              <span
                aria-hidden
                className={`absolute inset-y-0 inset-x-0 -skew-x-[18deg] transition-colors duration-200 ${isOpen ? 'bg-white/[0.08]' : 'bg-transparent group-hover/item:bg-white/[0.06]'
                  }`}
              />
            )}

            <Link
              href={item.href}
              onClick={close}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center whitespace-nowrap text-[13px] font-medium tracking-[0.01em] transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current ${item.menu ? 'pl-6 pr-1 xl:pl-7' : 'px-8 xl:px-10'
                } ${textTone}`}
            >
              {item.label}
            </Link>

            {item.menu && (
              <button
                ref={(el) => { toggleRefs.current[item.id] = el; }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={`Ver secciones de ${item.label}`}
                onClick={(e) => {

                  if (e.detail > 0 && canHover()) {
                    cancelClose();
                    setOpenId(item.id);
                  } else {
                    setOpenId((v) => (v === item.id ? null : item.id));
                  }
                }}
                className={`relative flex items-center pl-0.5 pr-6 transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current xl:pr-7 ${textTone}`}
              >
                <ChevronDown
                  aria-hidden
                  className={`h-3.5 w-3.5 stroke-[2.25] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            )}

            <AnimatePresence>
              {item.menu && isOpen && (

<motion.div
                  id={panelId}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute left-1/2 top-full z-10 mt-3 -translate-x-1/2 rounded-[10px] border-[1.5px] border-[#d0d1d2] bg-black/30 p-1.5 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)] backdrop-blur-md before:absolute before:inset-x-0 before:-top-[13.5px] before:h-3 before:content-[''] ${item.id === 'catalogo' ? 'w-[620px]' : 'min-w-[230px]'}`}
                >
                  {item.id === 'catalogo' ? (
                    <div className="grid h-[300px] grid-cols-[220px_minmax(0,1fr)] overflow-hidden rounded-md">
                      <div className="flex flex-col border-r border-white/15 p-1.5">
                        <div className="flex flex-1 flex-col justify-center gap-1">
                          {catalogStyles.map((link) => {
                            const isPreviewed = link.href === previewLink?.href;
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={close}
                                onMouseEnter={() => setPreviewHref(link.href)}
                                onFocus={() => setPreviewHref(link.href)}
                                className={`group/style flex items-center gap-3 px-3 py-3 text-[13px] font-medium transition-colors focus-visible:outline-none ${link.styleId ? 'rounded-md' : 'mb-2 border-b border-white/15'} ${isPreviewed ? 'bg-white/[0.12] text-white' : 'text-white/75 hover:bg-white/[0.08] hover:text-white focus-visible:bg-white/[0.12]'}`}
                              >
                                <link.icon aria-hidden className={`h-[18px] w-[18px] shrink-0 transition-opacity ${isPreviewed ? 'opacity-100' : 'opacity-65 group-hover/style:opacity-100'}`} />
                                {link.label}
                                <ArrowRight aria-hidden className={`ml-auto h-4 w-4 transition-[transform,opacity] ${isPreviewed ? 'translate-x-0.5 opacity-100' : 'opacity-45 group-hover/style:translate-x-0.5 group-hover/style:opacity-100'}`} />
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      <div className="relative min-w-0 overflow-hidden bg-white/5">
                        <AnimatePresence mode="wait" initial={false}>
                          {previewLink && (
                            <motion.div
                              key={previewLink.href}
                              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.025 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
                              transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                              className="absolute inset-0"
                            >
                              <Image
                                src={previewLink.preview!}
                                alt=""
                                fill
                                unoptimized
                                sizes="390px"
                                className="object-cover object-[center_30%]"
                              />
                              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/20" />
                              <previewLink.icon aria-hidden className="absolute left-5 top-5 h-6 w-6 text-white drop-shadow-md" />
                              <span className="absolute bottom-5 left-5 font-[family-name:var(--font-bebas)] text-[38px] uppercase leading-none tracking-[0.05em] text-white drop-shadow-md">
                                {previewLink.label}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <ul>
                      {item.menu.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={close}
                            className="group/link flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-white/90 transition-colors duration-150 hover:bg-white/[0.12] hover:text-white focus-visible:bg-white/[0.12] focus-visible:text-white focus-visible:outline-none"
                          >
                            <link.icon aria-hidden className="h-[18px] w-[18px] shrink-0 text-white opacity-70 transition-opacity group-hover/link:opacity-100" />
                            {link.label}
                            <ArrowRight aria-hidden className="ml-auto h-4 w-4 shrink-0 text-white/60 transition-transform group-hover/link:translate-x-0.5" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
