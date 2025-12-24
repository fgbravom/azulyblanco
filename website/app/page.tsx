import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProximosPartidos } from '@/components/calendario/ProximosPartidos'
import { eventosDiciembre2024 } from '@/lib/data/eventos-diciembre'
import { getAllNoticias } from '@/lib/news'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HeroSection } from '@/components/hero/HeroSection'

export default function HomePage() {
  const noticias = getAllNoticias().slice(0, 3) // Obtener las 3 noticias más recientes
  return (
    <>
      <Header isHome={true} />
      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Próximos Partidos */}
        <section className="py-16">
          <div className="px-4 md:px-8 mb-8">
            <div className="container mx-auto max-w-7xl">
              <h2 className="text-3xl md:text-4xl font-bold text-azul-primario mb-2">Próximos Partidos</h2>
              <p className="text-gray-600">No te pierdas ningún encuentro del club</p>
            </div>
          </div>
          <div className="w-full">
            <ProximosPartidos eventos={eventosDiciembre2024} limite={3} />
          </div>
          <div className="mt-8 text-center px-4">
            <Button variant="outline" asChild className="border-azul-primario text-azul-primario hover:bg-azul-primario hover:text-white">
              <Link href="/partidos">Ver calendario completo →</Link>
            </Button>
          </div>
        </section>

        {/* Noticias Recientes */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Noticias</h2>
              <Button variant="ghost" asChild>
                <Link href="/noticias">Ver todas →</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {noticias.length > 0 ? (
                noticias.map((noticia) => (
                  <Link key={noticia.slug} href={`/noticias/${noticia.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                      <div className="h-48 bg-gradient-to-br from-azul-primario to-azul-oscuro flex items-center justify-center">
                        <div className="text-white text-center p-6">
                          <h3 className="text-2xl font-bold mb-2">{noticia.categoria}</h3>
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{noticia.categoria}</Badge>
                        </div>
                        <CardTitle className="line-clamp-2">
                          {noticia.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          {noticia.author && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={`/images/authors/${noticia.author.toLowerCase().replace(/\s+/g, '-')}.jpg`} alt={noticia.author} />
                                <AvatarFallback className="bg-azul-claro text-white text-xs">
                                  {noticia.author.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">
                                {noticia.author}
                              </span>
                            </div>
                          )}
                          {noticia.author && noticia.date && <span>•</span>}
                          {noticia.date && (
                            <span className="text-xs">
                              {new Date(noticia.date + 'T12:00:00').toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {noticia.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  No hay noticias disponibles en este momento.
                </div>
              )}
            </div>
          </div>
        </section>

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
