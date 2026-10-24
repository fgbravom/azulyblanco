import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProgramacionPartidos } from '@/components/calendario/ProgramacionPartidos'
import { getEventosCalendario } from '@/lib/contenido/publico'

export const metadata = {
  title: 'Partidos',
  description: 'Calendario, programación y resultados de los partidos del Club Deportivo Azul y Blanco de Curicó.',
}

export const revalidate = 300 // respaldo; el admin regenera al guardar

export default async function PartidosPage() {
  const todosLosEventos = await getEventosCalendario()
  // El servidor corre en UTC: "hoy" se calcula en hora de Chile
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 md:pt-16 lg:pt-20">
        {/* Hero */}
        <section className="bg-azul-primario text-white pt-20 pb-6">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Partidos</h1>
            <p className="text-xl text-gray-200 mb-8">
              Programación y resultados del club
            </p>
          </div>
        </section>

        <ProgramacionPartidos eventos={todosLosEventos} hoy={hoy} />
      </main>
      <Footer />
    </>
  )
}
