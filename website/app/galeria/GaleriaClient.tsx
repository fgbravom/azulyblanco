'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Album } from '@/lib/gallery'

interface GaleriaClientProps {
  albums: Album[]
  categorias: string[]
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
    'todas': 'Todas',
    'partidos': 'Partidos',
    'entrenamientos': 'Entrenamientos',
    'eventos': 'Eventos',
    'historia': 'Historia',
  }
  return labels[categoria] || categoria
}

export function GaleriaClient({ albums, categorias }: GaleriaClientProps) {
  const [categoriaActiva, setCategoriaActiva] = useState('todas')

  const albumesFiltrados = categoriaActiva === 'todas'
    ? albums
    : albums.filter(album => album.categoria === categoriaActiva)

  return (
    <>
      {/* Filtros */}
      <section className="py-8 px-4 bg-gray-50 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-semibold text-gray-700">Filtrar por:</span>
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
                {getCategoriaLabel(cat)}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Álbumes */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {albumesFiltrados.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No hay álbumes en esta categoría todavía.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                ¡Pronto subiremos nuevas fotos!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albumesFiltrados.map((album) => (
                <Link
                  key={album.slug}
                  href={`/galeria/${album.categoria}/${album.slug}`}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden h-full">
                    {/* Imagen de portada */}
                    <div className="h-64 relative bg-gray-200">
                      <Image
                        src={album.coverUrl}
                        alt={album.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className={`${getCategoriaColor(album.categoria)} text-white`}>
                          {getCategoriaLabel(album.categoria)}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-white text-sm font-semibold">
                          📸 {album.fotos.length} fotos
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 hover:text-azul-primario transition-colors line-clamp-2">
                        {album.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {album.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          📅 {new Date(album.date).toLocaleDateString('es-CL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="font-semibold text-azul-primario">
                          Ver álbum →
                        </span>
                      </div>
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
