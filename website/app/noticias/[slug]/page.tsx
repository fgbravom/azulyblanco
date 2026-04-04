import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getNoticiaBySlug, getAllNoticiaSlugs } from '@/lib/news'
import { MDXRenderer } from '@/components/mdx/MDXRenderer'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllNoticiaSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const noticia = getNoticiaBySlug(slug)
  if (!noticia) return { title: 'Noticia no encontrada' }
  return { title: noticia.title, description: noticia.description }
}

const CATEGORY_COLORS: Record<string, string> = {
  Partidos: 'bg-blue-500',
  Jugadores: 'bg-green-600',
  Torneos: 'bg-purple-600',
  Institucional: 'bg-orange-500',
  Entrenamientos: 'bg-teal-600',
}

function getCategoryColor(categoria: string) {
  return CATEGORY_COLORS[categoria] ?? 'bg-gray-500'
}

export default async function NoticiaPage({ params }: PageProps) {
  const { slug } = await params
  const noticia = getNoticiaBySlug(slug)

  if (!noticia) notFound()

  const fechaFormateada = noticia.date
    ? new Date(noticia.date).toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero compacto */}
        <section className="bg-azul-primario text-white pt-20 pb-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <Link
              href="/noticias"
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white mb-8 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a Noticias
            </Link>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge className={`${getCategoryColor(noticia.categoria)} text-white text-xs`}>
                {noticia.categoria}
              </Badge>
              {fechaFormateada && (
                <span className="text-white/60 text-sm">{fechaFormateada}</span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {noticia.title}
            </h1>

            {noticia.description && (
              <p className="text-white/75 text-base leading-relaxed">
                {noticia.description}
              </p>
            )}

            {noticia.author && (
              <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/15">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`/images/authors/${noticia.author.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                    alt={noticia.author}
                  />
                  <AvatarFallback className="bg-azul-claro text-white text-xs">
                    {noticia.author.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-white/80">{noticia.author}</span>
              </div>
            )}
          </div>
        </section>

        {/* Artículo */}
        <article className="px-4 pb-16">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-10 md:px-12 md:py-14">
              <MDXRenderer content={noticia.content} />
            </div>
          </div>
        </article>

        {/* Volver */}
        <div className="pb-16 px-4 text-center">
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 bg-azul-primario text-white px-6 py-3 rounded-lg hover:bg-azul-oscuro transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a todas las noticias
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
