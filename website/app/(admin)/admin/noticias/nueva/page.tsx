import NoticiaEditor from '@/components/admin/noticias/NoticiaEditor';
import { sesionParaNoticias } from '@/lib/auth/session';
import { listarRedactores } from '../../redactores/actions';

export default async function NuevaNoticiaPage() {
  const sesion = await sesionParaNoticias();
  if (sesion.rol === 'colaborador') {
    return <NoticiaEditor noticia={null} redactores={[]} rol="colaborador" nombreRedactor={sesion.nombre} />;
  }
  const redactores = await listarRedactores().catch(() => []);
  return <NoticiaEditor noticia={null} redactores={redactores} />;
}
