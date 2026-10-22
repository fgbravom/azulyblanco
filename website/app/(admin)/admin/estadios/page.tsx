import { ErrorDatos, PageHeader } from '@/components/admin/ui';
import EstadiosAdmin from '@/components/admin/estadios/EstadiosAdmin';
import { listarEstadios } from './actions';

export default async function EstadiosPage() {
  let estadios;
  let error: string | null = null;
  try {
    estadios = await listarEstadios();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  if (error || !estadios) {
    return (
      <>
        <PageHeader titulo="Canchas y estadios" />
        <ErrorDatos mensaje={error ?? ''} />
      </>
    );
  }

  return <EstadiosAdmin iniciales={estadios} />;
}
