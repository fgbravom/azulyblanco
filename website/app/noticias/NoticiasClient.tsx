'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Newspaper, ArrowRight } from 'lucide-react'
import type { NoticiaMetadata } from '@/lib/news'

interface NoticiasClientProps {
  noticias: NoticiaMetadata[]
  categorias: string[]
}

const CATEGORY_COLORS: Record<string, string> = {
  Partidos: 'bg-blue-500',
  Jugadores: 'bg-green-600',
  Torneos: 'bg-purple-600',
  Institucional: 'bg-orange-500',
  Entrenamientos: 'bg-teal-600',
}

const CATEGORY_BG: Record<string, string> = {
  Partidos: 'from-blue-900 to-blue-600',
  Jugadores: 'from-green-900 to-green-600',
  Torneos: 'from-purple-900 to-purple-600',
  Institucional: 'from-orange-900 to-orange-600',
  Entrenamientos: 'from-teal-900 to-teal-600',
}

function getCategoryColor(categoria: string) {
  return CATEGORY_COLORS[categoria] ?? 'bg-gray-500'
}

function getCategoryBg(categoria: string) {
  return CATEGORY_BG[categoria] ?? 'from-[#002D6B] to-[#0047AB]'
}

function formatFecha(date: string) {
  return new Date(date).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function NoticiaCard({ noticia }: { noticia: NoticiaMetadata }) {
  return (
    <Link href={`/noticias/${noticia.slug}`} className="group">
      <Card className="h-full overflow-hidden border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className={`h-44 bg-gradient-to-br ${getCategoryBg(noticia.categoria)} flex items-center justify-center`}>
          <Newspaper className="w-10 h-10 text-white/25" />
        </div>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge className={`${getCategoryColor(noticia.categoria)} text-white text-xs`}>
              {noticia.categoria}
            </Badge>
            {noticia.date && (
              <span className="text-xs text-gray-400">{formatFecha(noticia.date)}</span>
            )}
          </div>
          <h2 className="font-bold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-azul-primario transition-colors">
            {noticia.title}
          </h2>
          <p className="text-sm text-gray-500 line-clamp-3">{noticia.description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

function NoticiaDestacada({ noticia }: { noticia: NoticiaMetadata }) {
  return (
    <Link href={`/noticias/${noticia.slug}`} className="group block mb-8">
      <Card className="overflow-hidden border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="md:flex">
          {/* Imagen grande */}
          <div className={`md:w-1/2 h-56 md:h-auto bg-gradient-to-br ${getCategoryBg(noticia.categoria)} flex items-center justify-center min-h-[220px]`}>
            <Newspaper className="w-16 h-16 text-white/20" />
          </div>
          {/* Contenido */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`${getCategoryColor(noticia.categoria)} text-white`}>
                {noticia.categoria}
              </Badge>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Destacado</span>
            </div>
            {noticia.date && (
              <p className="text-sm text-gray-400 mb-2">{formatFecha(noticia.date)}</p>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-3 group-hover:text-azul-primario transition-colors">
              {noticia.title}
            </h2>
            <p className="text-gray-500 line-clamp-3 mb-6">{noticia.description}</p>
            <div className="flex items-center gap-2 text-azul-primario font-medium text-sm">
              Leer más <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function NoticiasClient({ noticias, categorias }: NoticiasClientProps) {
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')

  const noticiasFiltradas = categoriaActiva === 'Todas'
    ? noticias
    : noticias.filter((n) => n.categoria === categoriaActiva)

  const [destacada, ...resto] = noticiasFiltradas

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
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Noticias */}
      <section className="py-10 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          {noticiasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-16 h-16 rounded-full bg-azul-primario/10 flex items-center justify-center mb-4">
                <Newspaper className="w-8 h-8 text-azul-primario/40" />
              </div>
              <p className="text-gray-600 text-lg font-semibold">Sin noticias en esta categoría</p>
              <p className="text-gray-400 text-sm mt-1">Volvé a revisar pronto</p>
            </div>
          ) : (
            <>
              {/* Primera noticia siempre destacada */}
              <NoticiaDestacada noticia={destacada} />

              {/* Resto en grid de 3 */}
              {resto.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resto.map((noticia) => (
                    <NoticiaCard key={noticia.slug} noticia={noticia} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
