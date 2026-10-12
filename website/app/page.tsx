import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProximosPartidos } from '@/components/calendario/ProximosPartidos'
import { getEventosCalendario, getNacionalidadesPlantel, getNoticiasPublicas } from '@/lib/contenido/publico'
import { HeroSection } from '@/components/hero/HeroSection'
import { UltimasNoticias } from '@/components/noticias/UltimasNoticias'
import { obtenerProximosEventos } from '@/lib/utils/calendario'
import { SITE_CONFIG } from '@/lib/constants'
import Bandera from '@/components/ui/bandera'

export const revalidate = 300 // respaldo; el admin regenera al guardar

// Datos estructurados: le dicen a Google quién es el club y cómo se llama el sitio
const NOMBRE_COMPLETO = `Club Deportivo ${SITE_CONFIG.name}`
const JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SportsOrganization',
      '@id': `${SITE_CONFIG.url}/#club`,
      name: NOMBRE_COMPLETO,
      alternateName: [SITE_CONFIG.name, `${SITE_CONFIG.name} Curicó`, 'AyB'],
      url: SITE_CONFIG.url,
      logo: `${SITE_CONFIG.url}/images/escudoazulyblanco.png`,
      description: SITE_CONFIG.description,
      sport: 'Fútbol',
      foundingDate: SITE_CONFIG.foundingDate,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Curicó',
        addressRegion: 'Maule',
        addressCountry: 'CL',
      },
      sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
      memberOf: {
        '@type': 'SportsOrganization',
        name: SITE_CONFIG.association.name,
        sameAs: [SITE_CONFIG.association.instagram],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_CONFIG.url}/#sitio`,
      name: SITE_CONFIG.name,
      alternateName: NOMBRE_COMPLETO,
      url: SITE_CONFIG.url,
      inLanguage: 'es-CL',
      publisher: { '@id': `${SITE_CONFIG.url}/#club` },
    },
  ],
}).replace(/</g, '\\u003c')

export default async function HomePage() {
  const [eventos, todasLasNoticias, paisesPlantel] = await Promise.all([
    getEventosCalendario(),
    getNoticiasPublicas(),
    getNacionalidadesPlantel(),
  ])
  const [proximoEvento] = obtenerProximosEventos(eventos, 1)
  return (
    <>
      <Header isHome={true} hideInitially={true} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />
      <main className="flex flex-col min-h-screen bg-azul-primario">
        {/* La portada es solo foto: el título principal queda para buscadores y lectores de pantalla */}
        <h1 className="sr-only">{NOMBRE_COMPLETO}: fútbol amateur en Curicó</h1>

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
            {/* Las nacionalidades del plantel: una familia de muchos países */}
            {paisesPlantel.length > 0 && (
              <div className="mb-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
                {paisesPlantel.map((codigo) => (
                  <Bandera key={codigo} codigo={codigo} className="h-8 w-12 md:h-10 md:w-[60px] rounded-sm" />
                ))}
              </div>
            )}
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
