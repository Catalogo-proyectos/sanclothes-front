import type { Metadata } from 'next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageHero from '@/components/common/PageHero';
import Dashboard from '@/components/customer/Dashboard';

export const metadata: Metadata = {
  title: 'Mi cuenta',
  description: 'Panel privado de pedidos y datos de cliente de SANT CLOTHES.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/dashboard',
  },
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="bg-[#f6f8f9] min-h-screen">
        <PageHero
          category="PANEL DE CLIENTE / SANT CLOTHES"
          title="MI CUENTA & PEDIDOS"
          subtitle="Consultá tu historial de compras, seguimiento de envíos y tickets de soporte al cliente."
          image="/img/web/hero/hero-dashboard.webp"
          mobileImage="/img/movil/hero/hero-dashboard.webp"
          preserveColor
          tall
        />

        <Dashboard />
      </div>
    </ProtectedRoute>
  );
}
