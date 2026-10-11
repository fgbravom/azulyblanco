import { notFound } from 'next/navigation';
import { ErrorDatos, PageHeader } from '@/components/admin/ui';
import { cuotasHabilitadas } from '@/lib/cuotas/habilitado';
import CuotasAdmin from '@/components/admin/cuotas/CuotasAdmin';
import { obtenerTablero, type Tablero } from './actions';

export default async function CuotasPage({
  searchParams,
}: {
  searchParams: Promise<{ serie?: string; anio?: string }>;
}) {
  if (!cuotasHabilitadas()) notFound();
  const { serie, anio } = await searchParams;

  let tablero: Tablero | undefined;
  let error: string | null = null;
  try {
    tablero = await obtenerTablero(Number(serie) || undefined, Number(anio) || undefined);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  if (error || !tablero) {
    return (
      <>
        <PageHeader titulo="Cuotas" />
        <ErrorDatos mensaje={error ?? ''} />
        <p className="mt-3 text-sm text-gray-600">
          Las cuotas necesitan la migración <code className="rounded bg-gray-100 px-1">supabase/migrations/20260101000004_cuotas.sql</code>.
        </p>
      </>
    );
  }

  return <CuotasAdmin tablero={tablero} />;
}
