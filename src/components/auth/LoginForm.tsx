'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { apiCall } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { AuthResponse } from '@/types/api';

type AuthMode = 'login' | 'register' | 'forgot';

const inputClass =
  'w-full bg-[#0f1113] border border-[#b6b2a7]/25 px-4 py-4 text-sm text-[#f6f8f9] ' +
  'placeholder:text-[#f6f8f9]/30 focus:border-[#f6f8f9] focus:bg-[#111315] focus:outline-none ' +
  'transition-colors duration-200 [color-scheme:dark] ' +
  '[&:-webkit-autofill]:[-webkit-text-fill-color:#f6f8f9] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#0f1113_inset]';

const labelClass =
  'block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#b6b2a7]';

interface LoginFormProps {
  initialEmail?: string;
  initialMode?: Extract<AuthMode, 'login' | 'register'>;
}

export default function LoginForm({ initialEmail = '', initialMode = 'login' }: LoginFormProps) {
  const router = useRouter();
  const login = useAuth((state) => state.login);

  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [email, setEmail] = useState(initialMode === 'login' ? initialEmail : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState(initialMode === 'register' ? initialEmail : '');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError('');
    setSuccessMessage('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await apiCall<AuthResponse>('POST', '/auth/login', {
        email,
        password,
      });

      login(response.token);
      setSuccessMessage('Autenticación exitosa. Redirigiendo…');
      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch (err) {
      setError((err as Error).message || 'Credenciales inválidas. Verificá tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await apiCall<AuthResponse>('POST', '/auth/register', {
        firstName,
        lastName,
        email: regEmail,
        password: regPassword,
      });

      login(response.token);
      setSuccessMessage('Cuenta creada. Bienvenido a SANT CLUB.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch (err) {
      setError((err as Error).message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiCall('POST', '/auth/forgot-password', { email });
      setSuccessMessage('Te enviamos un enlace de recuperación a tu correo.');
    } catch (err) {
      setError((err as Error).message || 'No se pudo enviar el correo de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  const submitLabel =
    mode === 'login'
      ? loading
        ? 'INGRESANDO…'
        : 'INICIAR SESIÓN'
      : mode === 'register'
        ? loading
          ? 'CREANDO CUENTA…'
          : 'CREAR CUENTA'
        : loading
          ? 'ENVIANDO…'
          : 'ENVIAR ENLACE';

  return (
    <div className="w-full min-h-[calc(100vh-72px)] bg-[#101114] text-[#f6f8f9] flex flex-col lg:flex-row">
      <div className="relative lg:hidden border-b border-[#b6b2a7]/20 bg-[#f6f8f9] px-6 pb-8 pt-28 text-[#101114] overflow-hidden">
        <div className="relative flex flex-col items-center space-y-4 text-center">
          <Image
            src="/img/logo/Sant_Logo Negro.png"
            alt="Sant Clothes"
            width={360}
            height={73}
            className="h-auto w-56 max-w-full"
          />
          <p className="max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-[#50524a]">
            Tu acceso al universo SANT: pedidos, favoritos y drops antes que nadie.
          </p>
        </div>
      </div>

      {/* ── IZQUIERDA: panel de marca (solo desktop) ── */}
      <div className="relative hidden lg:flex lg:w-[54%] lg:h-screen lg:self-start lg:sticky lg:top-0 flex-col items-center justify-center bg-[#f6f8f9] p-12 xl:p-16 overflow-hidden border-r border-[#b6b2a7]/20 text-[#101114]">
        <div className="relative flex w-full max-w-2xl flex-col items-center text-center">
          <Image
            src="/img/logo/Sant_Logo Negro.png"
            alt="Sant Clothes"
            width={620}
            height={125}
            priority
            className="h-auto w-full max-w-[560px]"
          />
          <span className="mt-10 font-mono text-[10px] uppercase tracking-[0.24em] text-[#50524a]">
            Members access
          </span>
          <p className="mt-4 max-w-md font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-[#50524a]">
            Guardá favoritos, seguí tus pedidos y entrá primero a los drops de la familia SANT.
          </p>
        </div>
      </div>

      {/* ── DERECHA: formulario ── */}
      <div className="w-full lg:w-[46%] flex items-center justify-center px-6 py-14 sm:px-12 xl:px-20">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between gap-4 border-b border-[#b6b2a7]/20 pb-6">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#b6b2a7]">
              {mode === 'forgot' ? 'Recuperar acceso' : 'Área de miembros'}
            </span>
            <span className="hidden sm:block h-px w-20 bg-[#b6b2a7]/30" />
          </div>

          <h2 className="mt-5 text-5xl sm:text-6xl font-[family-name:var(--font-bebas)] tracking-[0.06em] uppercase leading-[0.9] text-white">
            {mode === 'login' && 'Iniciar sesión'}
            {mode === 'register' && 'Crear cuenta'}
            {mode === 'forgot' && 'Recuperar contraseña'}
          </h2>

          {mode !== 'forgot' && (
            <p className="mt-4 max-w-sm text-xs font-mono uppercase tracking-[0.12em] leading-relaxed text-[#b6b2a7]">
              Entrá a tu espacio SANT para continuar compras, revisar pedidos y guardar piezas.
            </p>
          )}

          {mode === 'forgot' && (
            <p className="mt-3 text-xs font-mono tracking-wide text-[#b6b2a7] leading-relaxed">
              Ingresá tu correo y te enviamos las instrucciones.
            </p>
          )}

          {/* Alternar entre ingreso y registro */}
          {mode !== 'forgot' && (
            <div className="mt-8 grid grid-cols-2 border border-[#b6b2a7]/25 bg-[#0b0c0e] p-1" role="tablist">
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={mode === tab}
                  onClick={() => switchMode(tab)}
                  className={`py-3 text-center text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-colors duration-200 cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#f6f8f9] ${
                    mode === tab
                      ? 'bg-[#f6f8f9] text-[#101114]'
                      : 'text-[#b6b2a7] hover:text-[#f6f8f9]'
                  }`}
                >
                  {tab === 'login' ? 'Ingresar' : 'Registrarme'}
                </button>
              ))}
            </div>
          )}

          {/* Estado del envío. aria-live para que lo anuncie el lector de pantalla. */}
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

              {successMessage && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 border-l-2 border-[#b6b2a7] bg-white/5 py-3 pl-4 text-xs font-mono tracking-wide text-[#f6f8f9]"
                >
                  <span className="font-bold uppercase">Listo — </span>
                  {successMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <form
            onSubmit={
              mode === 'login'
                ? handleLoginSubmit
                : mode === 'register'
                  ? handleRegisterSubmit
                  : handleForgotSubmit
            }
            className="mt-8 space-y-6"
          >
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className={labelClass}>
                    Nombre
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className={labelClass}>
                    Apellido
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className={labelClass}>
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                aria-invalid={error ? true : undefined}
                value={mode === 'register' ? regEmail : email}
                onChange={(e) =>
                  mode === 'register' ? setRegEmail(e.target.value) : setEmail(e.target.value)
                }
                className={inputClass}
              />
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor="password" className={labelClass}>
                    Contraseña
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[10px] font-mono tracking-wider uppercase text-[#b6b2a7] hover:text-[#f6f8f9] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#f6f8f9]"
                    >
                      ¿La olvidaste?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={mode === 'register' ? 6 : undefined}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={mode === 'register' ? 'password-hint' : undefined}
                    value={mode === 'register' ? regPassword : password}
                    onChange={(e) =>
                      mode === 'register'
                        ? setRegPassword(e.target.value)
                        : setPassword(e.target.value)
                    }
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                    className="absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-[#b6b2a7] hover:text-[#f6f8f9] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#f6f8f9]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {mode === 'register' && (
                  <p id="password-hint" className="text-[10px] font-mono text-[#b6b2a7]">
                    Mínimo 6 caracteres.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full cursor-pointer items-center justify-center gap-3 border border-[#f6f8f9] bg-[#f6f8f9] py-4 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#101114] transition-colors duration-200 hover:bg-transparent hover:text-[#f6f8f9] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#f6f8f9]"
            >
              <span>{submitLabel}</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full cursor-pointer py-2 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#b6b2a7] transition-colors hover:text-[#f6f8f9] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#f6f8f9]"
              >
                ← Volver a iniciar sesión
              </button>
            )}
          </form>

          <p className="mt-12 border-t border-[#50524a] pt-6 text-[10px] font-mono uppercase tracking-[0.14em] text-[#b6b2a7]">
            ¿Necesitás ayuda?{' '}
            <a
              href="mailto:soporte@santclothes.com"
              className="text-[#f6f8f9] underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              soporte@santclothes.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
