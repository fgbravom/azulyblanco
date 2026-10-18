import { notFound } from 'next/navigation';
import NoticiaEditor from '@/components/admin/noticias/NoticiaEditor';
import { sesionParaNoticias } from '@/lib/auth/session';
import { listarRedactores } from '../../redactores/actions';
import { obtenerNoticia } from '../actions';

export default async function EditarNoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const sesion = await sesionParaNoticias();
  // Un redactor no ve el catálogo de redactores; la noticia ajena llega como null (404)
  const esRedactor = sesion.rol === 'redactor';
  const [noticia, redactores] = await Promise.all([
    obtenerNoticia(id),
    esRedactor ? Promise.resolve([]) : listarRedactores().catch(() => []),
  ]);
  if (!noticia) notFound();

  return (
    <NoticiaEditor
      noticia={noticia}
      redactores={redactores}
      rol={esRedactor ? 'redactor' : 'admin'}
      nombreRedactor={sesion.rol === 'redactor' ? sesion.nombre : undefined}
    />
  );
}
