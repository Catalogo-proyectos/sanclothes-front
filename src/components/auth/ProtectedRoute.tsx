'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getStoredToken } from '@/lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, syncFromStorage } = useAuth();

  useEffect(() => {
    syncFromStorage();
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
    }
  }, [router, syncFromStorage]);

  if (!isLoggedIn) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-500">Verificando sesión...</p>
      </div>
    );
  }

  return <>{children}</>;
}
