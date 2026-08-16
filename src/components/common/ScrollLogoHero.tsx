'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

/**
 * Looping Video Hero component for SANT CLOTHES.
 * Replaces the frame-by-frame scroll hero with a seamless, continuous video loop.
 *
 * "/img/video/ofi-3-clean.mp4" sale del máster archivado en /.video-originals:
 * se le quita la marca de agua con `delogo` y se reescala a 1080p, todo en un
 * solo paso para no encadenar recompresiones. No necesita recorte por CSS.
 *
 * ── Mobile autoplay strategy ──
 * Autoplay on mobile requires ALL of: muted + playsInline + autoplay attribute.
 * Browsers may still reject play() if called before enough data is buffered, or
 * if the document tab is in the background. This component:
 *   1. Sets attributes both declaratively (JSX) and imperatively (JS) to cover
 *      edge-cases where React's hydration order drops an attribute.
 *   2. Waits for 'loadeddata' before calling play(), avoiding AbortError.
 *   3. Re-attempts play() on 'visibilitychange' (iOS Safari pauses off-screen).
 *   4. Uses preload="auto" so mobile browsers don't defer the download.
 *   5. Removes the redundant onEnded handler — the `loop` attribute handles it.
 */
export default function ScrollLogoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * Attempt to play the video. Catches and silences expected rejections
   * (NotAllowedError from browser policy, AbortError from interrupted loads).
   * No play-button fallback: the video is muted + inline, so all modern
   * browsers that support autoplay will honour it.
   */
  const attemptPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    // Belt-and-suspenders: ensure every required attribute is set imperatively.
    // Some mobile WebViews drop JSX attributes during hydration.
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    // Safari < 10 / some embedded WebViews honour the prefixed attribute.
    video.setAttribute('webkit-playsinline', '');

    // If the video is already playing, don't restart it.
    if (!video.paused) return;

    try {
      await video.play();
    } catch {
      // Expected on browsers that block even muted autoplay (rare) or when
      // play() is aborted by a subsequent load. Silently ignored — the user
      // sees the poster / first frame and the video will retry on visibility.
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // ── Imperatively set attributes before any play attempt ──
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute('webkit-playsinline', '');

    // ── Primary play: wait until the browser has decoded enough to show ──
    // Using 'loadeddata' instead of 'canplay' because 'canplay' may fire
    // before the first frame is decoded on some Android WebViews, causing a
    // black flash. 'loadeddata' guarantees at least the first frame is ready.
    const onDataReady = () => { attemptPlay(); };

    // readyState >= HAVE_CURRENT_DATA means loadeddata already fired
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      attemptPlay();
    } else {
      video.addEventListener('loadeddata', onDataReady, { once: true });
    }

    // ── Visibility change: iOS Safari pauses <video> when the tab is hidden
    // and does NOT resume on its own. Re-fire play() when the tab returns. ──
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        attemptPlay();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      video.removeEventListener('loadeddata', onDataReady);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [attemptPlay]);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#17191c] text-white">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- decorative background video */}
        <video
          ref={videoRef}
          src="/img/video/ofi-3-clean.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label="SANT CLOTHES — Video Hero en bucle"
          className="w-full h-full object-cover pointer-events-none select-none"
        />
      </div>

      {/* Top scrim: legibilidad del header sobre el fondo blanco del video */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />

      {/*
        Bottom dissolve: el video (claro) se funde progresivamente hacia #17191c,
        el mismo fondo del Hero de 4 estilos que viene a continuación.
        Esto elimina el corte duro entre secciones.
      */}
      <div className="absolute inset-x-0 bottom-0 h-[48vh] pointer-events-none bg-[linear-gradient(to_bottom,transparent_0%,rgba(23,25,28,0.25)_38%,rgba(23,25,28,0.72)_66%,rgba(23,25,28,0.96)_84%,#17191c_92%,#17191c_100%)]" />

      {/* Minimalist Scroll Cue at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-4 h-4 text-white/70" />
        </motion.div>
      </motion.div>
    </section>
  );
}
