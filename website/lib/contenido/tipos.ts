/**
 * Tipos de las tablas de contenido (supabase/migrations/20260101000001_admin_contenido.sql)
 */

import type { TipoEvento, TipoPartido } from '@/lib/types/calendario'

export interface Actividad {
  id: string
  tipo: TipoEvento
  fecha: string // YYYY-MM-DD
  hora_inicio: string | null // HH:MM:SS
  hora_fin: string | null
  rival: string | null
  rival_id: string | null // rival del catálogo (tabla rivales)
  tipo_partido: TipoPartido | null
  actividad: string | null
  titulo: string | null
  descripcion: string | null
  estadio: string
  estadio_id: string | null // cancha del catálogo (tabla estadios)
  confirmado: boolean
  llevar: string | null
  precio_entrada: string | null
  edad_gratis: string | null
  series: string[]
  goles_local: number | null // resultado, en el orden del texto del rival (migración 012)
  goles_visitante: number | null
  publicado: boolean
  legacy_id: string | null
  created_at: string
  updated_at: string
}

export type ActividadInput = Omit<Actividad, 'id' | 'legacy_id' | 'created_at' | 'updated_at'>

/** Lado del partido en el orden del texto del rival ("AYB VS SM" → AYB es 'local') */
export type LadoPartido = 'local' | 'visitante'

/** Un gol de AYB (supabase/migrations/20260101000014_goles.sql) */
export interface GolInput {
  lado: LadoPartido
  autor_id: number | null
  asistencia_id: number | null
  en_contra: boolean // autogol del rival: sin autor
}

/** Jugador que se puede elegir como goleador o asistente */
export interface JugadorGoles {
  id: number
  nombre: string
  apellidos: string
  dorsal: number | null
  categoria: string
  activo: boolean
}

/** Equipo rival del catálogo (supabase/migrations/20260101000010_rivales.sql) */
export interface Rival {
  id: string
  nombre: string
  sigla: string
  logo_url: string | null
  sitio_web: string | null
  created_at: string
  updated_at: string
}

export type RivalInput = Omit<Rival, 'id' | 'created_at' | 'updated_at'>

/** Cancha o estadio donde se juega (supabase/migrations/20260101000016_estadios.sql) */
export interface Estadio {
  id: string
  nombre: string
  ubicacion: string | null
  mapa_url: string | null
  created_at: string
  updated_at: string
}

export type EstadioInput = Omit<Estadio, 'id' | 'created_at' | 'updated_at'>

/** Quien escribe las noticias (supabase/migrations/20260101000011_redactores.sql) */
export interface Redactor {
  id: string
  nombre: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/** Última vez que una noticia volvió a borrador: quién, cuándo y por qué */
export interface DespublicacionNoticia {
  motivo: string
  por: string // nombre del redactor, o "Administración"
  fecha: string
}

/** Acceso al panel de un redactor (nunca incluye el hash de la contraseña) */
export interface CuentaRedactor {
  usuario: string
  activa: boolean
  ultimo_ingreso: string | null
  debe_cambiar_password: boolean
}

export interface RedactorConCuenta extends Redactor {
  cuenta: CuentaRedactor | null
}

export interface NoticiaDB {
  id: string
  slug: string
  titulo: string
  bajada: string
  contenido: string
  categoria: string
  tags: string[]
  autor: string | null
  redactor_id: string | null // redactor del catálogo (tabla redactores)
  fecha: string
  portada_url: string | null
  publicado: boolean
  created_at: string
  updated_at: string
  /** Solo lo llena el admin, en noticias no publicadas con una despublicación registrada */
  despublicacion?: DespublicacionNoticia | null
}

export type NoticiaInput = Omit<NoticiaDB, 'id' | 'created_at' | 'updated_at' | 'despublicacion'>

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

export interface HeroFoto {
  id: string
  dispositivo: 'desktop' | 'mobile'
  /** Prefijo: base_url + ancho + '.avif' | '.webp' */
  base_url: string
  /** Carpeta en el bucket; null si la foto vive en public/images/hero */
  carpeta: string | null
  orden: number
  activo: boolean
  ancho_original: number | null
  alto_original: number | null
  created_at: string
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
