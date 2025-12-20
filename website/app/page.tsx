import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CalendarioResumido } from '@/components/calendario/CalendarioResumido'
import { eventosDiciembre2024 } from '@/lib/data/eventos-diciembre'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-gradient-to-br from-azul-oscuro via-azul-primario to-azul-claro">
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="w-40 h-40 mx-auto flex items-center justify-center">
                <Image
                  src="/images/escudoazulyblanco.png"
                  alt="Escudo Azul y Blanco"
                  width={160}
                  height={160}
                  className="drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            <h1 className="text-5xl md:text-5xl font-bold mb-4 tracking-tight">
              Club deportivo Azul y Blanco
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-gray-100 font-light">
              Desde 2006 fomentando la pasión por el fútbol amateur.
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

        {/* Calendario de Eventos */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <CalendarioResumido eventos={eventosDiciembre2024} limite={3} />
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
      </main>
      <Footer />
    </>
  )
}
