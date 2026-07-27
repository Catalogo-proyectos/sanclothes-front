'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-[#f6f8f9] text-[#17191c] border-t border-[#b6b2a7]/40 overflow-hidden selection:bg-[#17191c] selection:text-[#f6f8f9]">


      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Information */}
        <div className="space-y-4">
          <span className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wider uppercase text-[#17191c] leading-none block">
            SANTS CLOTHES®
          </span>
          <p className="text-xs text-[#50524a] font-mono font-medium leading-relaxed tracking-wide max-w-xs uppercase">
            Where style meets culture. Defining the intersection of street, luxury, and sport in Paraguay.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#17191c] mb-5">
            NAVIGATION
          </h4>
          <ul className="space-y-3.5 text-xs text-[#50524a] font-mono font-medium tracking-wide uppercase">
            <li><Link href="/catalog" className="hover:text-[#17191c] transition-colors">Shop</Link></li>
            <li><Link href="/catalog?tab=collections" className="hover:text-[#17191c] transition-colors">Collections</Link></li>
            <li><Link href="/journal" className="hover:text-[#17191c] transition-colors">Our Story</Link></li>
            <li><Link href="/catalog" className="hover:text-[#17191c] transition-colors">Official Store</Link></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#17191c] mb-5">
            SOCIALS
          </h4>
          <ul className="space-y-3.5 text-xs text-[#50524a] font-mono font-medium tracking-wide uppercase">
            <li>
              <a href="https://www.instagram.com/santclothespy" target="_blank" rel="noopener noreferrer" className="hover:text-[#17191c] transition-colors">
                Instagram (@santclothespy)
              </a>
            </li>
            <li>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#17191c] transition-colors">
                TikTok
              </a>
            </li>
          </ul>
        </div>

        {/* Payment Methods & Support */}
        <div>
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#17191c] mb-5">
            PAYMENTS & SUPPORT
          </h4>
          <p className="text-xs text-[#50524a] font-mono font-medium leading-relaxed uppercase tracking-wider mb-4">
            SIPAP Transfer, PagoQR & Credit/Debit Cards Accepted.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] bg-white border border-[#17191c] px-2.5 py-1 text-[#17191c] font-mono uppercase">SIPAP</span>
            <span className="text-[10px] bg-white border border-[#17191c] px-2.5 py-1 text-[#17191c] font-mono uppercase">PAGOQR</span>
            <span className="text-[10px] bg-white border border-[#17191c] px-2.5 py-1 text-[#17191c] font-mono uppercase">VISA / MC</span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-6 border-t border-[#b6b2a7]/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#50524a] font-mono uppercase tracking-wider gap-4">
        <span>© 2026 SANTS CLOTHES®. ALL RIGHTS RESERVED.</span>
        <div className="flex items-center gap-6 text-[#50524a]">
          <Link href="/terms" className="hover:text-[#17191c] transition-colors">TERMS</Link>
          <Link href="/privacy" className="hover:text-[#17191c] transition-colors">PRIVACY</Link>
          <Link href="/faq" className="hover:text-[#17191c] transition-colors">FAQ</Link>
        </div>
      </div>
    </footer>
  );
}


