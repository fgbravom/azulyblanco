import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-gradient-to-br from-azul-oscuro via-azul-primario to-azul-claro">
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="w-32 h-32 bg-white/10 rounded-full mx-auto flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
              <span className="text-6xl font-bold">AyB</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            Azul y Blanco
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-100 font-light">
            Pasión Amateur desde 2010
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-azul-primario hover:bg-gray-100">
              <Link href="/contacto">Únete al Club</Link>
            </Button>

            <Button size="lg" variant="outline" asChild className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20">
              <Link href="/club/historia">Nuestra Historia</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Noticias Recientes */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Últimas Noticias</h2>
            <Button variant="ghost" asChild>
              <Link href="/noticias">Ver todas →</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    Próximamente: Noticias del club
                  </CardTitle>
                  <CardDescription>Hace 2 días</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    Esta sección mostrará las últimas noticias y novedades del club.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Próximo Partido */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Próximo Partido</h2>

          <Card className="border-2 border-azul-primario">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">Sábado 26 de Octubre - 15:00hs</p>
                <p className="text-lg font-semibold text-azul-primario">Liga Local - Fecha 10</p>
              </div>

              <div className="flex items-center justify-between gap-8">
                {/* Local */}
                <div className="flex-1 text-center">
                  <div className="w-24 h-24 bg-azul-primario rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">AyB</span>
                  </div>
                  <p className="font-bold text-lg">Azul y Blanco</p>
                  <p className="text-sm text-gray-500">Local</p>
                </div>

                {/* VS */}
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-400">VS</span>
                </div>

                {/* Visitante */}
                <div className="flex-1 text-center">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-600">?</span>
                  </div>
                  <p className="font-bold text-lg">Próximamente</p>
                  <p className="text-sm text-gray-500">Visitante</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-4">📍 Estadio Municipal</p>
                <Button asChild>
                  <Link href="/partidos">Ver Calendario Completo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 bg-azul-primario text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Te gusta el fútbol?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Súmate a nuestra familia. Entrenamos todos los sábados.
          </p>
          <Button size="lg" asChild className="bg-white text-azul-primario hover:bg-gray-100">
            <Link href="/contacto">Contáctanos</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
