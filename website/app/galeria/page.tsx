import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Galería',
  description: 'Fotos y videos del Club Azul y Blanco',
}

export default function GaleriaPage() {
  // Datos de ejemplo - reemplazar con datos reales de Supabase
  const albumes = [
    {
      id: 1,
      titulo: 'Temporada 2024-2025',
      descripcion: 'Fotos de la temporada actual',
      fecha: '2024-10-20',
      categoria: 'Temporada',
      cantidadFotos: 45,
    },
    {
      id: 2,
      titulo: 'Victoria vs Real Amateurs',
      descripcion: 'Partido memorable ganado 3-1',
      fecha: '2024-10-19',
      categoria: 'Partidos',
      cantidadFotos: 32,
    },
    {
      id: 3,
      titulo: 'Entrenamientos Octubre',
      descripcion: 'Preparación para los próximos desafíos',
      fecha: '2024-10-15',
      categoria: 'Entrenamientos',
      cantidadFotos: 28,
    },
    {
      id: 4,
      titulo: 'Aniversario 15 años',
      descripcion: 'Celebración del aniversario del club',
      fecha: '2024-10-05',
      categoria: 'Eventos',
      cantidadFotos: 67,
    },
    {
      id: 5,
      titulo: 'Copa Regional - Semifinal',
      descripcion: 'Clasificación histórica a la final',
      fecha: '2024-09-28',
      categoria: 'Partidos',
      cantidadFotos: 41,
    },
    {
      id: 6,
      titulo: 'Jornada Solidaria',
      descripcion: 'Acción social del club en el barrio',
      fecha: '2024-09-20',
      categoria: 'Eventos',
      cantidadFotos: 23,
    },
  ]

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Temporada': 'bg-blue-500',
      'Partidos': 'bg-green-500',
      'Entrenamientos': 'bg-purple-500',
      'Eventos': 'bg-orange-500',
    }
    return colors[categoria] || 'bg-gray-500'
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-azul-oscuro to-azul-primario text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Galería</h1>
            <p className="text-xl text-gray-200">
              Revive los mejores momentos del club en fotos y videos
            </p>
          </div>
        </section>

        {/* Filtros */}
        <section className="py-8 px-4 bg-gray-50 border-b">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-semibold text-gray-700">Filtrar por:</span>
              <Badge variant="default" className="cursor-pointer">Todos</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-azul-primario hover:text-white">Temporada</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-azul-primario hover:text-white">Partidos</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-azul-primario hover:text-white">Entrenamientos</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-azul-primario hover:text-white">Eventos</Badge>
            </div>
          </div>
        </section>

        {/* Grid de Álbumes */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albumes.map((album) => (
                <Card key={album.id} className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  {/* Imagen de portada placeholder */}
                  <div className="h-64 bg-gradient-to-br from-azul-claro via-azul-primario to-azul-oscuro flex items-center justify-center text-white relative">
                    <div className="text-center">
                      <div className="text-6xl mb-3">📸</div>
                      <p className="text-lg font-semibold">{album.cantidadFotos} fotos</p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className={getCategoriaColor(album.categoria)}>
                        {album.categoria}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 hover:text-azul-primario transition-colors">
                      {album.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {album.descripcion}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        📅 {new Date(album.fecha).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="font-semibold text-azul-primario">
                        Ver álbum →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Sección de Videos */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Videos Destacados</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-5xl mb-2">▶️</div>
                      <p className="text-sm">Resumen del partido</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-1">Video {i}</h3>
                    <p className="text-sm text-gray-600">Descripción del video</p>
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
