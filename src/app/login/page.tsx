import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Ingresar',
  description: 'Acceso privado para clientes de SANT CLOTHES.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/login',
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; mode?: string }>;
}) {
  const { email = '', mode } = await searchParams;
  const initialMode = mode === 'register' ? 'register' : 'login';

  return (
    <main className="bg-[#101114] min-h-screen">
      <LoginForm initialEmail={email} initialMode={initialMode} />
    </main>
  );
}
