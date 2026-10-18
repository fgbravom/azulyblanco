import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorDatos, PageHeader } from '@/components/admin/ui';
import NoticiasAdmin from '@/components/admin/noticias/NoticiasAdmin';
import { sesionParaNoticias } from '@/lib/auth/session';
import { listarNoticias } from './actions';

export default async function NoticiasPage() {
  const { rol } = await sesionParaNoticias();
  let noticias;
  let error: string | null = null;
  try {
    noticias = await listarNoticias();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  return (
    <>
      <PageHeader
        titulo="Noticias"
        descripcion={rol === 'redactor' ? 'Tus noticias: redáctalas, publícalas y edítalas.' : 'Redacta, publica y edita las noticias del club.'}
        acciones={
          <Button asChild>
            <Link href="/admin/noticias/nueva">
              <Plus /> Nueva noticia
            </Link>
          </Button>
        }
      />
      {error || !noticias ? <ErrorDatos mensaje={error ?? ''} /> : <NoticiasAdmin iniciales={noticias} rol={rol} />}
    </>
  );
}
