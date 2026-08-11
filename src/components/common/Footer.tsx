'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, FormEvent } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

/** Fallback reveal height used until the footer has been measured. */
const FALLBACK_REVEAL_HEIGHT = 600;

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [revealHeight, setRevealHeight] = useState<number>(FALLBACK_REVEAL_HEIGHT);

  // Form states
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Dynamically measure real footer height so reveal container matches exact height
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const measure = () => setRevealHeight(footer.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor ingresa un correo electrónico válido');
      return;
    }
    if (!agreed) {
      toast.error('Debes aceptar la política de privacidad para continuar');
      return;
    }

    setIsSubscribed(true);
    toast.success('¡Suscripción confirmada! Revisa tu email para tu 10% OFF.');
  };

  return (
    <div className="w-full" style={{ height: revealHeight, clipPath: 'inset(0)' }}>
      <footer
        ref={footerRef}
        className="fixed bottom-0 left-0 right-0 z-0 bg-[#f6f8f9] select-none border-t border-[#b6b2a7]/40 w-full overflow-hidden"
      >
        {/* Main Footer Content */}
        <div className="max-w-[1600px] mx-auto px-6 sm:px-12 pt-10 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-6">

            {/* Left Column: Stay in the loop / Newsletter */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h3 className="font-[family-name:var(--font-bebas)] text-2xl sm:text-3xl tracking-[0.08em] text-[#17191c] uppercase leading-none mb-2">
                  STAY IN THE LOOP
                </h3>
                <p className="text-xs text-[#50524a] font-medium tracking-wide">
                  Suscríbete a nuestros correos y obtén un 10% de descuento en tu primera compra.
                </p>
              </div>

              {isSubscribed ? (
                <div className="p-4 bg-zinc-900 text-white text-xs tracking-wider uppercase flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>¡Te has suscrito con éxito! Disfruta de tu 10% OFF.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-5 max-w-md">
                  {/* Email Input + Subscribe Button */}
                  <div className="relative flex items-center border-b border-[#17191c] pb-1 group focus-within:border-black transition-colors">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@gmail.com"
                      required
                      className="w-full bg-transparent py-2 pr-28 text-xs text-[#17191c] placeholder:text-[#b6b2a7] focus:outline-none tracking-wide"
                    />
                    <button
                      type="submit"
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold tracking-[0.14em] uppercase text-[#17191c] hover:opacity-75 transition-opacity cursor-pointer px-1 py-1"
                    >
                      SUSCRIBIRSE
                    </button>
                  </div>

                  {/* Consent Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-[10px] sm:text-[11px] text-[#50524a] leading-tight group">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 border border-[#17191c] flex items-center justify-center transition-all ${agreed ? 'bg-[#17191c] text-white' : 'bg-transparent group-hover:border-black'
                        }`}
                    >
                      {agreed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    <span>
                      Acepto recibir comunicaciones de SANT CLOTHES® vía correo electrónico y he leído y acepto la{' '}
                      <a href="#" className="underline text-[#17191c] font-semibold hover:opacity-75">
                        Política de Privacidad
                      </a>.
                    </span>
                  </label>
                </form>
              )}
            </div>

            {/* Right Columns: BRAND, SUPPORT, BORING STUFF */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* BRAND */}
              <div className="space-y-4">
                <h4 className="font-[family-name:var(--font-bebas)] text-lg tracking-[0.12em] text-[#17191c] uppercase leading-none">
                  BRAND
                </h4>
                <ul className="space-y-2 text-xs font-medium text-[#50524a]">
                  <li>
                    <Link href="/nosotros" className="hover:text-[#17191c] transition-colors">
                      Sobre Nosotros
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#17191c] transition-colors">
                      SANT Members
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#17191c] transition-colors">
                      Novedades & Drops
                    </a>
                  </li>
                  <li>
                    <a href="/#showroom" className="hover:text-[#17191c] transition-colors">
                      Tiendas & Showroom
                    </a>
                  </li>
                </ul>
              </div>

              {/* SUPPORT */}
              <div className="space-y-4">
                <h4 className="font-[family-name:var(--font-bebas)] text-lg tracking-[0.12em] text-[#17191c] uppercase leading-none">
                  SUPPORT
                </h4>
                <ul className="space-y-2 text-xs font-medium text-[#50524a]">
                  <li>
                    <a href="#" className="hover:text-[#17191c] transition-colors">
                      Devoluciones
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#17191c] transition-colors">
                      Seguimiento De Pedido
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#17191c] transition-colors">
                      Preguntas Frecuentes (FAQ)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#17191c] transition-colors">
                      Contacto Directo
                    </a>
                  </li>
                </ul>
              </div>

              {/* BORING STUFF */}
              <div className="space-y-4">
                <h4 className="font-[family-name:var(--font-bebas)] text-lg tracking-[0.12em] text-[#17191c] uppercase leading-none">
                  BORING STUFF
                </h4>
                <ul className="space-y-2 text-xs font-medium text-[#50524a]">
                  <li>
                    <a href="#" className="hover:text-[#17191c] transition-colors">
                      Aviso Legal
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#17191c] transition-colors">
                      Política de Privacidad
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[#17191c] transition-colors">
                      Términos y Condiciones
                    </a>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Giant Watermark Typography "SANT CLOTHES" */}
        <div className="w-full text-center pointer-events-none select-none py-2 overflow-hidden relative">
          <h2 className="font-[family-name:var(--font-bebas)] text-[23.5vw] leading-[0.85] tracking-tighter whitespace-nowrap text-[#17191c] opacity-[0.06] transition-opacity duration-500 hover:opacity-[0.12]">
            SANT CLOTHES
          </h2>
        </div>
      </footer>
    </div>
  );
}
