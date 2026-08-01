'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GalleryImage } from './productGallery.types';

interface ProductLightboxProps {
  images: GalleryImage[];
  index: number;
  productTitle: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/**
 * Fullscreen gallery viewer.
 * Behaves like a real modal dialog: Escape closes it, arrows navigate, focus is
 * trapped inside and returned to the trigger on close, and the page behind stops
 * scrolling (previously the body kept scrolling under the overlay).
 */
export default function ProductLightbox({
  images,
  index,
  productTitle,
  onIndexChange,
  onClose,
}: ProductLightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<Element | null>(null);
  const titleId = useId();

  const total = images.length;
  const goPrev = useCallback(
    () => onIndexChange((index - 1 + total) % total),
    [index, total, onIndexChange]
  );
  const goNext = useCallback(() => onIndexChange((index + 1) % total), [index, total, onIndexChange]);

  // Lock the underlying page while the overlay is open, compensating for the
  // scrollbar width so the layout behind does not jump (avoids a CLS hit).
  useEffect(() => {
    const { body } = document;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }, []);

  // Move focus in on open, restore it on close.
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    closeButtonRef.current?.focus();
    return () => {
      (previouslyFocused.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft' && total > 1) {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === 'ArrowRight' && total > 1) {
        event.preventDefault();
        goNext();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, onClose, total]);

  const current = images[index];

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <h2 id={titleId} className="sr-only">
        Vista expandida de {productTitle}
      </h2>

      <button
        ref={closeButtonRef}
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 text-white p-3 cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Cerrar vista expandida"
      >
        <X className="w-7 h-7" />
      </button>

      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Imagen anterior"
            className="absolute left-2 sm:left-6 z-10 text-white p-3 cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={goNext}
            aria-label="Imagen siguiente"
            className="absolute right-2 sm:right-6 z-10 text-white p-3 cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div className="relative w-[92vw] h-[80vh] sm:w-[85vw] sm:h-[85vh]">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt}
          fill
          sizes="90vw"
          quality={90}
          className="object-contain"
          priority
        />
      </div>

      {total > 1 && (
        <span
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-[11px] font-mono tracking-[0.2em] tabular-nums"
          aria-live="polite"
        >
          {index + 1} / {total}
        </span>
      )}
    </div>
  );
}
