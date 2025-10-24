import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Equipos',
  description: 'Plantel del Club Azul y Blanco',
}

export default function EquiposPage() {
  // Datos de ejemplo - reemplazar con datos reales de Supabase
  const jugadores = [
    { nombre: 'Jugador 1', numero: 1, posicion: 'Arquero' },
    { nombre: 'Jugador 2', numero: 2, posicion: 'Defensor' },
    { nombre: 'Jugador 3', numero: 3, posicion: 'Defensor' },
    { nombre: 'Jugador 4', numero: 4, posicion: 'Defensor' },
    { nombre: 'Jugador 5', numero: 5, posicion: 'Mediocampista' },
    { nombre: 'Jugador 6', numero: 6, posicion: 'Mediocampista' },
    { nombre: 'Jugador 7', numero: 7, posicion: 'Mediocampista' },
    { nombre: 'Jugador 8', numero: 8, posicion: 'Mediocampista' },
    { nombre: 'Jugador 9', numero: 9, posicion: 'Delantero' },
    { nombre: 'Jugador 10', numero: 10, posicion: 'Delantero' },
    { nombre: 'Jugador 11', numero: 11, posicion: 'Delantero' },
  ]

  const getPosicionColor = (posicion: string) => {
    switch (posicion) {
      case 'Arquero':
        return 'bg-yellow-500'
      case 'Defensor':
        return 'bg-blue-500'
      case 'Mediocampista':
        return 'bg-green-500'
      case 'Delantero':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-azul-oscuro to-azul-primario text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Nuestro Plantel</h1>
            <p className="text-xl text-gray-200">
              Temporada 2024-2025
            </p>
          </div>
        </section>

        {/* Foto de Equipo */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <Card>
              <CardContent className="p-0">
                <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">📸</div>
                    <p className="text-xl">Foto del equipo completo</p>
                    <p className="text-sm">(Agregar imagen real)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Jugadores */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Plantel Actual</h2>

            {/* Filtros por posición */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {['Todos', 'Arquero', 'Defensor', 'Mediocampista', 'Delantero'].map((pos) => (
                <Badge key={pos} variant="outline" className="cursor-pointer hover:bg-azul-primario hover:text-white">
                  {pos}
                </Badge>
              ))}
            </div>

            {/* Grid de jugadores */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {jugadores.map((jugador, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Avatar placeholder */}
                    <div className="relative mb-4">
                      <div className={`w-full aspect-square rounded-lg ${getPosicionColor(jugador.posicion)} flex items-center justify-center text-white`}>
                        <span className="text-6xl font-bold">{jugador.numero}</span>
                      </div>
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-white text-azul-primario border border-azul-primario">
                          {jugador.posicion}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <h3 className="font-bold text-lg mb-1">{jugador.nombre}</h3>
                      <p className="text-gray-600 text-sm">#{jugador.numero}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Cuerpo Técnico */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Cuerpo Técnico</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { nombre: 'Director Técnico', cargo: 'Entrenador Principal' },
                { nombre: 'Asistente Técnico', cargo: 'Asistente' },
                { nombre: 'Preparador Físico', cargo: 'PF' },
              ].map((tecnico, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                      👤
                    </div>
                    <h3 className="font-bold text-lg mb-1">{tecnico.nombre}</h3>
                    <p className="text-gray-600 text-sm">{tecnico.cargo}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
