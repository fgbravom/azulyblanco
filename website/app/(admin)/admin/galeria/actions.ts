'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidarSitio } from '@/lib/admin/revalidar'
import { slugify } from '@/lib/admin/slug'
import { BUCKET_MEDIOS, type AlbumDB, type AlbumInput, type Foto } from '@/lib/contenido/tipos'

export type AlbumConConteo = AlbumDB & { total_fotos: number }

const albumSchema = z.object({
  slug: z.string().trim(),
  titulo: z.string().trim().min(1, 'El título es obligatorio'),
  descripcion: z.string().trim(),
  categoria: z.enum(['partidos', 'entrenamientos', 'eventos', 'historia']),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  tags: z.array(z.string()),
  publicado: z.boolean(),
})

function cambios(albumId?: string) {
  revalidatePath('/admin/galeria')
  revalidatePath('/admin')
  if (albumId) revalidatePath(`/admin/galeria/${albumId}`)
  revalidarSitio('galeria')
}

export async function listarAlbumes(): Promise<AlbumConConteo[]> {
  await requireAdmin()
  const { data, error } = await createAdminClient()
    .from('albumes')
    .select('*, fotos(count)')
    .order('fecha', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as (AlbumDB & { fotos: { count: number }[] })[]).map(({ fotos, ...a }) => ({
    ...a,
    total_fotos: fotos[0]?.count ?? 0,
  }))
}

export async function obtenerAlbum(id: string): Promise<{ album: AlbumDB; fotos: Foto[] } | null> {
  await requireAdmin()
  const supabase = createAdminClient()
  const [{ data: album, error }, { data: fotos, error: errorFotos }] = await Promise.all([
    supabase.from('albumes').select('*').eq('id', id).maybeSingle(),
    supabase.from('fotos').select('*').eq('album_id', id).order('orden').order('created_at'),
  ])
  if (error || errorFotos) throw new Error((error ?? errorFotos)!.message)
  if (!album) return null
  return { album: album as AlbumDB, fotos: (fotos ?? []) as Foto[] }
}

export async function guardarAlbum(id: string | null, input: AlbumInput): Promise<AlbumDB> {
  await requireAdmin()

  const parsed = albumSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const fila = { ...parsed.data, slug: slugify(parsed.data.slug || parsed.data.titulo) }
  if (!fila.slug) throw new Error('La dirección (slug) no puede quedar vacía')

  const supabase = createAdminClient()
  const consulta = id
    ? supabase.from('albumes').update(fila).eq('id', id)
    : supabase.from('albumes').insert(fila)
  const { data, error } = await consulta.select().single()
  if (error) {
    if (error.code === '23505') throw new Error(`Ya existe un álbum con la dirección "${fila.slug}"`)
    throw new Error(error.message)
  }

  cambios(data.id)
  return data as AlbumDB
}

export async function eliminarAlbum(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: fotos } = await supabase.from('fotos').select('path').eq('album_id', id)
  const paths = (fotos ?? []).map((f) => f.path)
  // El bucket acepta hasta 1000 rutas por llamada
  for (let i = 0; i < paths.length; i += 1000) {
    await supabase.storage.from(BUCKET_MEDIOS).remove(paths.slice(i, i + 1000))
  }

  const { error } = await supabase.from('albumes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  cambios()
}

export async function agregarFotos(
  albumId: string,
  subidas: { path: string; ancho: number; alto: number }[]
): Promise<Foto[]> {
  await requireAdmin()
  if (subidas.some((s) => !s.path.startsWith(`galeria/${albumId}/`))) throw new Error('Ruta inválida')

  const supabase = createAdminClient()
  const { data: ultima } = await supabase
    .from('fotos')
    .select('orden')
    .eq('album_id', albumId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  const base = (ultima?.orden ?? -1) + 1

  const filas = subidas.map((s, i) => ({
    album_id: albumId,
    path: s.path,
    url: supabase.storage.from(BUCKET_MEDIOS).getPublicUrl(s.path).data.publicUrl,
    ancho: s.ancho,
    alto: s.alto,
    orden: base + i,
  }))

  const { data, error } = await supabase.from('fotos').insert(filas).select()
  if (error) throw new Error(error.message)

  // La primera foto del álbum queda como portada
  await supabase.from('albumes').update({ portada_url: filas[0].url }).eq('id', albumId).is('portada_url', null)

  cambios(albumId)
  return (data as Foto[]).sort((a, b) => a.orden - b.orden)
}

export async function actualizarDescripcionFoto(id: string, descripcion: string) {
  await requireAdmin()
  const { data, error } = await createAdminClient()
    .from('fotos')
    .update({ descripcion: descripcion.trim() || null })
    .eq('id', id)
    .select('album_id')
    .single()
  if (error) throw new Error(error.message)
  cambios(data.album_id)
}

export async function definirPortada(albumId: string, url: string) {
  await requireAdmin()
  const { error } = await createAdminClient().from('albumes').update({ portada_url: url }).eq('id', albumId)
  if (error) throw new Error(error.message)
  cambios(albumId)
}

export async function reordenarFotos(albumId: string, ids: string[]) {
  await requireAdmin()
  const supabase = createAdminClient()
  const resultados = await Promise.all(
    ids.map((id, orden) => supabase.from('fotos').update({ orden }).eq('id', id).eq('album_id', albumId))
  )
  const fallo = resultados.find((r) => r.error)
  if (fallo?.error) throw new Error(fallo.error.message)
  cambios(albumId)
}

/** Elimina fotos y, si una era la portada, pasa la portada a la primera que quede */
export async function eliminarFotos(albumId: string, ids: string[]): Promise<string | null> {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: fotos, error } = await supabase.from('fotos').select('id, path, url').eq('album_id', albumId).in('id', ids)
  if (error) throw new Error(error.message)
  if (!fotos?.length) return null

  await supabase.storage.from(BUCKET_MEDIOS).remove(fotos.map((f) => f.path))
  const { error: errorBorrado } = await supabase.from('fotos').delete().in('id', fotos.map((f) => f.id))
  if (errorBorrado) throw new Error(errorBorrado.message)

  const { data: album } = await supabase.from('albumes').select('portada_url').eq('id', albumId).single()
  let portada: string | null = album?.portada_url ?? null
  if (portada && fotos.some((f) => f.url === portada)) {
    const { data: siguiente } = await supabase
      .from('fotos')
      .select('url')
      .eq('album_id', albumId)
      .order('orden')
      .limit(1)
      .maybeSingle()
    portada = siguiente?.url ?? null
    await supabase.from('albumes').update({ portada_url: portada }).eq('id', albumId)
  }

  cambios(albumId)
  return portada
}
