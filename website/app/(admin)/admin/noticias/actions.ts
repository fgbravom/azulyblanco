'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidarSitio } from '@/lib/admin/revalidar'
import { slugify } from '@/lib/admin/slug'
import type { NoticiaDB, NoticiaInput } from '@/lib/contenido/tipos'

const noticiaSchema = z.object({
  slug: z.string().trim(),
  titulo: z.string().trim().min(1, 'El título es obligatorio'),
  bajada: z.string().trim(),
  contenido: z.string(),
  categoria: z.string().trim().min(1, 'Elige una categoría'),
  tags: z.array(z.string()),
  autor: z.string().trim().nullable().transform((v) => v || null),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  portada_url: z.string().url().nullable(),
  publicado: z.boolean(),
})

function cambios(slug?: string) {
  revalidatePath('/admin/noticias')
  revalidatePath('/admin')
  revalidarSitio('noticias')
  if (slug) revalidatePath(`/noticias/${slug}`)
}

export async function listarNoticias(): Promise<NoticiaDB[]> {
  await requireAdmin()
  const { data, error } = await createAdminClient()
    .from('noticias')
    .select('id, slug, titulo, bajada, categoria, tags, autor, fecha, portada_url, publicado, created_at, updated_at')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Omit<NoticiaDB, 'contenido'>[]).map((n) => ({ ...n, contenido: '' }))
}

export async function obtenerNoticia(id: string): Promise<NoticiaDB | null> {
  await requireAdmin()
  const { data, error } = await createAdminClient().from('noticias').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data as NoticiaDB | null
}

export async function guardarNoticia(id: string | null, input: NoticiaInput): Promise<NoticiaDB> {
  await requireAdmin()

  const parsed = noticiaSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const supabase = createAdminClient()

  // Si cambia el slug, la URL antigua también debe regenerarse
  let slugAnterior: string | undefined
  if (id) {
    const { data } = await supabase.from('noticias').select('slug').eq('id', id).maybeSingle()
    slugAnterior = data?.slug
  }

  // Un slug sin cambios se respeta tal cual: las noticias importadas pueden
  // tener mayúsculas y sus enlaces ya están compartidos
  const slug = parsed.data.slug === slugAnterior ? slugAnterior : slugify(parsed.data.slug || parsed.data.titulo)
  const fila = { ...parsed.data, slug }
  if (!fila.slug) throw new Error('La dirección (slug) no puede quedar vacía')

  const consulta = id
    ? supabase.from('noticias').update(fila).eq('id', id)
    : supabase.from('noticias').insert(fila)
  const { data, error } = await consulta.select().single()

  if (error) {
    if (error.code === '23505') throw new Error(`Ya existe una noticia con la dirección "${fila.slug}"`)
    throw new Error(error.message)
  }

  cambios(fila.slug)
  if (slugAnterior && slugAnterior !== fila.slug) revalidatePath(`/noticias/${slugAnterior}`)
  return data as NoticiaDB
}

export async function cambiarPublicacionNoticia(id: string, publicado: boolean) {
  await requireAdmin()
  const { data, error } = await createAdminClient()
    .from('noticias')
    .update({ publicado })
    .eq('id', id)
    .select('slug')
    .single()
  if (error) throw new Error(error.message)
  cambios(data.slug)
}

export async function eliminarNoticia(id: string) {
  await requireAdmin()
  const { data, error } = await createAdminClient().from('noticias').delete().eq('id', id).select('slug').single()
  if (error) throw new Error(error.message)
  cambios(data.slug)
}
