'use client';

import { useEffect, useRef, useState } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';

interface LazyAutoplayVideoProps {
  src: string;
  poster: string;
  /** Versión liviana para celular; desktop sigue usando `src`. */
  mobileSrc?: string;
  /** Poster recortado/comprimido para celular; desktop sigue usando `poster`. */
  mobilePoster?: string;
  className?: string;
  ariaLabel: string;
}

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

// En celular con ahorro de datos, 2G o reduced-motion mostramos sólo el poster.
function prefersStillImage(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  const lowData = Boolean(connection?.saveData) || /2g/.test(connection?.effectiveType ?? '');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return lowData || reducedMotion;
}

export default function LazyAutoplayVideo({
  src,
  poster,
  mobileSrc,
  mobilePoster,
  className,
  ariaLabel,
}: LazyAutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [media, setMedia] = useState<{ src?: string; poster: string } | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isMobile = window.matchMedia(MOBILE_QUERY).matches;

    // Ni el video ni el poster se piden hasta que la sección se acerca al viewport.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!isMobile) {
          if (!entry.isIntersecting) return;
          setMedia({ src, poster });
          observer.disconnect();
          return;
        }

        // Celular: cargar al acercarse y pausar fuera de pantalla para no
        // gastar batería ni datos en un video que nadie está viendo.
        if (entry.isIntersecting) {
          setMedia((current) => {
            if (current) return current;
            return prefersStillImage()
              ? { poster: mobilePoster ?? poster }
              : { src: mobileSrc ?? src, poster: mobilePoster ?? poster };
          });
          if (video.currentSrc) video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      },
      { rootMargin: '500px 0px' },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src, poster, mobileSrc, mobilePoster]);

  return (
    <video
      ref={videoRef}
      src={media?.src}
      poster={media?.poster}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      aria-label={ariaLabel}
      className={className}
    />
  );
}
