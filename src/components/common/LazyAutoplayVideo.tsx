'use client';

import { useEffect, useRef, useState } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';

interface LazyAutoplayVideoProps {
  src: string;
  poster: string;
  
  mobileSrc?: string;
  
  mobilePoster?: string;
  className?: string;
  ariaLabel: string;
}

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

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
    const selectedSrc = isMobile ? mobileSrc ?? src : src;
    const selectedPoster = isMobile ? mobilePoster ?? poster : poster;

const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMedia((current) => {
            if (current) return current;
            return prefersStillImage()
              ? { poster: selectedPoster }
              : { src: selectedSrc, poster: selectedPoster };
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
