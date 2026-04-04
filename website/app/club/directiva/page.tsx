import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Directiva',
  description: 'Directiva del Club Deportivo Azul y Blanco',
}

const DIRECTIVA = [
  { cargo: 'Presidente', nombre: '' },
  { cargo: 'Vicepresidente', nombre: '' },
  { cargo: 'Secretario', nombre: '' },
  { cargo: 'Tesorero', nombre: '' },
  { cargo: 'Director', nombre: '' },
  { cargo: 'Director', nombre: '' },
]

export default function DirectivaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-22 md:pt-16 lg:pt-20">
        {/* Hero */}
        <section className="bg-azul-primario text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Directiva</h1>
            <p className="text-xl text-gray-200">
              Las personas que guían el rumbo del club
            </p>
          </div>
        </section>

        {/* Miembros */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {DIRECTIVA.map((miembro, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-gray-100">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-azul-primario rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                      {miembro.nombre ? miembro.nombre[0] : '?'}
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {miembro.nombre || 'Por confirmar'}
                    </h3>
                    <p className="text-azul-primario font-medium text-sm mt-1">{miembro.cargo}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
