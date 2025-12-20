import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getAllAlbums, getAllCategorias } from '@/lib/gallery'
import { GaleriaClient } from './GaleriaClient'

export const metadata = {
  title: 'Galería',
  description: 'Fotos y momentos del Club deportivo Azul y Blanco',
}

export default function GaleriaPage() {
  const albums = getAllAlbums()
  const categorias = getAllCategorias()

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-azul-oscuro to-azul-primario text-white py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Galería</h1>
            <p className="text-xl text-gray-200">
              Revive los mejores momentos del club en imágenes
            </p>
          </div>
        </section>

        <GaleriaClient albums={albums} categorias={categorias} />
      </main>
      <Footer />
    </>
  )
}
