import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getCategoriasNoticias, getNoticiasPublicas } from '@/lib/contenido/publico'
import { NoticiasClient } from './NoticiasClient'

export const metadata = {
  title: 'Noticias',
  description: 'Últimas noticias del Club deportivo Azul y Blanco',
}

export const revalidate = 300 // respaldo; el admin regenera al guardar

export default async function NoticiasPage() {
  const noticias = await getNoticiasPublicas()
  const categorias = getCategoriasNoticias(noticias)

  return (
    <>
      <Header />
      <main className="min-h-screen pt-22 md:pt-16 lg:pt-20">
        {/* Hero */}
        <section className="bg-azul-primario text-white pt-20 pb-6">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Noticias</h1>
            <p className="text-xl text-gray-200 mb-8">
              Mantente al día con las últimas novedades del club
            </p>
          </div>
        </section>

        <NoticiasClient noticias={noticias} categorias={categorias} />
      </main>
      <Footer />
    </>
  )
}
