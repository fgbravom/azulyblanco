/**
 * Lecturas del sitio público.
 *
 * El contenido vive en Supabase y se edita desde /admin. Si la base no
 * responde (sin variables de entorno, o migración 001 aún no aplicada) se
 * usa el contenido antiguo de los archivos del repositorio, para que el
 * sitio nunca quede vacío durante la transición.
 */

import type { EventoCalendario } from '@/lib/types/calendario'
import { eventosDiciembrePasados, eventosEnero2026 } from '@/lib/data/eventos-enero'
import {
  getAllNoticias as getNoticiasArchivo,
  getNoticiaBySlug as getNoticiaArchivo,
  type Noticia,
  type NoticiaMetadata,
} from '@/lib/news'
import {
  getAllAlbums as getAlbumesArchivo,
  getAlbumBySlug as getAlbumArchivo,
  type Album,
} from '@/lib/gallery'
import { createPublicClient } from '@/lib/supabase/public'
import { codigoPais, PAISES, type CodigoPais } from '@/lib/jugadores/paises'
import { HERO_FOTOS_REPO, type HeroFotos } from '@/components/hero/hero-boot'
import { actividadAEvento } from './calendario'
import type { Actividad, AlbumDB, Foto, HeroFoto, NoticiaDB, Rival, SerieInfo } from './tipos'

export type NoticiaPublica = NoticiaMetadata & { coverUrl?: string }
export type NoticiaCompleta = Noticia & { coverUrl?: string; authorAvatar?: string }
export type AlbumPublico = Album & { fotoUrls: string[] }

class SinBaseDeDatos extends Error {}

async function conRespaldo<T>(leer: () => Promise<T>, respaldo: () => T): Promise<T> {
  try {
    return await leer()
  } catch (error) {
    if (!(error instanceof SinBaseDeDatos)) {
      console.warn('[contenido] usando archivos del repositorio:', error instanceof Error ? error.message : error)
    }
    return respaldo()
  }
}

function cliente() {
  const supabase = createPublicClient()
  if (!supabase) throw new SinBaseDeDatos()
  return supabase
}

// ============================================================================
// PROGRAMACIÓN
// ============================================================================

/** Catálogo de rivales. Si la migración 010 aún no se aplica, los partidos se muestran sin logo. */
async function getRivales(): Promise<Rival[]> {
  try {
    const { data, error } = await cliente().from('rivales').select('*')
    if (error) throw error
    return data as Rival[]
  } catch {
    return []
  }
}

export async function getEventosCalendario(): Promise<EventoCalendario[]> {
  return conRespaldo(
    async () => {
      const supabase = cliente()
      const [{ data, error }, rivales] = await Promise.all([
        supabase
          .from('programacion')
          .select('*')
          .order('fecha', { ascending: true })
          .order('hora_inicio', { ascending: true, nullsFirst: true }),
        getRivales(),
      ])
      if (error) throw error
      const porId = new Map(rivales.map((r) => [r.id, r]))
      return (data as Actividad[]).map((a) => actividadAEvento(a, a.rival_id ? porId.get(a.rival_id) : undefined))
    },
    () => [...eventosDiciembrePasados, ...eventosEnero2026]
  )
}

// ============================================================================
// NOTICIAS
// ============================================================================

function noticiaAMetadata(n: NoticiaDB): NoticiaPublica {
  return {
    slug: n.slug,
    title: n.titulo,
    description: n.bajada,
    tags: n.tags.join(', '),
    date: n.fecha,
    categoria: n.categoria,
    author: n.autor ?? undefined,
    coverUrl: n.portada_url ?? undefined,
  }
}

/** Avatar del redactor. Si la migración 011 aún no se aplica, la noticia se muestra con iniciales. */
async function getAvatarRedactor(id: string): Promise<string | undefined> {
  try {
    const { data, error } = await cliente().from('redactores').select('avatar_url').eq('id', id).maybeSingle()
    if (error) throw error
    return data?.avatar_url ?? undefined
  } catch {
    return undefined
  }
}

export async function getNoticiasPublicas(): Promise<NoticiaPublica[]> {
  return conRespaldo(
    async () => {
      const { data, error } = await cliente()
        .from('noticias')
        .select('id, slug, titulo, bajada, categoria, tags, autor, fecha, portada_url, publicado, created_at, updated_at')
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data as NoticiaDB[]).map(noticiaAMetadata)
    },
    getNoticiasArchivo
  )
}

export async function getNoticiaPublica(slug: string): Promise<NoticiaCompleta | null> {
  return conRespaldo(
    async () => {
      const { data, error } = await cliente()
        .from('noticias')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      const noticia = data as NoticiaDB
      return {
        ...noticiaAMetadata(noticia),
        content: noticia.contenido,
        authorAvatar: noticia.redactor_id ? await getAvatarRedactor(noticia.redactor_id) : undefined,
      }
    },
    () => getNoticiaArchivo(slug)
  )
}

export function getCategoriasNoticias(noticias: NoticiaMetadata[]): string[] {
  const categorias = new Set(noticias.map((n) => n.categoria))
  return ['Todas', ...Array.from(categorias).sort()]
}

// ============================================================================
// GALERÍA
// ============================================================================

function albumAPublico(album: AlbumDB, fotos: Foto[]): AlbumPublico {
  const ordenadas = [...fotos].sort((a, b) => a.orden - b.orden)
  const nombre = (url: string) => url.split('/').pop() ?? url

  return {
    slug: album.slug,
    title: album.titulo,
    description: album.descripcion,
    date: album.fecha,
    categoria: album.categoria,
    tags: album.tags,
    cover: album.portada_url ? nombre(album.portada_url) : '',
    coverUrl: album.portada_url ?? ordenadas[0]?.url ?? '',
    fotos: ordenadas.map((f) => nombre(f.url)),
    fotoUrls: ordenadas.map((f) => f.url),
    photoDescriptions: ordenadas
      .filter((f) => f.descripcion)
      .map((f) => ({ filename: nombre(f.url), description: f.descripcion! })),
  }
}

function albumArchivoAPublico(album: Album): AlbumPublico {
  return {
    ...album,
    fotoUrls: album.fotos.map((foto) => `/galeria/${album.categoria}/${album.slug}/${foto}`),
  }
}

export async function getAlbumesPublicos(): Promise<AlbumPublico[]> {
  return conRespaldo(
    async () => {
      const { data, error } = await cliente()
        .from('albumes')
        .select('*, fotos(*)')
        .order('fecha', { ascending: false })
      if (error) throw error
      return (data as (AlbumDB & { fotos: Foto[] })[]).map((a) => albumAPublico(a, a.fotos))
    },
    () => getAlbumesArchivo().map(albumArchivoAPublico)
  )
}

export async function getAlbumPublico(categoria: string, slug: string): Promise<AlbumPublico | null> {
  return conRespaldo(
    async () => {
      const { data, error } = await cliente()
        .from('albumes')
        .select('*, fotos(*)')
        .eq('slug', slug)
        .eq('categoria', categoria)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      const album = data as AlbumDB & { fotos: Foto[] }
      return albumAPublico(album, album.fotos)
    },
    () => {
      const album = getAlbumArchivo(categoria, slug)
      return album ? albumArchivoAPublico(album) : null
    }
  )
}

// ============================================================================
// SERIES
// ============================================================================

export async function getSerieInfo(slug: string): Promise<SerieInfo | null> {
  return conRespaldo(
    async () => {
      const { data, error } = await cliente()
        .from('categorias')
        .select('id, nombre, slug, titulo, descripcion, contenido, imagen_url, horario_entrenamiento, lugar_entrenamiento, competencia')
        .eq('slug', slug)
        .maybeSingle()
      if (error) throw error
      return data as SerieInfo | null
    },
    () => null
  )
}

// ============================================================================
// PLANTEL
// ============================================================================

/** Columnas de vista_plantel_publico: solo lo que se muestra en la web (migraciones 003 y 008) */
export interface PlantelJugador {
  id: number
  nombre: string
  apellidos: string
  nombre_completo: string
  foto_url: string | null
  dorsal: number | null
  estado: string
  posicion: string | null
  posicion_abr: string | null
  posiciones: string[]
  posiciones_abr: string[]
  nacionalidad: string | null
}

/** Jugadores activos de un equipo. Sin respaldo: si falla, la serie muestra el plantel vacío. */
export async function getPlantelPublico(equipoId: number): Promise<PlantelJugador[]> {
  const supabase = createPublicClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('vista_plantel_publico')
    .select('id, nombre, apellidos, nombre_completo, foto_url, dorsal, estado, posicion, posicion_abr, posiciones, posiciones_abr, nacionalidad')
    .eq('equipo_id', equipoId)
    .eq('activo', true)
    .order('dorsal', { ascending: true, nullsFirst: false })
  if (error) {
    console.warn('[contenido] no se pudo leer el plantel:', error.message)
    return []
  }
  return data as PlantelJugador[]
}

/** Nacionalidades presentes en el plantel activo, sin repetir, en el orden de PAISES. Sin respaldo: si falla, el home no muestra la sección. */
export async function getNacionalidadesPlantel(): Promise<CodigoPais[]> {
  const supabase = createPublicClient()
  if (!supabase) return []

  const { data, error } = await supabase.from('vista_plantel_publico').select('nacionalidad')
  if (error) {
    console.warn('[contenido] no se pudieron leer las nacionalidades del plantel:', error.message)
    return []
  }
  const presentes = new Set<CodigoPais>()
  for (const fila of data as { nacionalidad: string | null }[]) {
    const codigo = codigoPais(fila.nacionalidad)
    if (codigo) presentes.add(codigo)
  }
  return (Object.keys(PAISES) as CodigoPais[]).filter((codigo) => presentes.has(codigo))
}

// ============================================================================
// HERO
// ============================================================================

/** Fotos activas de la portada, en orden. Un dispositivo sin fotos usa las del repositorio. */
export async function getFotosHero(): Promise<HeroFotos> {
  return conRespaldo(
    async () => {
      const { data, error } = await cliente()
        .from('hero_fotos')
        .select('dispositivo, base_url')
        .order('orden')
        .order('created_at')
      if (error) throw error
      const fotos = data as Pick<HeroFoto, 'dispositivo' | 'base_url'>[]
      const de = (d: HeroFoto['dispositivo']) => fotos.filter((f) => f.dispositivo === d).map((f) => f.base_url)
      return {
        desktop: de('desktop').length ? de('desktop') : HERO_FOTOS_REPO.desktop,
        mobile: de('mobile').length ? de('mobile') : HERO_FOTOS_REPO.mobile,
      }
    },
    () => HERO_FOTOS_REPO
  )
}
