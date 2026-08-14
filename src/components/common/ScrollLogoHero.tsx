'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

/**
 * Looping Video Hero component for SANT CLOTHES.
 * Replaces the frame-by-frame scroll hero with a seamless, continuous video loop.
 *
 * "/img/video/ofi-3-clean.mp4" sale del máster archivado en /.video-originals:
 * se le quita la marca de agua con `delogo` y se reescala a 1080p, todo en un
 * solo paso para no encadenar recompresiones. No necesita recorte por CSS.
 */
export default function ScrollLogoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video plays automatically on mount (handles browser autoplay policies)
    const playVideo = async () => {
      try {
        video.muted = true;
        await video.play();
      } catch (err) {
        console.warn('Autoplay prevented by browser:', err);
      }
    };

    playVideo();
  }, []);

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => { });
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#17191c] text-white">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          src="/img/video/ofi-3-clean.mp4"
          autoPlay
          loop
          muted
          playsInline
          onEnded={handleEnded}
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
