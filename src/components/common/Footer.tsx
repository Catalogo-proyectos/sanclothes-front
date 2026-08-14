'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, FormEvent } from 'react';
import { toast } from 'sonner';

/** Fallback reveal height used until the footer has been measured. */
const FALLBACK_REVEAL_HEIGHT = 600;

const FOOTER_NAV = [
  {
    title: 'Inicio',
    href: '/',
    links: [
      { label: 'Portada', href: '/#inicio' },
      { label: 'Colecciones', href: '/#colecciones' },
      { label: 'Destacados', href: '/#destacados' },
      { label: 'Showroom', href: '/#showroom' },
    ],
  },
  {
    title: 'Catálogo',
    href: '/catalog',
    links: [
      { label: 'Streetwear', href: '/catalog?category=streetwear' },
      { label: 'Old money', href: '/catalog?category=old-money' },
      { label: 'Casual', href: '/catalog?category=casual' },
      { label: 'Sports', href: '/catalog?category=sports' },
    ],
  },
  {
    title: 'Nosotros',
    href: '/nosotros',
    links: [
      { label: 'Historia', href: '/nosotros#nosotros-hero' },
      { label: 'Podcast', href: '/nosotros#podcast' },
      { label: 'Cronología', href: '/nosotros#cronologia' },
      { label: 'Pilares', href: '/nosotros#pilares' },
    ],
  },
  {
    title: 'Comunidad',
    href: '/comunidad',
    links: [
      { label: 'Sant Club', href: '/comunidad#sant-club' },
      { label: 'Street Style', href: '/comunidad#street-style' },
      { label: 'Beneficios', href: '/comunidad#beneficios' },
      { label: 'Participar', href: '/comunidad#participar' },
    ],
  },
];

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const footerRef = useRef<HTMLElement>(null);
  const [revealHeight, setRevealHeight] = useState<number>(FALLBACK_REVEAL_HEIGHT);

  // Form states
  const [email, setEmail] = useState('');

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
    const query = new URLSearchParams({ mode: 'register', email });
    router.push(`/login?${query.toString()}`);
  };

  return (
    <div className="w-full" style={{ height: revealHeight, clipPath: 'inset(0)' }}>
      <footer
        ref={footerRef}
        className="fixed bottom-0 left-0 right-0 z-0 bg-[#f6f8f9] select-none border-t border-[#b6b2a7]/40 w-full overflow-hidden"
      >
        {/* Main Footer Content */}
        <div className="max-w-[1600px] mx-auto px-6 sm:px-12 pt-10 pb-0">
          <div className={`grid grid-cols-1 gap-10 lg:gap-12 pb-6 ${isLoginPage ? 'lg:grid-cols-1' : 'lg:grid-cols-12'}`}>

            {!isLoginPage && (
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <h3 className="font-[family-name:var(--font-bebas)] text-2xl sm:text-3xl tracking-[0.08em] text-[#17191c] uppercase leading-none mb-2">
                    UNITE A LA FAMILIA SANT
                  </h3>
                  <p className="text-xs text-[#50524a] font-medium tracking-wide">
                    Crea tu cuenta para guardar tus favoritos, seguir tus pedidos y enterarte primero de los nuevos drops.
                  </p>
                </div>

                <form onSubmit={handleSubscribe} className="max-w-md">
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
                      CREAR CUENTA
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Right Columns: page section index */}
            <nav
              aria-label="Secciones del sitio"
              className={`grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-7 ${isLoginPage ? 'mx-auto w-full max-w-3xl text-center' : 'lg:col-span-6'}`}
            >
              {FOOTER_NAV.map((column) => (
                <div key={column.title} className="space-y-4">
                  {column.href ? (
                    <Link
                      href={column.href}
                      className="block font-[family-name:var(--font-bebas)] text-lg tracking-[0.12em] text-[#17191c] uppercase leading-none transition-opacity hover:opacity-70"
                    >
                      {column.title}
                    </Link>
                  ) : (
                    <h4 className="font-[family-name:var(--font-bebas)] text-lg tracking-[0.12em] text-[#17191c] uppercase leading-none">
                      {column.title}
                    </h4>
                  )}
                  <ul className="space-y-2 text-xs font-medium text-[#50524a]">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="hover:text-[#17191c] transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

          </div>
        </div>

        {/* Giant Watermark Typography "SANT CLOTHES" */}
        <div className="w-full text-center pointer-events-none select-none py-2 overflow-hidden relative">
          <h2 className="font-[family-name:var(--font-bebas)] text-[23.5vw] leading-[0.85] tracking-tighter whitespace-nowrap text-[#17191c] opacity-[0.06] transition-opacity duration-500 hover:opacity-[0.12]">
            SANT CLOTHES
          </h2>
        </div>

        {/* Bottom Bar: Copyright & Credits */}
        <div className="w-full py-4 px-6 text-center text-xs text-[#50524a] font-medium tracking-wide">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <span>© 2026 Todos los derechos reservados.</span>
            <span className="hidden sm:inline">·</span>
            <span>
              Desarrollado por{' '}
              <a
                href="https://www.instagram.com/vectrapy/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#17191c] hover:underline transition-all cursor-pointer"
              >
                VectraPY
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
