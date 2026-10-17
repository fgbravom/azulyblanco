'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidarSitio } from '@/lib/admin/revalidar'
import { BUCKET_MEDIOS, type Redactor } from '@/lib/contenido/tipos'

const redactorSchema = z.object({
  nombre: z.string().trim().min(1, 'Indica el nombre del redactor'),
})

function cambios() {
  revalidatePath('/admin/redactores')
  revalidatePath('/admin/noticias', 'layout')
  revalidarSitio('noticias')
}

/** Ruta en el bucket de un avatar subido desde el admin; null si es un archivo de public/ */
function pathEnBucket(url: string | null) {
  const path = url?.split(`/object/public/${BUCKET_MEDIOS}/`)[1]
  return path?.startsWith('redactores/') ? path : null
}

export async function listarRedactores(): Promise<Redactor[]> {
  await requireAdmin()
  const { data, error } = await createAdminClient().from('redactores').select('*').order('nombre')
  if (error) throw new Error(error.message)
  return data as Redactor[]
}

/**
 * Crea o actualiza un redactor. `avatarPath` es la ruta dentro del bucket
 * "medios" de una imagen ya subida con URL firmada (destino "redactor"); se
 * guarda su URL pública. `undefined` conserva el avatar anterior y `null` lo quita.
 */
export async function guardarRedactor(
  id: string | null,
  input: { nombre: string; avatarPath?: string | null }
): Promise<Redactor> {
  await requireAdmin()

  const parsed = redactorSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const fila: Record<string, unknown> = { nombre: parsed.data.nombre }

  const supabase = createAdminClient()

  let avatarAnterior: string | null = null
  if (id) {
    const { data: actual } = await supabase.from('redactores').select('avatar_url').eq('id', id).maybeSingle()
    avatarAnterior = actual?.avatar_url ?? null
  }

  const cambiaAvatar = input.avatarPath !== undefined
  if (input.avatarPath) {
    if (!input.avatarPath.startsWith('redactores/')) throw new Error('Ruta de avatar inválida')
    fila.avatar_url = supabase.storage.from(BUCKET_MEDIOS).getPublicUrl(input.avatarPath).data.publicUrl
  } else if (input.avatarPath === null) {
    fila.avatar_url = null
  }

  const consulta = id
    ? supabase.from('redactores').update(fila).eq('id', id)
    : supabase.from('redactores').insert(fila)
  const { data, error } = await consulta.select().single()
  if (error) {
    if (error.code === '23505') throw new Error('Ya existe un redactor con ese nombre')
    throw new Error(error.message)
  }

  // Las noticias guardan también el nombre como texto: se mantiene al día
  if (id) {
    const { error: errorNoticias } = await supabase.from('noticias').update({ autor: parsed.data.nombre }).eq('redactor_id', id)
    if (errorNoticias) throw new Error(errorNoticias.message)
  }

  // Se reemplazó o quitó el avatar: el archivo anterior ya no se usa
  if (cambiaAvatar && avatarAnterior && avatarAnterior !== fila.avatar_url) {
    const pathAnterior = pathEnBucket(avatarAnterior)
    if (pathAnterior) await supabase.storage.from(BUCKET_MEDIOS).remove([pathAnterior])
  }

  cambios()
  return data as Redactor
}

export async function eliminarRedactor(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: redactor, error } = await supabase.from('redactores').select('avatar_url').eq('id', id).single()
  if (error) throw new Error(error.message)

  const { error: errorBorrado } = await supabase.from('redactores').delete().eq('id', id)
  if (errorBorrado) throw new Error(errorBorrado.message)

  const path = pathEnBucket(redactor.avatar_url)
  if (path) await supabase.storage.from(BUCKET_MEDIOS).remove([path])

  cambios()
}
