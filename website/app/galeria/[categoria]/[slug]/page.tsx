import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getAlbumBySlug, getAllAlbums } from '@/lib/gallery'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlbumViewer } from './AlbumViewer'

interface PageProps {
  params: Promise<{ categoria: string; slug: string }>
}

export async function generateStaticParams() {
  const albums = getAllAlbums()
  return albums.map((album) => ({
    categoria: album.categoria,
    slug: album.slug,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { categoria, slug } = await params
  const album = getAlbumBySlug(categoria, slug)

  if (!album) {
    return {
      title: 'Álbum no encontrado',
    }
  }

  return {
    title: album.title,
    description: album.description,
  }
}

const getCategoriaColor = (categoria: string) => {
  const colors: Record<string, string> = {
    'partidos': 'bg-blue-500',
    'entrenamientos': 'bg-green-500',
    'eventos': 'bg-orange-500',
    'historia': 'bg-purple-500',
  }
  return colors[categoria] || 'bg-gray-500'
}

const getCategoriaLabel = (categoria: string) => {
  const labels: Record<string, string> = {
    'partidos': 'Partidos',
    'entrenamientos': 'Entrenamientos',
    'eventos': 'Eventos',
    'historia': 'Historia',
  }
  return labels[categoria] || categoria
}

export default async function AlbumPage({ params }: PageProps) {
  const { categoria, slug } = await params
  const album = getAlbumBySlug(categoria, slug)

  if (!album) {
    notFound()
  }

  const fotosUrls = album.fotos.map(foto => `/galeria/${categoria}/${slug}/${foto}`)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-azul-oscuro to-azul-primario text-white py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <Link
              href="/galeria"
              className="inline-flex items-center text-white hover:text-gray-200 mb-6 transition-colors"
            >
              ← Volver a Galería
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${getCategoriaColor(album.categoria)} text-white`}>
                {getCategoriaLabel(album.categoria)}
              </Badge>
              {album.date && (
                <span className="text-sm text-gray-200">
                  {new Date(album.date).toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              )}
              <span className="text-sm text-gray-200">
                📸 {album.fotos.length} fotos
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{album.title}</h1>

            {album.description && (
              <p className="text-xl text-gray-200">
                {album.description}
              </p>
            )}

            {album.tags && album.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {album.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-white/10 text-white border-white/20">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Visor de fotos */}
        <AlbumViewer fotos={fotosUrls} albumTitle={album.title} />

        {/* Navegación */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <Link
              href="/galeria"
              className="inline-block bg-azul-primario text-white px-6 py-3 rounded-lg hover:bg-azul-oscuro transition-colors font-semibold"
            >
              ← Volver a la galería
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
