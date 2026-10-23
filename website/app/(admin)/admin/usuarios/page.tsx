import { redirect } from 'next/navigation';
import { ErrorDatos, PageHeader } from '@/components/admin/ui';
import UsuariosAdmin from '@/components/admin/usuarios/UsuariosAdmin';
import { obtenerSesion } from '@/lib/auth/session';
import { listarCuentas } from './actions';

export default async function UsuariosPage() {
  const sesion = await obtenerSesion();
  if (sesion?.rol !== 'admin') redirect('/admin');

  let cuentas;
  let error: string | null = null;
  try {
    cuentas = await listarCuentas();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  if (error || !cuentas) {
    return (
      <>
        <PageHeader titulo="Usuarios" />
        <ErrorDatos mensaje={error ?? ''} />
      </>
    );
  }

  return <UsuariosAdmin iniciales={cuentas} cuentaActualId={sesion.cuentaId} />;
}
