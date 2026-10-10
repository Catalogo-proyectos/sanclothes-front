'use client';

import { useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { CATALOG_CHIPS, ChipId } from '@/lib/catalogFilters';
import { useCatalogFilter } from '@/hooks/useCatalogFilter';

interface CategoryChipRailProps {

  inverted: boolean;
}

export default function CategoryChipRail({ inverted }: CategoryChipRailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const chip = useCatalogFilter((s) => s.chip);
  const setChip = useCatalogFilter((s) => s.setChip);
  const syncFromUrl = useCatalogFilter((s) => s.syncFromUrl);

useEffect(() => {
    const adopt = () => syncFromUrl(new URLSearchParams(window.location.search).get('c'));
    adopt();
    window.addEventListener('popstate', adopt);
    return () => window.removeEventListener('popstate', adopt);
  }, [pathname, syncFromUrl]);

  const onCatalog = pathname === '/catalog';

  const handleSelect = useCallback(
    (id: ChipId) => {
      setChip(id);
      if (onCatalog) {
        const query = id === 'todo' ? '' : `?c=${id}`;
        window.history.replaceState(null, '', `/catalog${query}`);

const grid = document.getElementById('catalog-grid');
        if (grid) {
          const top = window.scrollY + grid.getBoundingClientRect().top - 132;
          if (window.scrollY > top) {
            window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
          }
        }
      } else {
        router.push(id === 'todo' ? '/catalog' : `/catalog?c=${id}`);
      }
    },
    [onCatalog, reduceMotion, router, setChip],
  );

  const railBorder = inverted ? 'border-white/15' : 'border-[#17191c]/10';

const idleLabel = inverted
    ? 'text-white/80 hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]'
    : 'text-[#17191c]/45 hover:text-[#17191c]';
  const activeLabel = inverted ? 'text-[#17191c]' : 'text-white';
  const slab = inverted ? 'bg-white' : 'bg-[#17191c]';
  const focusRing = inverted ? 'focus-visible:outline-white' : 'focus-visible:outline-[#17191c]';

  return (
    <div className={`border-t ${railBorder} transition-colors duration-300`}>
      <div className="w-full px-5 sm:px-8 lg:px-12">

        <div
          role="group"
          aria-label="Filtrar catálogo"
          className="flex items-stretch -mx-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATALOG_CHIPS.map((c) => {
            const isActive = c.id === chip;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c.id)}
                aria-pressed={isActive}
                className={`relative shrink-0 mx-1 h-11 px-4 sm:px-5 flex items-center gap-2 whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${focusRing} ${
                  isActive ? activeLabel : idleLabel
                }`}
              >

                {isActive && (
                  <motion.span
                    layoutId="chip-slab"
                    aria-hidden
                    className={`absolute inset-0 -z-10 ${slab}`}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 }
                    }
                  />
                )}
                <span className="font-[family-name:var(--font-bebas)] text-[15px] sm:text-[17px] uppercase leading-none tracking-[0.14em]">
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
