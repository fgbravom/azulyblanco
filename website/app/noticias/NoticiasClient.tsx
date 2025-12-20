'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { NoticiaMetadata } from '@/lib/news'

interface NoticiasClientProps {
  noticias: NoticiaMetadata[]
  categorias: string[]
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

export function NoticiasClient({ noticias, categorias }: NoticiasClientProps) {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')

  const noticiasFiltradas = categoriaActiva === 'Todas'
    ? noticias
    : noticias.filter(n => n.categoria === categoriaActiva)

  return (
    <>
      {/* Filtros */}
      <section className="py-8 px-4 bg-gray-50 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-3">
            {categorias.map((cat) => (
              <Badge
                key={cat}
                variant={categoriaActiva === cat ? 'default' : 'outline'}
                className={`cursor-pointer ${
                  categoriaActiva === cat
                    ? 'bg-azul-primario'
                    : 'hover:bg-azul-primario hover:text-white'
                }`}
                onClick={() => setCategoriaActiva(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Lista de Noticias */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {noticiasFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No hay noticias en esta categoría.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {noticiasFiltradas.map((noticia) => (
                <Link key={noticia.slug} href={`/noticias/${noticia.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                    {/* Imagen placeholder */}
                    <div className="h-48 bg-gradient-to-br from-azul-claro to-azul-primario flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="text-5xl mb-2">📰</div>
                        <p className="text-sm opacity-75">Imagen de la noticia</p>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={getCategoryColor(noticia.categoria)}>
                          {noticia.categoria}
                        </Badge>
                        {noticia.date && (
                          <span className="text-xs text-gray-500">
                            {new Date(noticia.date).toLocaleDateString('es-CL', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2 hover:text-azul-primario transition-colors">
                        {noticia.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {noticia.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
