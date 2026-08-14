import LoginForm from '@/components/auth/LoginForm';

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
