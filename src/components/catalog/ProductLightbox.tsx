'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const goNext = useCallback(
    () => onIndexChange((index + 1) % total),
    [index, total, onIndexChange]
  );

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

  const current = images[index] ?? images[0];
  if (!current) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 select-none backdrop-blur-sm"
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
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 text-zinc-400 hover:text-white cursor-pointer transition-colors duration-200 focus-visible:outline-none"
        aria-label="Cerrar vista expandida"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
      </button>

      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Imagen anterior"
            className="absolute left-2 sm:left-6 z-50 p-2 text-zinc-400 hover:text-white cursor-pointer transition-colors duration-200 focus-visible:outline-none"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />
          </button>
          <button
            onClick={goNext}
            aria-label="Imagen siguiente"
            className="absolute right-2 sm:right-6 z-50 p-2 text-zinc-400 hover:text-white cursor-pointer transition-colors duration-200 focus-visible:outline-none"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />
          </button>
        </>
      )}

      <div className="relative w-[92vw] h-[80vh] sm:w-[85vw] sm:h-[85vh] flex items-center justify-center pointer-events-none">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt}
          fill
          sizes="90vw"
          quality={90}
          className="object-contain pointer-events-auto"
          priority
        />
      </div>

      {total > 1 && (
        <span
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-400 text-xs font-mono tracking-[0.2em] tabular-nums"
          aria-live="polite"
        >
          {index + 1} / {total}
        </span>
      )}
    </div>,
    document.body
  );
}
