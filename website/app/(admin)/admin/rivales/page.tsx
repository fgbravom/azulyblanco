import { ErrorDatos, PageHeader } from '@/components/admin/ui';
import RivalesAdmin from '@/components/admin/rivales/RivalesAdmin';
import { listarRivales } from './actions';

export default async function RivalesPage() {
  let rivales;
  let error: string | null = null;
  try {
    rivales = await listarRivales();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  if (error || !rivales) {
    return (
      <>
        <PageHeader titulo="Rivales" />
        <ErrorDatos mensaje={error ?? ''} />
      </>
    );
  }

  return <RivalesAdmin iniciales={rivales} />;
}
