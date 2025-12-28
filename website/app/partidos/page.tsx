import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarioGrid } from '@/components/calendario/CalendarioGrid'
import { eventosEnero2026, eventosDiciembrePasados } from '@/lib/data/eventos-enero'
import { SITE_CONFIG } from '@/lib/constants'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { filtrarEventosFuturos, filtrarSoloPartidos, ordenarEventosPorFecha } from '@/lib/utils/calendario'

export const metadata = {
  title: 'Partidos',
  description: 'Calendario y resultados del Club Azul y Blanco',
}

export default function PartidosPage() {
  // Combinar eventos pasados y futuros
  const todosLosEventos = [...eventosDiciembrePasados, ...eventosEnero2026]

  // Filtrar solo partidos futuros usando las utilidades centralizadas
  const eventosFuturos = filtrarEventosFuturos(todosLosEventos)
  const partidosFuturos = filtrarSoloPartidos(eventosFuturos)
  const partidosOrdenados = ordenarEventosPorFecha(partidosFuturos)

  const proximosPartidos = partidosOrdenados.map(evento => ({
      id: evento.id,
      fecha: evento.fecha,
      hora: evento.horaInicio || '15:00',
      rival: evento.rival || 'Por confirmar',
      local: true, // Ajustar según tus datos
      estadio: evento.estadio,
      competicion: 'Liga Local',
      confirmado: evento.confirmado
    }))

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
      <main className="min-h-screen pt-22 md:pt-16 lg:pt-20">
        {/* Hero */}
        <section className="bg-azul-primario text-white py-20">
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
            <Tabs defaultValue="calendario" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="calendario" className="text-xs md:text-sm">Calendario</TabsTrigger>
                <TabsTrigger value="proximos" className="text-xs md:text-sm">Próximos</TabsTrigger>
                <TabsTrigger value="resultados" className="text-xs md:text-sm">Resultados</TabsTrigger>
              </TabsList>

              {/* Calendario Mensual */}
              <TabsContent value="calendario">
                <CalendarioGrid eventos={todosLosEventos} mes="Diciembre" año={2025} />
              </TabsContent>

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

                          <div className="flex justify-end mt-4">
                            <Button
                              asChild
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Link
                                href={`https://wa.me/${SITE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Revisa la nómina
                              </Link>
                            </Button>
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
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
