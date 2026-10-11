/**
 * Tipos de las tablas de contenido (database/migrations/001_admin_contenido.sql)
 */

import type { TipoEvento, TipoPartido } from '@/lib/types/calendario'

export interface Actividad {
  id: string
  tipo: TipoEvento
  fecha: string // YYYY-MM-DD
  hora_inicio: string | null // HH:MM:SS
  hora_fin: string | null
  rival: string | null
  tipo_partido: TipoPartido | null
  actividad: string | null
  titulo: string | null
  descripcion: string | null
  estadio: string
  confirmado: boolean
  llevar: string | null
  precio_entrada: string | null
  edad_gratis: string | null
  series: string[]
  publicado: boolean
  legacy_id: string | null
  created_at: string
  updated_at: string
}

export type ActividadInput = Omit<Actividad, 'id' | 'legacy_id' | 'created_at' | 'updated_at'>

export interface NoticiaDB {
  id: string
  slug: string
  titulo: string
  bajada: string
  contenido: string
  categoria: string
  tags: string[]
  autor: string | null
  fecha: string
  portada_url: string | null
  publicado: boolean
  created_at: string
  updated_at: string
}

export type NoticiaInput = Omit<NoticiaDB, 'id' | 'created_at' | 'updated_at'>

export type CategoriaAlbum = 'partidos' | 'entrenamientos' | 'eventos' | 'historia'

export interface AlbumDB {
  id: string
  slug: string
  titulo: string
  descripcion: string
  categoria: CategoriaAlbum
  fecha: string
  tags: string[]
  portada_url: string | null
  publicado: boolean
  created_at: string
  updated_at: string
}

export type AlbumInput = Omit<AlbumDB, 'id' | 'portada_url' | 'created_at' | 'updated_at'>

export interface Foto {
  id: string
  album_id: string
  path: string
  url: string
  descripcion: string | null
  orden: number
  ancho: number | null
  alto: number | null
  created_at: string
}

export interface Medio {
  id: string
  path: string
  url: string
  nombre: string
  mime: string | null
  bytes: number | null
  ancho: number | null
  alto: number | null
  created_at: string
}

/** Columnas de categorias que describen una serie en el sitio */
export interface SerieInfo {
  id: number
  nombre: string
  slug: string | null
  titulo: string | null
  descripcion: string | null
  contenido: string | null
  imagen_url: string | null
  horario_entrenamiento: string | null
  lugar_entrenamiento: string | null
  competencia: string | null
}

export const CATEGORIAS_ALBUM: { value: CategoriaAlbum; label: string }[] = [
  { value: 'partidos', label: 'Partidos' },
  { value: 'entrenamientos', label: 'Entrenamientos' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'historia', label: 'Historia' },
]

export const CATEGORIAS_NOTICIA = ['Institucional', 'Partidos', 'Jugadores', 'Torneos', 'Entrenamientos']

export const TIPOS_PARTIDO: TipoPartido[] = ['Amistoso', 'Oficial', 'Torneo', 'Copa']

export const BUCKET_MEDIOS = 'medios'
