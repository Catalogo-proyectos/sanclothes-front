'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { AuthResponse } from '@/types/api';

export default function LoginForm() {
  const router = useRouter();
  const login = useAuth((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiCall<AuthResponse>('POST', '/auth/login', {
        email,
        password,
      });

      login(response.token);
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
      <h2 className="text-2xl font-black uppercase text-center text-slate-900 tracking-tight">
        Ingresar a TRECE<span className="text-red-600">13</span>
      </h2>
      <p className="text-xs text-slate-500 text-center mt-1 mb-6">
        Accedé a tus pedidos, cupones VIP y estado de envíos.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@ejemplo.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-black text-white font-extrabold uppercase rounded-xl shadow-md hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}
