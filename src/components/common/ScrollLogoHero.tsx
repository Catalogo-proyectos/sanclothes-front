'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';


export default function ScrollLogoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);


  const attemptPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;



    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;


    video.setAttribute('webkit-playsinline', '');


    if (!video.paused) return;

    try {
      await video.play();
    } catch {



    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;


    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute('webkit-playsinline', '');





    const onDataReady = () => { attemptPlay(); };


    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      attemptPlay();
    } else {
      video.addEventListener('loadeddata', onDataReady, { once: true });
    }



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
      <h1 className="sr-only">
        SANT CLOTHES - Streetwear y moda urbana en Paraguay
      </h1>
      <div className="absolute inset-0 w-full h-full overflow-hidden">

        <video
          ref={videoRef}
          src="/img/video/ofi-3-clean.mp4"
          poster="/img/video/ofi3-frames/frame_0001.webp"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label="SANT CLOTHES — Video Hero en bucle"
          className="w-full h-full object-cover pointer-events-none select-none"
        />
      </div>


      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />


      <div className="absolute inset-x-0 bottom-0 h-[48vh] pointer-events-none bg-[linear-gradient(to_bottom,transparent_0%,rgba(23,25,28,0.25)_38%,rgba(23,25,28,0.72)_66%,rgba(23,25,28,0.96)_84%,#17191c_92%,#17191c_100%)]" />


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
