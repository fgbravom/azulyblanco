import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const metadata = {
  title: 'Noticias',
  description: 'Últimas noticias del Club Azul y Blanco',
}

export default function NoticiasPage() {
  // Datos de ejemplo - reemplazar con datos reales de Supabase
  const noticias = [
    {
      id: 1,
      titulo: 'Victoria contundente en el último partido',
      extracto: 'El equipo logró una gran victoria por 3-0 ante su clásico rival en un partido disputado en nuestro estadio.',
      categoria: 'Partidos',
      fecha: '2025-10-20',
      imagen: null,
    },
    {
      id: 2,
      titulo: 'Nuevas incorporaciones para la temporada',
      extracto: 'El club anuncia la llegada de tres nuevos jugadores que reforzarán el plantel para los próximos desafíos.',
      categoria: 'Jugadores',
      fecha: '2025-10-18',
      imagen: null,
    },
    {
      id: 3,
      titulo: 'Torneo de verano: ¡Estamos clasificados!',
      extracto: 'Azul y Blanco se clasifica para la fase final del torneo de verano tras vencer en la última fecha.',
      categoria: 'Torneos',
      fecha: '2025-10-15',
      imagen: null,
    },
    {
      id: 4,
      titulo: 'Jornada solidaria: el club ayuda a la comunidad',
      extracto: 'Organizamos una colecta de alimentos y ropa para familias necesitadas del barrio.',
      categoria: 'Institucional',
      fecha: '2025-10-12',
      imagen: null,
    },
    {
      id: 5,
      titulo: 'Entrenamiento especial con ex jugador profesional',
      extracto: 'El plantel recibió una clínica de fútbol dictada por un ex jugador de primera división.',
      categoria: 'Entrenamientos',
      fecha: '2025-10-10',
      imagen: null,
    },
    {
      id: 6,
      titulo: 'Aniversario del club: 15 años de pasión',
      extracto: 'Celebramos un nuevo aniversario con un partido homenaje y una cena con todos los socios.',
      categoria: 'Institucional',
      fecha: '2025-10-05',
      imagen: null,
    },
  ]

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Partidos': 'bg-blue-500',
      'Jugadores': 'bg-green-500',
      'Torneos': 'bg-purple-500',
      'Institucional': 'bg-orange-500',
      'Entrenamientos': 'bg-teal-500',
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Noticias</h1>
            <p className="text-xl text-gray-200">
              Mantente al día con todo lo que pasa en el club
            </p>
          </div>
        </section>

        {/* Filtros */}
        <section className="py-8 px-4 bg-gray-50 border-b">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-wrap gap-3">
              <Badge variant="default" className="cursor-pointer">Todas</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-azul-primario hover:text-white">Partidos</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-azul-primario hover:text-white">Jugadores</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-azul-primario hover:text-white">Torneos</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-azul-primario hover:text-white">Institucional</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-azul-primario hover:text-white">Entrenamientos</Badge>
            </div>
          </div>
        </section>

        {/* Lista de Noticias */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticias.map((noticia) => (
                <Link key={noticia.id} href={`/noticias/${noticia.id}`}>
                  <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                    {/* Imagen placeholder */}
                    <div className="h-48 bg-gradient-to-br from-azul-claro to-azul-primario flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-5xl mb-2">📰</div>
                        <p className="text-sm opacity-75">Imagen de la noticia</p>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(noticia.categoria)}>
                          {noticia.categoria}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(noticia.fecha).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2 hover:text-azul-primario transition-colors">
                        {noticia.titulo}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {noticia.extracto}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Paginación */}
            <div className="mt-12 flex justify-center gap-2">
              <button className="px-4 py-2 border rounded hover:bg-gray-100">
                Anterior
              </button>
              <button className="px-4 py-2 bg-azul-primario text-white rounded">
                1
              </button>
              <button className="px-4 py-2 border rounded hover:bg-gray-100">
                2
              </button>
              <button className="px-4 py-2 border rounded hover:bg-gray-100">
                3
              </button>
              <button className="px-4 py-2 border rounded hover:bg-gray-100">
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
