import { notFound } from 'next/navigation';
import { sesionParaSeccion } from '@/lib/auth/session';
import AlbumEditor from '@/components/admin/galeria/AlbumEditor';
import { obtenerAlbum } from '../actions';

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  await sesionParaSeccion('galeria');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const resultado = await obtenerAlbum(id);
  if (!resultado) notFound();

  return <AlbumEditor album={resultado.album} fotos={resultado.fotos} />;
}
