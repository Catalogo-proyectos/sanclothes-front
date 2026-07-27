import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageHero from '@/components/common/PageHero';
import Dashboard from '@/components/customer/Dashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="bg-white min-h-screen">
        {/* Page Hero */}
        <PageHero
          category="PANEL DE CLIENTE / SANCLOTHES"
          title="MI CUENTA & PEDIDOS"
          subtitle="Consultá tu historial de compras, seguimiento de envíos y tickets de soporte al cliente."
          compact
        />

        {/* Dashboard Content */}
        <Dashboard />
      </div>
    </ProtectedRoute>
  );
}
