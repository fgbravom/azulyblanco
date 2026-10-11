'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ExternalLink, Newspaper, Pencil, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NoticiaDB } from '@/lib/contenido/tipos';
import { cambiarPublicacionNoticia, eliminarNoticia } from '@/app/(admin)/admin/noticias/actions';
import { EstadoBadge, Vacio, formatearFecha, inputClass } from '@/components/admin/ui';

type Filtro = 'todas' | 'publicadas' | 'borradores';

export default function NoticiasAdmin({ iniciales }: { iniciales: NoticiaDB[] }) {
  const [noticias, setNoticias] = useState(iniciales);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [busqueda, setBusqueda] = useState('');

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return noticias.filter((n) => {
      if (filtro === 'publicadas' && !n.publicado) return false;
      if (filtro === 'borradores' && n.publicado) return false;
      return !q || `${n.titulo} ${n.categoria} ${n.autor ?? ''}`.toLowerCase().includes(q);
    });
  }, [noticias, filtro, busqueda]);

  const conteo = {
    todas: noticias.length,
    publicadas: noticias.filter((n) => n.publicado).length,
    borradores: noticias.filter((n) => !n.publicado).length,
  };

  const alternarPublicacion = async (n: NoticiaDB) => {
    try {
      await cambiarPublicacionNoticia(n.id, !n.publicado);
      setNoticias((prev) => prev.map((x) => (x.id === n.id ? { ...x, publicado: !n.publicado } : x)));
      toast.success(n.publicado ? 'Noticia pasada a borrador' : 'Noticia publicada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar');
    }
  };

  const eliminar = async (n: NoticiaDB) => {
    if (!confirm(`¿Eliminar la noticia "${n.titulo}"? No se puede deshacer.`)) return;
    try {
      await eliminarNoticia(n.id);
      setNoticias((prev) => prev.filter((x) => x.id !== n.id));
      toast.success('Noticia eliminada');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar');
    }
  };

  if (noticias.length === 0) {
    return (
      <Vacio
        icono={Newspaper}
        titulo="Aún no hay noticias"
        descripcion="Escribe la primera: puedes guardarla como borrador y publicarla cuando esté lista."
        accion={
          <Button asChild>
            <Link href="/admin/noticias/nueva">Escribir noticia</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-gray-200">
          {(['todas', 'publicadas', 'borradores'] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium capitalize',
                filtro === f ? 'bg-azul-primario text-white' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {f} <span className="opacity-70">({conteo[f]})</span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar noticia" className={cn(inputClass, 'pl-9')} />
        </div>
      </div>

      <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {visibles.map((n) => (
          <li key={n.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <Link href={`/admin/noticias/${n.id}`} className="flex min-w-0 flex-1 items-center gap-4">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-azul-primario to-azul-medio">
                {n.portada_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.portada_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Newspaper className="h-6 w-6 text-white/40" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900 hover:text-azul-primario">{n.titulo}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <EstadoBadge publicado={n.publicado} />
                  <span>{n.categoria}</span>
                  <span>{formatearFecha(n.fecha)}</span>
                  {n.autor && <span>{n.autor}</span>}
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-1 sm:shrink-0">
              <Button variant="outline" size="sm" onClick={() => alternarPublicacion(n)}>
                {n.publicado ? 'Despublicar' : 'Publicar'}
              </Button>
              {n.publicado && (
                <Button variant="ghost" size="icon" asChild title="Ver en el sitio">
                  <a href={`/noticias/${n.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink />
                  </a>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild title="Editar">
                <Link href={`/admin/noticias/${n.id}`}>
                  <Pencil />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" title="Eliminar" onClick={() => eliminar(n)} className="hover:text-red-600">
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
        {visibles.length === 0 && <li className="p-8 text-center text-sm text-gray-500">Ninguna noticia coincide con el filtro.</li>}
      </ul>
    </div>
  );
}
