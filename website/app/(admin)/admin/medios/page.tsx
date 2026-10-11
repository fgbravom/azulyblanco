import { PageHeader, ErrorDatos } from '@/components/admin/ui';
import Biblioteca from '@/components/admin/medios/Biblioteca';
import { listarMedios } from './actions';

export default async function MediosPage() {
  let medios;
  let error: string | null = null;
  try {
    medios = await listarMedios();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  return (
    <>
      <PageHeader
        titulo="Imágenes"
        descripcion="Biblioteca para portadas de noticias, fotos del plantel y de las series. Las fotos de las galerías se suben dentro de cada álbum."
      />
      {error ? <ErrorDatos mensaje={error} /> : <Biblioteca modo="gestion" iniciales={medios} />}
    </>
  );
}
