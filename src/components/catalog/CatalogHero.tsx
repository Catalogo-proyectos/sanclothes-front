'use client';

import { useEffect, useRef, useState } from 'react';
import Image, { getImageProps } from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { StyleId, getCatalogHero, getStyle } from '@/lib/catalogFilters';

interface CatalogHeroProps {

  styleId: StyleId | null;
  
  styleName?: string | null;
  coverImage?: string | null;
  coverImageMobile?: string | null;
}

export default function CatalogHero({ styleId, styleName, coverImage, coverImageMobile }: CatalogHeroProps) {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const fallbackArt = getCatalogHero(styleId);
  const caption = styleName ?? getStyle(styleId)?.label ?? 'Catálogo completo';
  const art = coverImage
    ? { src: coverImage, mobileSrc: coverImageMobile ?? undefined, alt: `SANT CLOTHES — ${caption}` }
    : fallbackArt;
  const mobileImage = art.mobileSrc
    ? getImageProps({
        src: art.mobileSrc,
        alt: art.alt,
        fill: true,
        quality: 90,
        sizes: '100vw',
      }).props
    : null;

const [coverHeight, setCoverHeight] = useState<number | null>(null);

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

    <div
      id="catalog-hero-cover"
      className="w-full scroll-mt-24"
      style={{ height: coverHeight ?? undefined, clipPath: 'inset(0)' }}
    >

      <section
        ref={heroRef}
        className="fixed inset-x-0 top-0 z-0 w-full bg-white"
      >
        <div className={`relative w-full ${art.mobileSrc ? 'aspect-[4/5] sm:aspect-[12/5]' : 'aspect-[12/5]'}`}>

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
                <picture>
                  <source media="(max-width: 639px)" srcSet={mobileImage?.srcSet} />
                  <Image
                    src={art.src}
                    alt={art.alt}
                    fill
                    priority
                    quality={88}
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </picture>
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
