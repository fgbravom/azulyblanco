import { ErrorDatos, PageHeader } from '@/components/admin/ui';
import ProgramacionAdmin from '@/components/admin/programacion/ProgramacionAdmin';
import { listarRivales } from '../rivales/actions';
import { listarEstadios } from '../estadios/actions';
import { listarActividades, listarJugadoresGoles } from './actions';

export default async function ProgramacionPage() {
  let actividades;
  let rivales;
  let estadios;
  let jugadores;
  let error: string | null = null;
  try {
    actividades = await listarActividades();
    // Si la migración 010 aún no se aplica, el formulario funciona solo con texto libre
    rivales = await listarRivales().catch(() => []);
    // Ídem con la migración 016: el lugar se puede escribir a mano
    estadios = await listarEstadios().catch(() => []);
    jugadores = await listarJugadoresGoles().catch(() => []);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  if (error || !actividades || !rivales || !estadios || !jugadores) {
    return (
      <>
        <PageHeader titulo="Programación" />
        <ErrorDatos mensaje={error ?? ''} />
      </>
    );
  }

  return <ProgramacionAdmin iniciales={actividades} rivales={rivales} estadios={estadios} jugadores={jugadores} />;
}
