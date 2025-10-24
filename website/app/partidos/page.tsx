import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata = {
  title: 'Partidos',
  description: 'Calendario y resultados del Club Azul y Blanco',
}

export default function PartidosPage() {
  // Datos de ejemplo - reemplazar con datos reales de Supabase
  const proximosPartidos = [
    {
      id: 1,
      fecha: '2025-10-26',
      hora: '15:00',
      rival: 'Club Deportivo Rival',
      local: true,
      estadio: 'Estadio Municipal',
      competicion: 'Liga Local',
    },
    {
      id: 2,
      fecha: '2025-11-02',
      hora: '16:00',
      rival: 'Atlético Unidos',
      local: false,
      estadio: 'Estadio Unidos',
      competicion: 'Liga Local',
    },
    {
      id: 3,
      fecha: '2025-11-09',
      hora: '15:00',
      rival: 'Sporting FC',
      local: true,
      estadio: 'Estadio Municipal',
      competicion: 'Copa Regional',
    },
  ]

  const resultados = [
    {
      id: 1,
      fecha: '2025-10-19',
      rival: 'Real Amateurs',
      local: true,
      golesAzul: 3,
      golesRival: 1,
      competicion: 'Liga Local',
    },
    {
      id: 2,
      fecha: '2025-10-12',
      rival: 'FC Juvenil',
      local: false,
      golesAzul: 2,
      golesRival: 2,
      competicion: 'Liga Local',
    },
    {
      id: 3,
      fecha: '2025-10-05',
      rival: 'Deportivo Central',
      local: true,
      golesAzul: 1,
      golesRival: 0,
      competicion: 'Copa Regional',
    },
    {
      id: 4,
      fecha: '2025-09-28',
      rival: 'Unidos FC',
      local: false,
      golesAzul: 0,
      golesRival: 2,
      competicion: 'Liga Local',
    },
  ]

  const getResultadoBadge = (golesAzul: number, golesRival: number) => {
    if (golesAzul > golesRival) return <Badge className="bg-green-500">Victoria</Badge>
    if (golesAzul < golesRival) return <Badge className="bg-red-500">Derrota</Badge>
    return <Badge className="bg-yellow-500">Empate</Badge>
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-azul-oscuro to-azul-primario text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Partidos</h1>
            <p className="text-xl text-gray-200">
              Calendario y resultados de la temporada 2024-2025
            </p>
          </div>
        </section>

        {/* Contenido */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <Tabs defaultValue="proximos" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="proximos">Próximos Partidos</TabsTrigger>
                <TabsTrigger value="resultados">Resultados</TabsTrigger>
                <TabsTrigger value="tabla">Tabla de Posiciones</TabsTrigger>
              </TabsList>

              {/* Próximos Partidos */}
              <TabsContent value="proximos">
                <div className="space-y-4">
                  {proximosPartidos.map((partido) => (
                    <Card key={partido.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <Badge className="mb-2">{partido.competicion}</Badge>
                            <p className="text-sm text-gray-600 mb-1">
                              {new Date(partido.fecha).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })} - {partido.hora}hs
                            </p>
                            <p className="text-sm text-gray-600">📍 {partido.estadio}</p>
                          </div>

                          <div className="flex items-center gap-4 flex-1 justify-center">
                            <div className="text-center flex-1">
                              <div className="w-16 h-16 bg-azul-primario rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">
                                AyB
                              </div>
                              <p className="font-bold">Azul y Blanco</p>
                              {partido.local && <Badge variant="outline" className="mt-1">Local</Badge>}
                            </div>

                            <div className="text-2xl font-bold text-gray-400">VS</div>

                            <div className="text-center flex-1">
                              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center text-gray-600 text-xs">
                                ?
                              </div>
                              <p className="font-bold">{partido.rival}</p>
                              {!partido.local && <Badge variant="outline" className="mt-1">Visitante</Badge>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Resultados */}
              <TabsContent value="resultados">
                <div className="space-y-4">
                  {resultados.map((partido) => (
                    <Card key={partido.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{partido.competicion}</Badge>
                              {getResultadoBadge(partido.golesAzul, partido.golesRival)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(partido.fecha).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 flex-1 justify-center">
                            <div className="text-center flex-1">
                              <div className="w-16 h-16 bg-azul-primario rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">
                                AyB
                              </div>
                              <p className="font-bold">Azul y Blanco</p>
                            </div>

                            <div className="text-center">
                              <div className="text-4xl font-bold">
                                {partido.golesAzul} - {partido.golesRival}
                              </div>
                            </div>

                            <div className="text-center flex-1">
                              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                              <p className="font-bold">{partido.rival}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Tabla de Posiciones */}
              <TabsContent value="tabla">
                <Card>
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">Pos</th>
                            <th className="text-left py-3 px-2">Equipo</th>
                            <th className="text-center py-3 px-2">PJ</th>
                            <th className="text-center py-3 px-2">PG</th>
                            <th className="text-center py-3 px-2">PE</th>
                            <th className="text-center py-3 px-2">PP</th>
                            <th className="text-center py-3 px-2">GF</th>
                            <th className="text-center py-3 px-2">GC</th>
                            <th className="text-center py-3 px-2">DIF</th>
                            <th className="text-center py-3 px-2 font-bold">PTS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { pos: 1, equipo: 'Líder FC', pj: 10, pg: 7, pe: 2, pp: 1, gf: 20, gc: 8, pts: 23 },
                            { pos: 2, equipo: 'Real Amateurs', pj: 10, pg: 6, pe: 3, pp: 1, gf: 18, gc: 9, pts: 21 },
                            { pos: 3, equipo: 'Azul y Blanco', pj: 10, pg: 6, pe: 2, pp: 2, gf: 17, gc: 10, pts: 20, destacado: true },
                            { pos: 4, equipo: 'Deportivo Central', pj: 10, pg: 5, pe: 3, pp: 2, gf: 15, gc: 11, pts: 18 },
                            { pos: 5, equipo: 'FC Juvenil', pj: 10, pg: 4, pe: 4, pp: 2, gf: 14, gc: 12, pts: 16 },
                            { pos: 6, equipo: 'Atlético Unidos', pj: 10, pg: 3, pe: 3, pp: 4, gf: 11, gc: 14, pts: 12 },
                            { pos: 7, equipo: 'Sporting FC', pj: 10, pg: 2, pe: 2, pp: 6, gf: 9, gc: 16, pts: 8 },
                            { pos: 8, equipo: 'Unidos FC', pj: 10, pg: 1, pe: 1, pp: 8, gf: 7, gc: 21, pts: 4 },
                          ].map((equipo) => (
                            <tr
                              key={equipo.pos}
                              className={`border-b ${equipo.destacado ? 'bg-azul-primario text-white font-bold' : 'hover:bg-gray-50'}`}
                            >
                              <td className="py-3 px-2">{equipo.pos}</td>
                              <td className="py-3 px-2">{equipo.equipo}</td>
                              <td className="text-center py-3 px-2">{equipo.pj}</td>
                              <td className="text-center py-3 px-2">{equipo.pg}</td>
                              <td className="text-center py-3 px-2">{equipo.pe}</td>
                              <td className="text-center py-3 px-2">{equipo.pp}</td>
                              <td className="text-center py-3 px-2">{equipo.gf}</td>
                              <td className="text-center py-3 px-2">{equipo.gc}</td>
                              <td className="text-center py-3 px-2">{equipo.gf - equipo.gc}</td>
                              <td className="text-center py-3 px-2 font-bold">{equipo.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
