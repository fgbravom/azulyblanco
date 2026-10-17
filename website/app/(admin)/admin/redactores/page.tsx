import { ErrorDatos, PageHeader } from '@/components/admin/ui';
import RedactoresAdmin from '@/components/admin/redactores/RedactoresAdmin';
import { listarRedactores } from './actions';

export default async function RedactoresPage() {
  let redactores;
  let error: string | null = null;
  try {
    redactores = await listarRedactores();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  if (error || !redactores) {
    return (
      <>
        <PageHeader titulo="Redactores" />
        <ErrorDatos mensaje={error ?? ''} />
      </>
    );
  }

  return <RedactoresAdmin iniciales={redactores} />;
}
