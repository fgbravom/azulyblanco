export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { obtenerSesion } from '@/lib/auth/session';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import { cuotasHabilitadas } from '@/lib/cuotas/habilitado';

export const metadata: Metadata = {
  title: 'Administración',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect('/admin/login');
  }

  // Con contraseña temporal, el redactor solo puede cambiarla (x-pathname lo pone el middleware)
  if (sesion.rol === 'redactor' && sesion.debeCambiarPassword) {
    const pathname = (await headers()).get('x-pathname');
    if (pathname !== '/admin/cuenta') redirect('/admin/cuenta');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar cuotas={cuotasHabilitadas()} rol={sesion.rol} nombre={sesion.rol === 'redactor' ? sesion.nombre : undefined} />

      {/* Área principal con margen para el sidebar */}
      <div className="lg:pl-64">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
