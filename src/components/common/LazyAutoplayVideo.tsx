'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyAutoplayVideoProps {
  src: string;
  poster: string;
  className?: string;
  ariaLabel: string;
}

export default function LazyAutoplayVideo({
  src,
  poster,
  className,
  ariaLabel,
}: LazyAutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: '500px 0px' },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? src : undefined}
      poster={poster}
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
