import { redirect } from 'next/navigation';
import { obtenerSesion } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';
import { PageHeader } from '@/components/admin/ui';
import CambiarPasswordForm from '@/components/admin/cuenta/CambiarPasswordForm';

export default async function CuentaPage() {
  const sesion = await obtenerSesion();
  // La contraseña del admin vive en una variable de entorno: aquí no hay nada que cambiar
  if (sesion?.rol !== 'redactor') redirect('/admin');

  const { data } = await createAdminClient()
    .from('cuentas_redactores')
    .select('usuario')
    .eq('redactor_id', sesion.redactorId)
    .maybeSingle();

  return (
    <>
      <PageHeader titulo="Mi cuenta" descripcion="Tus datos de acceso al panel." />
      <CambiarPasswordForm nombre={sesion.nombre} usuario={data?.usuario ?? ''} debeCambiar={sesion.debeCambiarPassword} />
    </>
  );
}
