import { ErrorDatos, PageHeader } from '@/components/admin/ui';
import ProgramacionAdmin from '@/components/admin/programacion/ProgramacionAdmin';
import { listarActividades } from './actions';

export default async function ProgramacionPage() {
  let actividades;
  let error: string | null = null;
  try {
    actividades = await listarActividades();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  if (error || !actividades) {
    return (
      <>
        <PageHeader titulo="Programación" />
        <ErrorDatos mensaje={error ?? ''} />
      </>
    );
  }

  return <ProgramacionAdmin iniciales={actividades} />;
}
