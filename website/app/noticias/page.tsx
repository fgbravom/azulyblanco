import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getAllNoticias, getAllCategorias } from '@/lib/news'
import { NoticiasClient } from './NoticiasClient'

export const metadata = {
  title: 'Noticias',
  description: 'Últimas noticias del Club deportivo Azul y Blanco',
}

export default function NoticiasPage() {
  const noticias = getAllNoticias()
  const categorias = getAllCategorias()

  return (
    <>
      <Header />
      <main className="min-h-screen pt-22 md:pt-16 lg:pt-20">
        {/* Hero */}
        <section className="bg-azul-primario text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Noticias</h1>
            <p className="text-xl text-gray-200">
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
