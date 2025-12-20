import { getPostBySlug, getAllPostSlugs } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Tag, ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import { MDXRenderer } from '@/components/mdx/MDXRenderer'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Nota no encontrada',
    }
  }

  return {
    title: `${post.title} | Azul y Blanco`,
    description: post.description,
  }
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

export default async function NotaPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <article className="container mx-auto px-4">
        {/* Navegación */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link
            href="/notas"
            className="inline-flex items-center gap-2 text-azul-primario hover:text-azul-oscuro transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Notas
          </Link>
        </div>

        {/* Header del artículo */}
        <header className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Metadata */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
              {post.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('es-CL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              )}
              {post.tags && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>{post.tags}</span>
                </div>
              )}
            </div>

            {/* Título */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Descripción */}
            {post.description && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {post.description}
              </p>
            )}
          </div>
        </header>

        {/* Contenido Markdown */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <MDXRenderer content={post.content} />
          </div>
        </div>

        {/* Footer - Volver */}
        <div className="max-w-4xl mx-auto mt-12">
          <Link
            href="/notas"
            className="inline-flex items-center gap-2 text-azul-primario hover:text-azul-oscuro transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Notas
          </Link>
        </div>
      </article>
    </div>
  )
}
