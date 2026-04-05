'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Calendar } from 'lucide-react'
import type { Album } from '@/lib/gallery'

interface GaleriaClientProps {
  albums: Album[]
  categorias: string[]
}

const CATEGORIA_COLORS: Record<string, string> = {
  partidos: 'bg-blue-500',
  entrenamientos: 'bg-green-600',
  eventos: 'bg-orange-500',
  historia: 'bg-purple-600',
}

const CATEGORIA_LABELS: Record<string, string> = {
  todas: 'Todas',
  partidos: 'Partidos',
  entrenamientos: 'Entrenamientos',
  eventos: 'Eventos',
  historia: 'Historia',
}

function getCategoriaColor(categoria: string) {
  return CATEGORIA_COLORS[categoria] ?? 'bg-gray-500'
}

function getCategoriaLabel(categoria: string) {
  return CATEGORIA_LABELS[categoria] ?? categoria
}

function formatFecha(date: string) {
  return new Date(date).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function GaleriaClient({ albums, categorias }: GaleriaClientProps) {
  const [categoriaActiva, setCategoriaActiva] = useState('todas')

  const albumesFiltrados = categoriaActiva === 'todas'
    ? albums
    : albums.filter((album) => album.categoria === categoriaActiva)

  return (
    <>
      {/* Filtros — continúan el fondo azul del hero */}
      <div className="bg-azul-primario pb-10 px-4">
        <div className="container mx-auto max-w-6xl flex flex-wrap gap-2 justify-center">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                categoriaActiva === cat
                  ? 'bg-white text-azul-primario shadow'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {getCategoriaLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de álbumes */}
      <section className="py-10 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          {albumesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-16 h-16 rounded-full bg-azul-primario/10 flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-azul-primario/40" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">Sin álbumes en esta categoría</p>
              <p className="text-gray-400 text-sm mt-1">Pronto subiremos nuevas fotos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albumesFiltrados.map((album) => (
                <Link
                  key={album.slug}
                  href={`/galeria/${album.categoria}/${album.slug}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    {/* Imagen de portada */}
                    <div className="h-56 relative bg-gray-200">
                      <Image
                        src={album.coverUrl}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* Overlay suave en hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                      <div className="absolute top-3 left-3">
                        <Badge className={`${getCategoriaColor(album.categoria)} text-white text-xs`}>
                          {getCategoriaLabel(album.categoria)}
                        </Badge>
                      </div>

                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-white" />
                        <span className="text-white text-xs font-medium">{album.fotos.length} fotos</span>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <h3 className="font-bold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-azul-primario transition-colors">
                        {album.title}
                      </h3>
                      {album.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                          {album.description}
                        </p>
                      )}
                      {album.date && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatFecha(album.date)}
                        </div>
                      )}
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
