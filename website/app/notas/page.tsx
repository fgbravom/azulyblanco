import { getAllPosts } from '@/lib/blog'
import Link from 'next/link'
import { Calendar, Tag } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notas | Azul y Blanco',
  description: 'Notas, cartas e información del Club Azul y Blanco Curicó',
}

export default function NotasPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Notas del Club
          </h1>
          <p className="text-lg text-gray-600">
            Historias, cartas e información sobre Azul y Blanco Curicó
          </p>
        </div>

        {/* Posts Grid */}
        <div className="max-w-5xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No hay notas publicadas aún.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/notas/${post.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Fecha */}
                    {post.date && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
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

                    {/* Título */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-azul-primario transition-colors">
                      {post.title}
                    </h2>

                    {/* Descripción */}
                    {post.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.description}
                      </p>
                    )}

                    {/* Tags */}
                    {post.tags && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Tag className="w-4 h-4" />
                        <span className="line-clamp-1">{post.tags}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <span className="text-azul-primario font-medium text-sm group-hover:underline">
                      Leer más →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
