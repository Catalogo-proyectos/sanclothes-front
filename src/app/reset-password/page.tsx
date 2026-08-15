'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { apiCall } from '@/lib/api';

const inputClass =
  'w-full bg-[#0f1113] border border-[#b6b2a7]/25 px-4 py-4 text-sm text-[#f6f8f9] ' +
  'placeholder:text-[#f6f8f9]/30 focus:border-[#f6f8f9] focus:bg-[#111315] focus:outline-none ' +
  'transition-colors duration-200 [color-scheme:dark] ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:#f6f8f9] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#0f1113_inset]';

const labelClass =
  'block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#b6b2a7]';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetToken = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) {
      setError('Token de recuperación no válido. Solicitá un nuevo enlace.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiCall('POST', '/auth/reset-password', {
        token: resetToken,
        password,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError((err as Error).message || 'No se pudo restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-8">
        <Image
          src="/img/logo/Sant_Logo Negro.png"
          alt="Sant Clothes"
          width={280}
          height={56}
          className="h-auto w-48 invert"
        />
      </div>

      <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-[0.06em] uppercase leading-[0.9] text-white text-center">
        Nueva contraseña
      </h2>

      <p className="mt-3 text-xs font-mono tracking-wide text-[#b6b2a7] leading-relaxed text-center">
        Ingresá tu nueva contraseña (mínimo 8 caracteres).
      </p>

      <div aria-live="polite" className="empty:hidden">
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 border-l-2 border-[#c1554a] bg-[#c1554a]/10 py-3 pl-4 text-xs font-mono tracking-wide text-[#f6f8f9]"
            >
              <span className="font-bold uppercase">Error — </span>
              {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 border-l-2 border-[#b6b2a7] bg-white/5 py-3 pl-4 text-xs font-mono tracking-wide text-[#f6f8f9]"
            >
              <span className="font-bold uppercase">Listo — </span>
              Contraseña actualizada. Redirigiendo al login…
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {!success && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="new-password" className={labelClass}>
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-[#b6b2a7] hover:text-[#f6f8f9] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !resetToken}
            className="group flex w-full cursor-pointer items-center justify-center gap-3 border border-[#f6f8f9] bg-[#f6f8f9] py-4 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#101114] transition-colors duration-200 hover:bg-transparent hover:text-[#f6f8f9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{loading ? 'GUARDANDO…' : 'GUARDAR CONTRASEÑA'}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full min-h-[calc(100vh-72px)] bg-[#101114] text-[#f6f8f9] flex items-center justify-center px-6 py-14">
      <Suspense fallback={
        <div className="text-center text-xs font-mono text-[#b6b2a7] uppercase tracking-wider">
          Cargando…
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
