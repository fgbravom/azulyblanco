import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCategoriaByNombre } from '@/lib/data/equipos'
import { getEquiposByCategoria } from '@/lib/data/equipos'
import { getEscudosRivales, getPlantelPublico, getSerieInfo, type PlantelJugador } from '@/lib/contenido/publico'
import { getPosicionesSerie } from '@/lib/data/posiciones'
import { MDXRenderer } from '@/components/mdx/MDXRenderer'
import { PlantelGrid } from './PlantelGrid'
import { FichaPersona } from './FichaPersona'
import { TablaPosiciones } from './TablaPosiciones'
import type { EquipoPublico } from '@/types/database'
import Image from 'next/image'
import { CalendarClock, MapPin, Trophy } from 'lucide-react'

// El cuerpo técnico se guarda como nombre completo en un solo campo:
// con tres o más palabras, las dos últimas son los apellidos
function separarNombre(completo: string): { nombre: string; apellidos: string } {
  const palabras = completo.trim().split(/\s+/)
  if (palabras.length === 1) return { nombre: '', apellidos: palabras[0] }
  const corte = palabras.length >= 3 ? palabras.length - 2 : 1
  return { nombre: palabras.slice(0, corte).join(' '), apellidos: palabras.slice(corte).join(' ') }
}

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
  // Tabla del Campeonato ANFA transcrita desde la imagen oficial (sin base de datos)
  const tablaPosiciones = getPosicionesSerie(slug)
  const escudos = tablaPosiciones ? await getEscudosRivales() : {}
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

        {/* Plantel, cuerpo técnico y tabla de posiciones (la pestaña de tabla solo existe si hay tabla publicada) */}
        <Tabs defaultValue="plantel">
          {tablaPosiciones && (
            <div className="px-4 pt-10 flex justify-center">
              <TabsList>
                <TabsTrigger value="plantel">Plantel</TabsTrigger>
                <TabsTrigger value="posiciones">Tabla de posiciones</TabsTrigger>
              </TabsList>
            </div>
          )}

          <TabsContent value="plantel" className="mt-0">
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

            {cuerpoTecnico.length > 0 && (
              <section className="py-16 px-4 bg-gray-50">
                <div className="container mx-auto max-w-6xl">
                  <h2 className="text-3xl font-bold mb-10 text-center text-azul-primario">Cuerpo Técnico</h2>
                  {/* Mismo ancho que las columnas del plantel, pero centradas */}
                  <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {cuerpoTecnico.map(({ nombre, foto, cargo }) => {
                      const partes = separarNombre(nombre)
                      return (
                        <div
                          key={cargo}
                          className="w-[calc(50%-0.5rem)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]"
                        >
                          <FichaPersona foto={foto} alt={nombre} {...partes} detalle={cargo} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}
          </TabsContent>

          {tablaPosiciones && (
            <TabsContent value="posiciones" className="mt-0">
              <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                  <TablaPosiciones tabla={tablaPosiciones} escudos={escudos} />
                </div>
              </section>
            </TabsContent>
          )}
        </Tabs>
      </main>
      <Footer />
    </>
  )
}
