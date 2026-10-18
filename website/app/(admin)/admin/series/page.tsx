import Link from 'next/link';
import { ChevronRight, Shield, Users } from 'lucide-react';
import { ErrorDatos, PageHeader, Vacio } from '@/components/admin/ui';
import { listarSeries, type SerieAdmin } from './actions';

export default async function SeriesPage() {
  let series: SerieAdmin[] | undefined;
  let error: string | null = null;
  try {
    series = await listarSeries();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Error desconocido';
  }

  return (
    <>
      <PageHeader titulo="Series" descripcion="Textos, imagen, horarios y cuerpo técnico de cada serie del club." />

      {error || !series ? (
        <ErrorDatos mensaje={error ?? ''} />
      ) : series.length === 0 ? (
        <Vacio icono={Shield} titulo="No hay series registradas" />
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {series.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/series/${s.id}`}
                className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-32 bg-gradient-to-br from-azul-primario to-azul-medio">
                  {s.imagen_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imagen_url} alt="" className="h-full w-full object-cover opacity-60" />
                  )}
                  <p className="absolute bottom-3 left-4 right-4 line-clamp-2 font-heading text-xl font-bold text-white">{s.titulo || `Serie ${s.nombre}`}</p>
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gray-400" />
                      {s.total_jugadores} jugadores activos
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {s.equipo ? `Temporada ${s.equipo.temporada}` : 'Sin equipo activo'}
                      {s.equipo?.entrenador ? ` · DT ${s.equipo.entrenador}` : ''}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
