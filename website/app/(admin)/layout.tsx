export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/session';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminHeader from '@/components/admin/layout/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifySession();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar fijo a la izquierda */}
      <AdminSidebar />

      {/* Área principal con margen para el sidebar */}
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="p-8 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
