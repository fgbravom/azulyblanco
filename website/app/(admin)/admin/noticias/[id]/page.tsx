import { notFound } from 'next/navigation';
import NoticiaEditor from '@/components/admin/noticias/NoticiaEditor';
import { obtenerNoticia } from '../actions';

export default async function EditarNoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const noticia = await obtenerNoticia(id);
  if (!noticia) notFound();

  return <NoticiaEditor noticia={noticia} />;
}
