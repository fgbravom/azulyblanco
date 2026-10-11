import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProximosPartidos } from '@/components/calendario/ProximosPartidos'
import { getEventosCalendario, getNoticiasPublicas } from '@/lib/contenido/publico'
import { HeroSection } from '@/components/hero/HeroSection'
import { UltimasNoticias } from '@/components/noticias/UltimasNoticias'
import { obtenerProximosEventos } from '@/lib/utils/calendario'

export const revalidate = 300 // respaldo; el admin regenera al guardar

export default async function HomePage() {
  const [eventos, todasLasNoticias] = await Promise.all([getEventosCalendario(), getNoticiasPublicas()])
  const [proximoEvento] = obtenerProximosEventos(eventos, 1)
  return (
    <>
      <Header isHome={true} hideInitially={true} />
      <main className="flex flex-col min-h-screen bg-azul-primario">
        {/* Hero Section */}
        <HeroSection />

        {/* Próximos Partidos */}
        <section className="py-16 bg-azul-primario">
          <div className="px-4 md:px-8 mb-8">
            <div className="container mx-auto max-w-7xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">PROGRAMACIÓN</h2>
              <p className="text-white">No te pierdas ningún encuentro del club</p>
            </div>
          </div>
          <div className="w-full">
            <ProximosPartidos eventos={eventos} limite={4} />
          </div>
          <div className="mt-8 text-center px-4">
            <Button variant="outline" asChild className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-azul-primario transition-colors">
              <Link href="/partidos">Ver calendario completo →</Link>
            </Button>
          </div>
        </section>

        {/* Últimas noticias */}
        <UltimasNoticias
          noticias={todasLasNoticias.slice(0, proximoEvento ? 3 : 4)}
          proximoEvento={proximoEvento}
        />

        {/* CTA Final */}
        <section className="py-16 px-4 bg-azul-primario text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Te gusta el fútbol?
            </h2>
            <p className="text-xl mb-8 text-gray-100">
              Súmate a nuestra familia.
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
