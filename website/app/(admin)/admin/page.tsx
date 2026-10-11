import Link from 'next/link';
import { CalendarDays, Clock, ImageIcon, Images, MapPin, Newspaper, Plus, Shield, Users } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { horaCorta, nombreActividad } from '@/lib/contenido/calendario';
import type { Actividad, NoticiaDB } from '@/lib/contenido/tipos';
import { ErrorDatos, EstadoBadge, PageHeader, Panel, formatearFecha } from '@/components/admin/ui';
import ImportarContenido from '@/components/admin/inicio/ImportarContenido';
import { pendientesDeImportar } from './actions';

async function getResumen() {
  const supabase = createAdminClient();
  const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Santiago' });
  const contar = (tabla: string) => supabase.from(tabla).select('*', { count: 'exact', head: true });

  const [proximas, actividades, noticias, borradores, albumes, fotos, jugadores, ultimasNoticias] = await Promise.all([
    supabase.from('programacion').select('*').gte('fecha', hoy).order('fecha').order('hora_inicio', { nullsFirst: true }).limit(6),
    contar('programacion'),
    contar('noticias'),
    contar('noticias').eq('publicado', false),
    contar('albumes'),
    contar('fotos'),
    contar('jugadores').eq('activo', true),
    supabase
      .from('noticias')
      .select('id, titulo, fecha, publicado, categoria')
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  const error = [proximas, actividades, noticias, albumes].find((r) => r.error)?.error;
  if (error) throw new Error(error.message);

  return {
    proximas: (proximas.data ?? []) as Actividad[],
    totalProximas: proximas.data?.length ?? 0,
    totalActividades: actividades.count ?? 0,
    totalNoticias: noticias.count ?? 0,
    borradores: borradores.count ?? 0,
    totalAlbumes: albumes.count ?? 0,
    totalFotos: fotos.count ?? 0,
    jugadores: jugadores.count ?? 0,
    ultimasNoticias: (ultimasNoticias.data ?? []) as Pick<NoticiaDB, 'id' | 'titulo' | 'fecha' | 'publicado' | 'categoria'>[],
  };
}

export default async function AdminDashboard() {
  let resumen: Awaited<ReturnType<typeof getResumen>>;
  let pendientes: Awaited<ReturnType<typeof pendientesDeImportar>>;
  try {
    [resumen, pendientes] = await Promise.all([getResumen(), pendientesDeImportar()]);
  } catch (e) {
    return (
      <>
        <PageHeader titulo="Inicio" />
        <ErrorDatos mensaje={e instanceof Error ? e.message : 'Error desconocido'} />
      </>
    );
  }


  const tarjetas = [
    { titulo: 'Próximas actividades', valor: resumen.totalProximas === 6 ? '6+' : resumen.totalProximas, detalle: `${resumen.totalActividades} en total`, icono: CalendarDays, href: '/admin/programacion' },
    { titulo: 'Noticias', valor: resumen.totalNoticias, detalle: resumen.borradores ? `${resumen.borradores} en borrador` : 'Todas publicadas', icono: Newspaper, href: '/admin/noticias' },
    { titulo: 'Álbumes', valor: resumen.totalAlbumes, detalle: `${resumen.totalFotos} fotos`, icono: Images, href: '/admin/galeria' },
    { titulo: 'Jugadores activos', valor: resumen.jugadores, detalle: 'En todas las series', icono: Users, href: '/admin/jugadores' },
  ];

  const accesos = [
    { label: 'Nueva actividad', href: '/admin/programacion', icono: CalendarDays },
    { label: 'Nueva noticia', href: '/admin/noticias/nueva', icono: Newspaper },
    { label: 'Nuevo álbum', href: '/admin/galeria', icono: Images },
    { label: 'Subir imágenes', href: '/admin/medios', icono: ImageIcon },
    { label: 'Editar series', href: '/admin/series', icono: Shield },
  ];

  return (
    <div className="space-y-6">
      <PageHeader titulo="Inicio" descripcion="Resumen del contenido del sitio de Azul y Blanco." />

      {pendientes.actividades + pendientes.noticias + pendientes.albumes > 0 && <ImportarContenido pendientes={pendientes} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <Link
            key={t.titulo}
            href={t.href}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-azul-claro/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">{t.titulo}</p>
              <t.icono className="h-5 w-5 text-azul-claro" />
            </div>
            <p className="mt-2 text-3xl font-bold text-azul-primario">{t.valor}</p>
            <p className="mt-1 text-xs text-gray-500">{t.detalle}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <Panel
          titulo="Próximas actividades"
          acciones={<Link href="/admin/programacion" className="text-sm font-medium text-azul-claro hover:underline">Ver todas</Link>}
        >
          {resumen.proximas.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">No hay actividades programadas.</p>
          ) : (
            <ul className="-my-2 divide-y divide-gray-100">
              {resumen.proximas.map((a) => (
                <li key={a.id} className="flex items-center gap-4 py-3">
                  <div className="w-14 shrink-0 rounded-lg bg-azul-primario py-1.5 text-center text-white">
                    <p className="text-[10px] font-semibold uppercase">{formatearFecha(a.fecha, { month: 'short' }).replace('.', '')}</p>
                    <p className="text-lg font-bold leading-none">{Number(a.fecha.slice(8))}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{nombreActividad(a)}</p>
                    <p className="flex flex-wrap gap-x-3 text-xs text-gray-500">
                      {a.hora_inicio && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{horaCorta(a.hora_inicio)}</span>}
                      {a.estadio && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{a.estadio}</span>}
                      {!a.confirmado && <span className="text-amber-600">Por confirmar</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel titulo="Accesos rápidos">
            <div className="grid grid-cols-1 gap-2">
              {accesos.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-azul-claro hover:text-azul-primario"
                >
                  <Plus className="h-4 w-4 text-azul-claro" />
                  {a.label}
                </Link>
              ))}
            </div>
          </Panel>

          <Panel
            titulo="Noticias recientes"
            acciones={<Link href="/admin/noticias" className="text-sm font-medium text-azul-claro hover:underline">Ver todas</Link>}
          >
            {resumen.ultimasNoticias.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">Aún no hay noticias.</p>
            ) : (
              <ul className="-my-2 divide-y divide-gray-100">
                {resumen.ultimasNoticias.map((n) => (
                  <li key={n.id} className="py-2.5">
                    <Link href={`/admin/noticias/${n.id}`} className="block truncate text-sm font-medium text-gray-900 hover:text-azul-primario">
                      {n.titulo}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <EstadoBadge publicado={n.publicado} />
                      {formatearFecha(n.fecha)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
