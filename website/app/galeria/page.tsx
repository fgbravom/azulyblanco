import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getAllCategorias } from '@/lib/gallery'
import { getAlbumesPublicos } from '@/lib/contenido/publico'
import { GaleriaClient } from './GaleriaClient'

export const metadata = {
  title: 'Galería',
  description: 'Fotos de partidos, entrenamientos y eventos del Club Deportivo Azul y Blanco de Curicó.',
}

export const revalidate = 300 // respaldo; el admin regenera al guardar

export default async function GaleriaPage() {
  const albums = await getAlbumesPublicos()
  const categorias = getAllCategorias()

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 md:pt-16 lg:pt-20">
        {/* Hero */}
        <section className="bg-azul-primario text-white pt-20 pb-6">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Galería</h1>
            <p className="text-xl text-gray-200 mb-8">
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
