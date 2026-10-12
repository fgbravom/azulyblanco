import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { getCategoriaByNombre } from '@/lib/data/equipos'
import { getEquiposByCategoria } from '@/lib/data/equipos'
import { getPlantelPublico, getSerieInfo, type PlantelJugador } from '@/lib/contenido/publico'
import { MDXRenderer } from '@/components/mdx/MDXRenderer'
import { PlantelGrid } from './PlantelGrid'
import type { EquipoPublico } from '@/types/database'
import Image from 'next/image'
import { CalendarClock, MapPin, Trophy } from 'lucide-react'

interface SeriePageProps {
  slug: string
  categoriaNombre: string
  titulo: string
  descripcion: string
}

export default async function SeriePage({ slug, categoriaNombre, titulo: tituloBase, descripcion: descripcionBase }: SeriePageProps) {
  // Textos editables desde /admin/series; los props quedan como respaldo
  const info = await getSerieInfo(slug)
  const titulo = info?.titulo || tituloBase
  const descripcion = info?.descripcion || descripcionBase
  const datos = [
    { icono: Trophy, etiqueta: 'Competencia', valor: info?.competencia },
    { icono: CalendarClock, etiqueta: 'Entrenamientos', valor: info?.horario_entrenamiento },
    { icono: MapPin, etiqueta: 'Lugar', valor: info?.lugar_entrenamiento },
  ].filter((d) => d.valor)

  // Obtener categoría, equipo y jugadores desde Supabase
  let jugadores: PlantelJugador[] = []
  let equipo: EquipoPublico | null = null

  try {
    const categoria = await getCategoriaByNombre(categoriaNombre)
    if (categoria) {
      const equipos = await getEquiposByCategoria(categoria.id)
      if (equipos.length > 0) {
        // Tomar el equipo más reciente (mayor temporada)
        equipo = equipos[0]
        jugadores = await getPlantelPublico(equipo.id)
      }
    }
  } catch {
    // Si hay error de conexión, mostrar estado vacío
  }

  const cuerpoTecnico = equipo
    ? [
        { nombre: equipo.entrenador, foto: equipo.entrenador_foto_url, cargo: 'Director Técnico' },
        { nombre: equipo.asistente_tecnico, foto: equipo.asistente_tecnico_foto_url, cargo: 'Asistente Técnico' },
        { nombre: equipo.preparador_fisico, foto: equipo.preparador_fisico_foto_url, cargo: 'Preparador Físico' },
      ].filter((m): m is { nombre: string; foto: string | null; cargo: string } => !!m.nombre)
    : []

  return (
    <>
      <Header />
      <main className="min-h-screen pt-22 md:pt-16 lg:pt-20">
        {/* Hero */}
        <section className="relative bg-azul-primario text-white py-20 overflow-hidden">
          {info?.imagen_url && (
            <>
              <Image src={info.imagen_url} alt="" fill priority sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-azul-primario/75" />
            </>
          )}
          <div className="relative container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{titulo}</h1>
            <p className="text-xl text-gray-200">{descripcion}</p>
            {equipo?.temporada && (
              <p className="mt-3 text-azul-claro font-medium">Temporada {equipo.temporada}</p>
            )}
          </div>
        </section>

        {/* Información de la serie */}
        {(datos.length > 0 || info?.contenido) && (
          <section className="py-14 px-4 border-b border-gray-100">
            <div className="container mx-auto max-w-4xl">
              {datos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                  {datos.map(({ icono: Icono, etiqueta, valor }) => (
                    <div key={etiqueta} className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                      <Icono className="w-5 h-5 text-azul-claro shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">{etiqueta}</p>
                        <p className="font-semibold text-gray-800 whitespace-pre-line">{valor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {info?.contenido && <MDXRenderer content={info.contenido} />}
            </div>
          </section>
        )}

        {/* Plantel */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-10 text-center text-azul-primario">Plantel</h2>

            {jugadores.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <p className="text-lg">El plantel se publicará próximamente.</p>
                </CardContent>
              </Card>
            ) : (
              <PlantelGrid jugadores={jugadores} />
            )}
          </div>
        </section>

        {/* Cuerpo Técnico */}
        {cuerpoTecnico.length > 0 && (
          <section className="py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold mb-10 text-center text-azul-primario">Cuerpo Técnico</h2>
              <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
                {cuerpoTecnico.map(({ nombre, foto, cargo }) => (
                  <Card key={cargo} className="text-center w-full sm:w-[calc((100%-3rem)/3)]">
                    <CardContent className="p-6">
                      {foto ? (
                        <Image
                          src={foto}
                          alt={nombre}
                          width={112}
                          height={112}
                          className="w-28 h-28 rounded-full mx-auto mb-4 object-cover object-top ring-4 ring-azul-claro/30"
                        />
                      ) : (
                        <div className="w-28 h-28 bg-azul-primario rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
                          {nombre[0]}
                        </div>
                      )}
                      <h3 className="font-bold">{nombre}</h3>
                      <p className="text-sm text-gray-500 mt-1">{cargo}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
