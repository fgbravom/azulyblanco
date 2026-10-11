import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CalendarioGrid } from '@/components/calendario/CalendarioGrid'
import { getEventosCalendario } from '@/lib/contenido/publico'

export const metadata = {
  title: 'Partidos',
  description: 'Calendario y resultados del Club Azul y Blanco',
}

export const revalidate = 300 // respaldo; el admin regenera al guardar

export default async function PartidosPage() {
  const todosLosEventos = await getEventosCalendario()

  return (
    <>
      <Header />
      <main className="min-h-screen pt-22 md:pt-16 lg:pt-20">
        {/* Hero */}
        <section className="bg-azul-primario text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Partidos</h1>
            <p className="text-xl text-gray-200">
              Calendario y últimos resultados.
            </p>
          </div>
        </section>

        {/* Contenido */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <CalendarioGrid eventos={todosLosEventos} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
