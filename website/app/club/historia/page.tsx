import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Historia',
  description: 'Historia del Club Azul y Blanco',
}

export default function HistoriaPage() {
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

            {/* Valores */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Nuestros Valores</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">⚽</div>
                    <h3 className="text-xl font-bold mb-2">Pasión</h3>
                    <p className="text-gray-600">
                      Amor por el fútbol y dedicación en cada partido
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">🤝</div>
                    <h3 className="text-xl font-bold mb-2">Compañerismo</h3>
                    <p className="text-gray-600">
                      Somos más que un equipo, somos una familia
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">🏆</div>
                    <h3 className="text-xl font-bold mb-2">Espíritu Amateur</h3>
                    <p className="text-gray-600">
                      Jugar por amor al deporte, no por dinero
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-center">Hitos Importantes</h2>
              <div className="space-y-8">
                {[
                  { year: '2006', title: 'Fundación del Club', desc: 'Nace la escuela de fútbol infantil Azul y Blanco Curicó' },
                  { year: '2019', title: 'Campeones ANFA', desc: 'Título del campeonato ANFA' },
                  { year: '2020', title: '14° Aniversario', desc: '14 años de pasión y familia' },
                  { year: '2024', title: 'Liga Gol', desc: 'Campeones Liga Gol (cuarta vez)' },
                  { year: '2025', title: 'Sitio Web Oficial', desc: 'Nueva etapa digital' },
                ].map((item, index) => (
                  <div key={index} className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-24 h-24 bg-azul-primario rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {item.year}
                    </div>
                    <div className="flex-1 pt-4">
                      <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
