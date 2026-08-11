'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      toast.success('¡SUSCRIPCIÓN CONFIRMADA!', {
        icon: <CheckCircle2 className="w-4 h-4 text-white" />,
        description: `ENVIAREMOS NOTIFICACIONES EXCLUSIVAS A ${email.toUpperCase()}`,
      });
    }
  };

  return (
    <section className="w-full border-t border-[#b6b2a7]/40 py-24 px-6 sm:px-8 bg-[#f6f8f9] text-[#17191c]">
      <div className="max-w-xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-[#50524a]" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#50524a]">
            NOVEDADES & DROPS EXCLUSIVOS — SANT CLOTHES
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wider text-[#17191c] uppercase mb-4 leading-none">
          SUSCRÍBETE AL CLUB SANT CLOTHES
        </h2>

        <p className="text-xs sm:text-sm text-[#50524a] font-mono font-medium tracking-wide uppercase leading-relaxed mb-8 max-w-md mx-auto">
          ACCESO ANTICIPADO A LANZAMIENTOS LIMITADOS, REPOSICIÓN DE TALLES Y DROPS PRIVADOS EN PARAGUAY.
        </p>

        {submitted ? (
          <div
            className="p-5 border border-[#17191c] bg-[#17191c] text-xs font-mono font-bold tracking-[0.2em] text-[#f6f8f9] uppercase"
            style={{ borderRadius: '0px' }}
          >
            ¡GRACIAS POR SUSCRIBIRTE! TE NOTIFICAREMOS ANTES QUE A NADIE.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="TU CORREO ELECTRÓNICO"
              required
              aria-label="Correo electrónico"
              className="flex-1 bg-white border border-[#17191c] focus:border-[#50524a] text-[#17191c] text-xs tracking-wider px-4 py-3.5 outline-none placeholder:text-[#50524a]/60 font-mono font-bold uppercase transition-colors"
              style={{ borderRadius: '0px' }}
            />
            <button
              type="submit"
              className="bg-[#17191c] text-[#f6f8f9] hover:bg-[#50524a] text-[11px] font-extrabold tracking-[0.2em] uppercase py-3.5 px-7 transition-colors border border-[#17191c]"
              style={{ borderRadius: '0px' }}
            >
              SUSCRIBIRME
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

