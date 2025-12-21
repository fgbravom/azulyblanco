import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldTimeline } from '@/components/club/ShieldTimeline'
import { getAllShields } from '@/lib/shields'
import Image from 'next/image'

export const metadata = {
  title: 'Historia',
  description: 'Historia del Club Azul y Blanco',
}

export default function HistoriaPage() {
  const shields = getAllShields()
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-azul-oscuro to-azul-primario text-white py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Nuestra Historia</h1>
            <p className="text-xl text-gray-200">
              Más de una década de pasión por el fútbol amateur
            </p>
          </div>
        </section>

        {/* Contenido */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Fundación */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-azul-primario rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    2006
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Los Inicios</h2>
                    <p className="text-gray-600">La fundación del club</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Azul y Blanco nació el 6 de agosto de 2006 con un sueño: crear una escuela de fútbol infantil diferente, sin fines de lucro.
                  Lo que comenzó como un grupo de amigos en un potrero, hoy es una familia
                  que comparte la pasión por este deporte. Somos amateur, y lo llevamos con orgullo.
                </p>
              </CardContent>
            </Card>

            {/* Fundadores */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-center">Nuestros Fundadores</h2>
              <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Tres personas con un sueño en común: crear una escuela de fútbol infantil donde todos los niños
                pudieran jugar, sin importar su condición económica.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cristina Reyes */}
                <Card className="text-center hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-azul-primario/20">
                        <Image
                          src="/images/authors/cristina-reyes.jpg"
                          alt="Cristina Reyes"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">Cristina Reyes</h3>
                    <p className="text-azul-primario font-medium text-sm mb-3">Fundadora</p>
                    <p className="text-gray-600 text-sm">
                      La visionaria detrás del proyecto. Su pasión y dedicación transformaron un sueño
                      en una realidad que ha cambiado la vida de cientos de niños.
                    </p>
                  </CardContent>
                </Card>

                {/* Víctor Reyes */}
                <Card className="text-center hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-azul-primario/20">
                        <Image
                          src="/images/authors/victor-reyes.jpg"
                          alt="Víctor Reyes"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">Víctor Reyes</h3>
                    <p className="text-azul-primario font-medium text-sm mb-3">Fundador</p>
                    <p className="text-gray-600 text-sm">
                      Su compromiso con la formación deportiva y los valores del fútbol amateur
                      han sido pilares fundamentales del club.
                    </p>
                  </CardContent>
                </Card>

                {/* Javier Lizana */}
                <Card className="text-center hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-azul-primario/20">
                        <Image
                          src="/images/authors/javier-lizana.jpg"
                          alt="Javier Lizana"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">Javier Lizana</h3>
                    <p className="text-azul-primario font-medium text-sm mb-3">Fundador</p>
                    <p className="text-gray-600 text-sm">
                      Su espíritu de compañerismo y trabajo en equipo han sido esenciales
                      para construir la familia que hoy somos.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Historia del Escudo */}
            {shields.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-8 text-center">Nuestro Escudo</h2>
                <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                  A lo largo de los años, nuestro escudo ha evolucionado manteniendo siempre la esencia
                  y los colores que nos identifican.
                </p>
                <ShieldTimeline shields={shields} />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
