'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin, requirePermiso } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidarSitio } from '@/lib/admin/revalidar'
import { BUCKET_MEDIOS, type Rival } from '@/lib/contenido/tipos'

const rivalSchema = z.object({
  nombre: z.string().trim().min(1, 'Indica el nombre del rival'),
  sigla: z.string().trim().min(1, 'Indica la sigla').max(12, 'Sigla demasiado larga'),
  sitio_web: z
    .string()
    .trim()
    .nullable()
    .transform((v) => v || null),
})

function cambios() {
  revalidatePath('/admin/rivales')
  revalidatePath('/admin/programacion')
  revalidarSitio('programacion')
}

// Lectura para programación (el colaborador elige el rival); la edición es del admin
export async function listarRivales(): Promise<Rival[]> {
  await requirePermiso('programacion')
  const { data, error } = await createAdminClient().from('rivales').select('*').order('nombre')
  if (error) throw new Error(error.message)
  return data as Rival[]
}

/**
 * Crea o actualiza un rival. `logoPath` es la ruta dentro del bucket "medios"
 * de un logo ya subido con URL firmada (destino "rival"); se guarda su URL
 * pública. `undefined` conserva el logo anterior y `null` lo quita.
 */
export async function guardarRival(
  id: string | null,
  input: { nombre: string; sigla: string; sitio_web: string | null; logoPath?: string | null }
): Promise<Rival> {
  await requireAdmin()

  const parsed = rivalSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  if (parsed.data.sitio_web && !/^https?:\/\/[^\s]+\.[^\s]+$/.test(parsed.data.sitio_web)) {
    throw new Error('Sitio web inválido: usa una URL completa, ej. https://clubrival.cl')
  }

  const fila: Record<string, unknown> = {
    nombre: parsed.data.nombre,
    sigla: parsed.data.sigla.toUpperCase(),
    sitio_web: parsed.data.sitio_web,
  }

  const supabase = createAdminClient()

  let logoAnterior: string | null = null
  if (id) {
    const { data: actual } = await supabase.from('rivales').select('logo_url').eq('id', id).maybeSingle()
    logoAnterior = actual?.logo_url ?? null
  }

  const cambiaLogo = input.logoPath !== undefined
  if (input.logoPath) {
    if (!input.logoPath.startsWith('rivales/')) throw new Error('Ruta de logo inválida')
    fila.logo_url = supabase.storage.from(BUCKET_MEDIOS).getPublicUrl(input.logoPath).data.publicUrl
  } else if (input.logoPath === null) {
    fila.logo_url = null
  }

  const consulta = id
    ? supabase.from('rivales').update(fila).eq('id', id)
    : supabase.from('rivales').insert(fila)
  const { data, error } = await consulta.select().single()
  if (error) {
    if (error.code === '23505') throw new Error('Ya existe un rival con ese nombre')
    throw new Error(error.message)
  }

  // Se reemplazó o quitó el logo: el archivo anterior ya no se usa
  if (cambiaLogo && logoAnterior && logoAnterior !== fila.logo_url) {
    const pathAnterior = logoAnterior.split(`/object/public/${BUCKET_MEDIOS}/`)[1]
    if (pathAnterior?.startsWith('rivales/')) {
      await supabase.storage.from(BUCKET_MEDIOS).remove([pathAnterior])
    }
  }

  cambios()
  return data as Rival
}

export async function eliminarRival(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data: rival, error } = await supabase.from('rivales').select('logo_url').eq('id', id).single()
  if (error) throw new Error(error.message)

  const { error: errorBorrado } = await supabase.from('rivales').delete().eq('id', id)
  if (errorBorrado) throw new Error(errorBorrado.message)

  const path = rival.logo_url?.split(`/object/public/${BUCKET_MEDIOS}/`)[1]
  if (path?.startsWith('rivales/')) {
    await supabase.storage.from(BUCKET_MEDIOS).remove([path])
  }

  cambios()
}
