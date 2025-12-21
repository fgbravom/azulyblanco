import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getNoticiaBySlug, getAllNoticiaSlugs } from '@/lib/news'
import { MDXRenderer } from '@/components/mdx/MDXRenderer'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllNoticiaSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const noticia = getNoticiaBySlug(slug)

  if (!noticia) {
    return {
      title: 'Noticia no encontrada',
    }
  }

  return {
    title: noticia.title,
    description: noticia.description,
  }
}

const getCategoryColor = (categoria: string) => {
  const colors: Record<string, string> = {
    'Partidos': 'bg-blue-500',
    'Jugadores': 'bg-green-500',
    'Torneos': 'bg-purple-500',
    'Institucional': 'bg-orange-500',
    'Entrenamientos': 'bg-teal-500',
  }
  return colors[categoria] || 'bg-gray-500'
}

export default async function NoticiaPage({ params }: PageProps) {
  const { slug } = await params
  const noticia = getNoticiaBySlug(slug)

  if (!noticia) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-azul-oscuro to-azul-primario text-white py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link
              href="/noticias"
              className="inline-flex items-center text-white hover:text-gray-200 mb-6 transition-colors"
            >
              ← Volver a Noticias
            </Link>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Badge className={`${getCategoryColor(noticia.categoria)} text-white`}>
                {noticia.categoria}
              </Badge>
              {noticia.author && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`/images/authors/${noticia.author.toLowerCase().replace(/\s+/g, '-')}.jpg`} alt={noticia.author} />
                    <AvatarFallback className="bg-azul-claro text-white text-xs">
                      {noticia.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-200">
                    {noticia.author}
                  </span>
                </div>
              )}
              {noticia.date && (
                <span className="text-sm text-gray-200">
                  • {new Date(noticia.date).toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{noticia.title}</h1>

            {noticia.description && (
              <p className="text-xl text-gray-200">
                {noticia.description}
              </p>
            )}
          </div>
        </section>

        {/* Contenido */}
        <article className="py-12 px-4">
          <div className="container mx-auto max-w-4xl bg-white rounded-lg shadow-lg p-8 md:p-12">
            <MDXRenderer content={noticia.content} />
          </div>
        </article>

        {/* Navegación */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <Link
              href="/noticias"
              className="inline-block bg-azul-primario text-white px-6 py-3 rounded-lg hover:bg-azul-oscuro transition-colors font-semibold"
            >
              ← Volver a todas las noticias
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
