import NoticiaEditor from '@/components/admin/noticias/NoticiaEditor';
import { listarRedactores } from '../../redactores/actions';

export default async function NuevaNoticiaPage() {
  const redactores = await listarRedactores().catch(() => []);
  return <NoticiaEditor noticia={null} redactores={redactores} />;
}
