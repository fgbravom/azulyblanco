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
        <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/fotoportada.jpg"
              alt="Fútbol de barrio - Azul y Blanco"
              fill
              className="object-cover object-center"
              priority
              quality={90}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-azul-oscuro/90 via-azul-primario/70 to-azul-oscuro/90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
            {/* Escudo */}
            <div className="mb-8 animate-fade-in">
              <div className="w-28 h-28 md:w-32 md:h-32 mx-auto flex items-center justify-center">
                <Image
                  src="/images/escudoazulyblanco.png"
                  alt="Escudo Azul y Blanco"
                  width={128}
                  height={128}
                  className="drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
              Club Deportivo
              <br />
              <span className="text-azul-claro">Azul</span> y <span className="text-white">Blanco</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-2xl mb-4 text-gray-100 font-light max-w-3xl mx-auto leading-relaxed">
              Más que un club, una familia unida por el amor al fútbol amateur
            </p>

            <p className="text-base md:text-lg mb-10 text-white/90 font-medium">
              Desde 2006 • Curicó, Chile
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white text-azul-primario hover:bg-gray-100 font-bold text-lg px-8 py-6 shadow-2xl"
              >
                <Link href="/contacto">Únete al Club</Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-transparent backdrop-blur-sm border-2 border-white text-white hover:bg-white/20 font-bold text-lg px-8 py-6"
              >
                <Link href="/club/historia">Nuestra Historia</Link>
              </Button>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/50 rounded-full"></div>
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
