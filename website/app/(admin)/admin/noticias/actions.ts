'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin, requireEditorNoticias, type Sesion } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidarSitio } from '@/lib/admin/revalidar'
import { slugify } from '@/lib/admin/slug'
import type { DespublicacionNoticia, NoticiaDB, NoticiaInput } from '@/lib/contenido/tipos'

// 0 a 100 en cada eje: el punto de la foto que se mantiene visible al recortarla
const foco = z
  .number()
  .int('El encuadre de la portada debe ser un número entero')
  .min(0, 'El encuadre de la portada debe estar entre 0 y 100')
  .max(100, 'El encuadre de la portada debe estar entre 0 y 100')

const noticiaSchema = z.object({
  slug: z.string().trim(),
  titulo: z.string().trim().min(1, 'El título es obligatorio'),
  bajada: z.string().trim(),
  contenido: z.string(),
  categoria: z.string().trim().min(1, 'Elige una categoría'),
  tags: z.array(z.string()),
  autor: z.string().trim().nullable().transform((v) => v || null),
  redactor_id: z.string().uuid().nullable(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  portada_url: z.url({ protocol: /^https?$/ }).nullable(),
  // Encuadre de la portada: 0 a 100 en cada eje (ver lib/contenido/foco.ts)
  portada_foco_x: foco,
  portada_foco_y: foco,
  publicado: z.boolean(),
})

const motivoRedactorSchema = z
  .string({ error: 'Escribe el motivo de la despublicación' })
  .trim()
  .min(10, 'El motivo debe tener al menos 10 caracteres')
  .max(500, 'El motivo no puede superar los 500 caracteres')
// El admin puede despublicar sin motivo; si escribe uno, solo se limita el largo
const motivoAdminSchema = z.string().trim().max(500, 'El motivo no puede superar los 500 caracteres')

function cambios(slug?: string) {
  revalidatePath('/admin/noticias')
  revalidatePath('/admin')
  revalidarSitio('noticias')
  if (slug) revalidatePath(`/noticias/${slug}`)
}

type Supabase = ReturnType<typeof createAdminClient>
type FilaPrevia = { slug: string; redactor_id: string | null; publicado: boolean }

// Los helpers de abajo no se exportan: todo export de un actions.ts es una server action

/** Id del redactor si la sesión es de uno; null para el admin */
const idRedactor = (sesion: Sesion) => (sesion.rol === 'colaborador' ? sesion.redactorId : null)

/** Slug, dueño y estado de publicación de la noticia, leídos una sola vez */
async function leerFilaPrevia(supabase: Supabase, id: string): Promise<FilaPrevia | null> {
  const { data, error } = await supabase.from('noticias').select('slug, redactor_id, publicado').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data as FilaPrevia | null
}

/** Un redactor solo toca sus noticias; las ajenas (o inexistentes) se rechazan igual */
function comprobarPropiedad(sesion: Sesion, previa: FilaPrevia | null) {
  if (sesion.rol === 'colaborador' && previa?.redactor_id !== sesion.redactorId) throw new Error('No autorizado')
}

/**
 * Motivo a registrar cuando una noticia publicada pasa a borrador, o null si no
 * corresponde. El redactor debe escribirlo; el admin solo si quiere (vacío si no:
 * igual se registra, para que no quede a la vista un motivo de antes).
 */
function motivoDespublicacion(sesion: Sesion, previa: FilaPrevia | null, publicado: boolean, motivo?: string): string | null {
  if (!previa?.publicado || publicado) return null
  if (sesion.rol === 'colaborador') {
    const parsed = motivoRedactorSchema.safeParse(motivo)
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Motivo inválido')
    return parsed.data
  }
  const parsed = motivoAdminSchema.safeParse(motivo ?? '')
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Motivo inválido')
  return parsed.data
}

async function registrarDespublicacion(supabase: Supabase, noticiaId: string, sesion: Sesion, motivo: string | null) {
  if (motivo === null) return
  const { error } = await supabase
    .from('noticias_despublicaciones')
    .insert({ noticia_id: noticiaId, redactor_id: idRedactor(sesion), motivo })
  if (error) throw new Error(error.message)
}

/** Última despublicación de cada noticia (la ve solo el admin) */
async function ultimasDespublicaciones(supabase: Supabase, ids: string[]): Promise<Map<string, DespublicacionNoticia>> {
  const ultimas = new Map<string, DespublicacionNoticia>()
  if (ids.length === 0) return ultimas
  const { data, error } = await supabase
    .from('noticias_despublicaciones')
    .select('noticia_id, motivo, created_at, redactores(nombre)')
    .in('noticia_id', ids)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  for (const d of (data ?? []) as {
    noticia_id: string
    motivo: string
    created_at: string
    redactores: { nombre: string } | { nombre: string }[] | null
  }[]) {
    if (ultimas.has(d.noticia_id)) continue
    const redactor = Array.isArray(d.redactores) ? d.redactores[0] : d.redactores
    ultimas.set(d.noticia_id, { motivo: d.motivo, por: redactor?.nombre ?? 'Administración', fecha: d.created_at })
  }
  return ultimas
}

export async function listarNoticias(): Promise<NoticiaDB[]> {
  const sesion = await requireEditorNoticias()
  const supabase = createAdminClient()
  const yo = idRedactor(sesion)

  let consulta = supabase
    .from('noticias')
    .select('id, slug, titulo, bajada, categoria, tags, autor, redactor_id, fecha, portada_url, portada_foco_x, portada_foco_y, publicado, created_at, updated_at')
  if (yo) consulta = consulta.eq('redactor_id', yo)
  const { data, error } = await consulta.order('fecha', { ascending: false }).order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  const noticias = (data as Omit<NoticiaDB, 'contenido'>[]).map((n) => ({ ...n, contenido: '' }))
  if (yo) return noticias

  const despublicaciones = await ultimasDespublicaciones(supabase, noticias.filter((n) => !n.publicado).map((n) => n.id))
  return noticias.map((n) => ({ ...n, despublicacion: despublicaciones.get(n.id) ?? null }))
}

export async function obtenerNoticia(id: string): Promise<NoticiaDB | null> {
  const sesion = await requireEditorNoticias()
  const supabase = createAdminClient()
  const yo = idRedactor(sesion)

  let consulta = supabase.from('noticias').select('*').eq('id', id)
  if (yo) consulta = consulta.eq('redactor_id', yo)
  const { data, error } = await consulta.maybeSingle()
  if (error) throw new Error(error.message)
  const noticia = data as NoticiaDB | null
  if (!noticia || yo || noticia.publicado) return noticia

  const despublicaciones = await ultimasDespublicaciones(supabase, [noticia.id])
  return { ...noticia, despublicacion: despublicaciones.get(noticia.id) ?? null }
}

export async function guardarNoticia(
  id: string | null,
  input: NoticiaInput,
  opciones?: { motivoDespublicacion?: string }
): Promise<NoticiaDB> {
  const sesion = await requireEditorNoticias()
  const yo = idRedactor(sesion)

  // Un redactor firma siempre como él mismo, sin importar lo que traiga el input
  const entrada = sesion.rol === 'colaborador' ? { ...input, redactor_id: sesion.redactorId, autor: sesion.nombre } : input
  const parsed = noticiaSchema.safeParse(entrada)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const supabase = createAdminClient()

  // Una sola lectura de la fila previa: slug (si cambia, la URL antigua también
  // debe regenerarse), dueño y estado de publicación
  const previa = id ? await leerFilaPrevia(supabase, id) : null
  if (id) comprobarPropiedad(sesion, previa)
  const slugAnterior = previa?.slug
  const motivo = id ? motivoDespublicacion(sesion, previa, parsed.data.publicado, opciones?.motivoDespublicacion) : null

  // Un slug sin cambios se respeta tal cual: las noticias importadas pueden
  // tener mayúsculas y sus enlaces ya están compartidos
  const slug = parsed.data.slug === slugAnterior ? slugAnterior : slugify(parsed.data.slug || parsed.data.titulo)
  const fila = { ...parsed.data, slug }
  if (!fila.slug) throw new Error('La dirección (slug) no puede quedar vacía')

  // Con un redactor del catálogo, el autor en texto es su nombre (el redactor ya trae el suyo)
  if (fila.redactor_id && !yo) {
    const { data: redactor } = await supabase.from('redactores').select('nombre').eq('id', fila.redactor_id).maybeSingle()
    if (!redactor) throw new Error('El redactor elegido ya no existe')
    fila.autor = redactor.nombre
  }

  let consulta = id ? supabase.from('noticias').update(fila).eq('id', id) : supabase.from('noticias').insert(fila)
  if (id && yo) consulta = consulta.eq('redactor_id', yo)
  const { data, error } = await consulta.select().single()

  if (error) {
    if (error.code === '23505') throw new Error(`Ya existe una noticia con la dirección "${fila.slug}"`)
    throw new Error(error.message)
  }

  await registrarDespublicacion(supabase, (data as NoticiaDB).id, sesion, motivo)

  cambios(fila.slug)
  if (slugAnterior && slugAnterior !== fila.slug) revalidatePath(`/noticias/${slugAnterior}`)
  return data as NoticiaDB
}

export async function cambiarPublicacionNoticia(id: string, publicado: boolean, motivo?: string) {
  const sesion = await requireEditorNoticias()
  const yo = idRedactor(sesion)
  const supabase = createAdminClient()

  const previa = await leerFilaPrevia(supabase, id)
  comprobarPropiedad(sesion, previa)
  const motivoFinal = motivoDespublicacion(sesion, previa, publicado, motivo)

  let consulta = supabase.from('noticias').update({ publicado }).eq('id', id)
  if (yo) consulta = consulta.eq('redactor_id', yo)
  const { data, error } = await consulta.select('slug').single()
  if (error) throw new Error(error.message)

  await registrarDespublicacion(supabase, id, sesion, motivoFinal)
  cambios(data.slug)
}

export async function eliminarNoticia(id: string) {
  await requireAdmin()
  const { data, error } = await createAdminClient().from('noticias').delete().eq('id', id).select('slug').single()
  if (error) throw new Error(error.message)
  cambios(data.slug)
}
