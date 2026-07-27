import PageHero from '@/components/common/PageHero';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Page Hero */}
      <PageHero
        category="AUTENTICACIÓN DE CLIENTES / SANCLOTHES"
        title="INICIAR SESIÓN O REGISTRO"
        subtitle="Accedé a tu cuenta para realizar un seguimiento rápido de tus pedidos y gestionar tus datos."
        compact
      />

      {/* Login Form Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <LoginForm />
      </div>
    </div>
  );
}
