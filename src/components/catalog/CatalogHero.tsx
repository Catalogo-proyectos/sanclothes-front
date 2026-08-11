'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { StyleId, getCatalogHero, getStyle } from '@/lib/catalogFilters';

/**
 * Catalog hero.
 *
 * The artwork is self-contained: the wordmark is baked into it, running full
 * width with the model stepping in front of the letters. So nothing is overlaid
 * on top of it — the only added element is the caption, parked in the clean white
 * corner below the type.
 *
 * The frame keeps the artwork's native 12:5 at every width. The wordmark spans
 * 9%–93% of the image, so any horizontal crop would slice letters off; matching
 * the ratio exactly means `object-cover` never actually crops.
 *
 * Each style line brings its own artwork of that same build (see CATALOG_STYLES),
 * so picking a category from the header re-dresses the hero without the frame,
 * the ratio or the cover-zone measurement changing.
 */
interface CatalogHeroProps {
  /** Style selected via `?category=`, resolved on the server. Null shows the default artwork. */
  styleId: StyleId | null;
}

export default function CatalogHero({ styleId }: CatalogHeroProps) {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const art = getCatalogHero(styleId);
  const caption = getStyle(styleId)?.label ?? 'Catálogo completo';

  /** Real border-box height of the hero. Drives the cover zone so it always matches the hero. */
  const [coverHeight, setCoverHeight] = useState<number | null>(null);

  // The hero's height is viewport-dependent (12:5 of the viewport width, plus the
  // caption block that sits below the picture under lg), so it has to be measured
  // rather than hardcoded — otherwise the cover zone is either too short (the grid
  // starts covering the hero early) or too tall (an empty band under it).
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const measure = () => setCoverHeight(hero.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    /* Cover zone: an in-flow block exactly as tall as the hero. Its `clip-path` clips the
       fixed hero to this box, so as the page scrolls the box slides up out of the viewport
       and the hero is eaten from the bottom while staying pinned: the grid physically covers
       it. `clip-path` clips fixed descendants without becoming their containing block, so the
       hero still pins to the viewport. Same construction as the home hero — scroll-synchronous
       by design, no scroll listener that could lag behind.

       The id deliberately differs from home's "hero-cover-zone": the header keys its
       hide-on-scroll off that exact id, and on this route the header is opaque and should
       stay put. */
    <div
      id="catalog-hero-cover"
      className="w-full"
      style={{ height: coverHeight ?? undefined, clipPath: 'inset(0)' }}
    >
      {/* Pinned below the fixed header rather than at top-0 — unlike home's, this header
          is opaque here and would otherwise sit on top of the artwork. */}
      <section
        ref={heroRef}
        className="fixed inset-x-0 top-16 z-0 w-full bg-white sm:top-[72px]"
      >
        <div className={`relative w-full ${art.mobileSrc ? 'aspect-[4/5] sm:aspect-[12/5]' : 'aspect-[12/5]'}`}>
          {/* Switching category is a soft navigation — this component stays mounted, so
              the incoming artwork cross-fades over the outgoing one instead of the frame
              blanking. `initial={false}` keeps the first paint from fading in. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={art.src}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {art.mobileSrc ? (
                <>
                  <Image
                    src={art.mobileSrc}
                    alt={art.alt}
                    fill
                    priority
                    quality={90}
                    sizes="100vw"
                    className="object-cover object-center sm:hidden"
                  />
                  <Image
                    src={art.src}
                    alt={art.alt}
                    fill
                    priority
                    quality={88}
                    sizes="100vw"
                    className="object-cover object-center hidden sm:block"
                  />
                </>
              ) : (
                <Image
                  src={art.src}
                  alt={art.alt}
                  fill
                  priority
                  quality={88}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Category / Hero title block - rendered for every hero artwork */}
        <motion.div
          key={caption}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-6 left-0 right-0 z-10 px-6 sm:px-8 lg:bottom-[20%] lg:px-12"
        >
          <div className="mx-auto max-w-[1600px]">
            <span aria-hidden className="block h-[2px] w-16 sm:w-24 bg-[#17191c]" />
            <p className="mt-2.5 font-[family-name:var(--font-bebas)] text-2xl sm:text-3xl lg:text-5xl uppercase leading-none tracking-wider text-[#17191c]">
              {caption}
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
