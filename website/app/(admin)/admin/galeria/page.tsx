import { ErrorDatos, PageHeader } from '@/components/admin/ui';
import AlbumesAdmin from '@/components/admin/galeria/AlbumesAdmin';
import { listarAlbumes } from './actions';

export default async function GaleriaPage() {
  let albumes;
  let error: string | null = null;
  try {
    albumes = await listarAlbumes();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  if (error || !albumes) {
    return (
      <>
        <PageHeader titulo="Galerías" />
        <ErrorDatos mensaje={error ?? ''} />
      </>
    );
  }

  return <AlbumesAdmin albumes={albumes} />;
}
