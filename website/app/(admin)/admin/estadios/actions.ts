'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidarSitio } from '@/lib/admin/revalidar'
import type { Estadio } from '@/lib/contenido/tipos'

const textoOpcional = z
  .string()
  .trim()
  .nullable()
  .transform((v) => v || null)

const estadioSchema = z.object({
  nombre: z.string().trim().min(1, 'Indica el nombre de la cancha o estadio'),
  ubicacion: textoOpcional,
  mapa_url: textoOpcional,
})

function cambios() {
  revalidatePath('/admin/estadios')
  revalidatePath('/admin/programacion')
  revalidarSitio('programacion')
}

export async function listarEstadios(): Promise<Estadio[]> {
  await requireAdmin()
  const { data, error } = await createAdminClient().from('estadios').select('*').order('nombre')
  if (error) throw new Error(error.message)
  return data as Estadio[]
}

/**
 * Crea o actualiza una cancha o estadio. Al renombrarlo se actualiza también
 * el lugar de las actividades que lo usan, para que no quede texto desalineado.
 */
export async function guardarEstadio(
  id: string | null,
  input: { nombre: string; ubicacion: string | null; mapa_url: string | null }
): Promise<Estadio> {
  await requireAdmin()

  const parsed = estadioSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  if (parsed.data.mapa_url && !/^https?:\/\/[^\s]+\.[^\s]+$/.test(parsed.data.mapa_url)) {
    throw new Error('Link de mapa inválido: usa una URL completa, ej. https://maps.app.goo.gl/...')
  }

  const fila = {
    nombre: parsed.data.nombre,
    ubicacion: parsed.data.ubicacion,
    mapa_url: parsed.data.mapa_url,
  }

  const supabase = createAdminClient()

  let nombreAnterior: string | null = null
  if (id) {
    const { data: actual } = await supabase.from('estadios').select('nombre').eq('id', id).maybeSingle()
    nombreAnterior = actual?.nombre ?? null
  }

  const consulta = id
    ? supabase.from('estadios').update(fila).eq('id', id)
    : supabase.from('estadios').insert(fila)
  const { data, error } = await consulta.select().single()
  if (error) {
    if (error.code === '23505') throw new Error('Ya existe una cancha o estadio con ese nombre')
    throw new Error(error.message)
  }

  if (id && nombreAnterior !== null && nombreAnterior !== fila.nombre) {
    const { error: errorActividades } = await supabase.from('programacion').update({ estadio: fila.nombre }).eq('estadio_id', id)
    if (errorActividades) throw new Error(`El estadio se guardó, pero no sus actividades: ${errorActividades.message}`)
  }

  cambios()
  return data as Estadio
}

export async function eliminarEstadio(id: string) {
  await requireAdmin()
  const { error } = await createAdminClient().from('estadios').delete().eq('id', id)
  if (error) throw new Error(error.message)
  cambios()
}
