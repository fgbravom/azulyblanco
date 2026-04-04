import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCategoriaByNombre } from '@/lib/data/equipos'
import { getEquiposByCategoria } from '@/lib/data/equipos'
import { getJugadoresByEquipo } from '@/lib/data/jugadores'
import type { JugadorCompleto, Equipo } from '@/types/database'
import Image from 'next/image'

const POSICION_COLORS: Record<string, string> = {
  Arquero: 'bg-yellow-500',
  Defensor: 'bg-blue-600',
  Mediocampista: 'bg-green-600',
  Delantero: 'bg-red-600',
}

function getPosicionColor(posicion: string): string {
  return POSICION_COLORS[posicion] ?? 'bg-gray-500'
}

function getEstadoBadge(estado: string) {
  switch (estado) {
    case 'Activo':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>
    case 'Lesionado':
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Lesionado</Badge>
    case 'Sancionado':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Sancionado</Badge>
    default:
      return null
  }
}

interface SeriePageProps {
  categoriaNombre: string
  titulo: string
  descripcion: string
}

export default async function SeriePage({ categoriaNombre, titulo, descripcion }: SeriePageProps) {
  // Obtener categoría, equipo y jugadores desde Supabase
  let jugadores: JugadorCompleto[] = []
  let equipo: Equipo | null = null

  try {
    const categoria = await getCategoriaByNombre(categoriaNombre)
    if (categoria) {
      const equipos = await getEquiposByCategoria(categoria.id)
      if (equipos.length > 0) {
        // Tomar el equipo más reciente (mayor temporada)
        equipo = equipos[0]
        jugadores = await getJugadoresByEquipo(equipo.id)
      }
    }
  } catch {
    // Si hay error de conexión, mostrar estado vacío
  }

  // Agrupar jugadores por posición
  const porPosicion: Record<string, JugadorCompleto[]> = {}
  for (const j of jugadores) {
    if (!porPosicion[j.posicion]) porPosicion[j.posicion] = []
    porPosicion[j.posicion].push(j)
  }

  const ordenPosiciones = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero']
  const posicionesOrdenadas = [
    ...ordenPosiciones.filter((p) => porPosicion[p]),
    ...Object.keys(porPosicion).filter((p) => !ordenPosiciones.includes(p)),
  ]

  const tieneCuerpoTecnico = equipo && (equipo.entrenador || equipo.asistente_tecnico || equipo.preparador_fisico)

  return (
    <>
      <Header />
      <main className="min-h-screen pt-22 md:pt-16 lg:pt-20">
        {/* Hero */}
        <section className="bg-azul-primario text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{titulo}</h1>
            <p className="text-xl text-gray-200">{descripcion}</p>
            {equipo?.temporada && (
              <p className="mt-3 text-azul-claro font-medium">Temporada {equipo.temporada}</p>
            )}
          </div>
        </section>

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
              <div className="space-y-10">
                {posicionesOrdenadas.map((posicion) => (
                  <div key={posicion}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-3 h-8 rounded-sm ${getPosicionColor(posicion)}`} />
                      <h3 className="text-xl font-bold text-gray-800">{posicion}s</h3>
                      <span className="text-gray-400 text-sm">({porPosicion[posicion].length})</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {porPosicion[posicion].map((jugador) => (
                        <Card key={jugador.id} className="hover:shadow-lg transition-shadow border-gray-100">
                          <CardContent className="p-4">
                            {/* Foto o placeholder */}
                            <div className="relative mb-3">
                              {jugador.foto_url ? (
                                <div className="w-full aspect-square rounded-lg overflow-hidden">
                                  <Image
                                    src={jugador.foto_url}
                                    alt={jugador.nombre_completo}
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className={`w-full aspect-square rounded-lg ${getPosicionColor(jugador.posicion)} flex items-center justify-center text-white`}>
                                  <span className="text-4xl font-bold">{jugador.dorsal ?? '?'}</span>
                                </div>
                              )}
                              {jugador.dorsal && jugador.foto_url && (
                                <div className="absolute -top-2 -right-2 w-7 h-7 bg-azul-primario rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {jugador.dorsal}
                                </div>
                              )}
                            </div>

                            <div className="text-center">
                              <p className="font-bold text-sm leading-tight">{jugador.nombre}</p>
                              <p className="font-bold text-sm leading-tight text-gray-700">{jugador.apellidos}</p>
                              <p className="text-xs text-azul-primario font-medium mt-1">{jugador.posicion_abr}</p>
                              {jugador.estado !== 'Activo' && (
                                <div className="mt-1">{getEstadoBadge(jugador.estado)}</div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Cuerpo Técnico */}
        {tieneCuerpoTecnico && (
          <section className="py-16 px-4 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold mb-10 text-center text-azul-primario">Cuerpo Técnico</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {equipo!.entrenador && (
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-azul-primario rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                        {equipo!.entrenador[0]}
                      </div>
                      <h3 className="font-bold">{equipo!.entrenador}</h3>
                      <p className="text-sm text-gray-500 mt-1">Director Técnico</p>
                    </CardContent>
                  </Card>
                )}
                {equipo!.asistente_tecnico && (
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-azul-primario rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                        {equipo!.asistente_tecnico[0]}
                      </div>
                      <h3 className="font-bold">{equipo!.asistente_tecnico}</h3>
                      <p className="text-sm text-gray-500 mt-1">Asistente Técnico</p>
                    </CardContent>
                  </Card>
                )}
                {equipo!.preparador_fisico && (
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-azul-primario rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                        {equipo!.preparador_fisico[0]}
                      </div>
                      <h3 className="font-bold">{equipo!.preparador_fisico}</h3>
                      <p className="text-sm text-gray-500 mt-1">Preparador Físico</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
