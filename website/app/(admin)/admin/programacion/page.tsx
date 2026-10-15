import { ErrorDatos, PageHeader } from '@/components/admin/ui';
import ProgramacionAdmin from '@/components/admin/programacion/ProgramacionAdmin';
import { listarRivales } from '../rivales/actions';
import { listarActividades } from './actions';

export default async function ProgramacionPage() {
  let actividades;
  let rivales;
  let error: string | null = null;
  try {
    actividades = await listarActividades();
    // Si la migración 010 aún no se aplica, el formulario funciona solo con texto libre
    rivales = await listarRivales().catch(() => []);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  if (error || !actividades || !rivales) {
    return (
      <>
        <PageHeader titulo="Programación" />
        <ErrorDatos mensaje={error ?? ''} />
      </>
    );
  }

  return <ProgramacionAdmin iniciales={actividades} rivales={rivales} />;
}
