'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidarSitio } from '@/lib/admin/revalidar'
import type { Actividad, ActividadInput } from '@/lib/contenido/tipos'

const textoOpcional = z
  .string()
  .trim()
  .nullable()
  .transform((v) => v || null)

const horaOpcional = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora inválida')
  .nullable()
  .or(z.literal('').transform(() => null))

const actividadSchema = z.object({
  tipo: z.enum(['partido', 'entrenamiento', 'evento']),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  hora_inicio: horaOpcional,
  hora_fin: horaOpcional,
  rival: textoOpcional,
  tipo_partido: z.enum(['Amistoso', 'Oficial', 'Torneo', 'Copa']).nullable(),
  actividad: textoOpcional,
  titulo: textoOpcional,
  descripcion: textoOpcional,
  estadio: z.string().trim(),
  confirmado: z.boolean(),
  llevar: textoOpcional,
  precio_entrada: textoOpcional,
  edad_gratis: textoOpcional,
  series: z.array(z.string()),
  publicado: z.boolean(),
})

function cambios() {
  revalidatePath('/admin/programacion')
  revalidatePath('/admin')
  revalidarSitio('programacion')
}

export async function listarActividades(): Promise<Actividad[]> {
  await requireAdmin()
  const { data, error } = await createAdminClient()
    .from('programacion')
    .select('*')
    .order('fecha', { ascending: true })
    .order('hora_inicio', { ascending: true, nullsFirst: true })
  if (error) throw new Error(error.message)
  return data as Actividad[]
}

export async function guardarActividad(id: string | null, input: ActividadInput): Promise<Actividad> {
  await requireAdmin()

  const parsed = actividadSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const datos = parsed.data
  if (datos.tipo === 'partido' && !datos.rival) throw new Error('Indica los equipos del partido')
  if (datos.tipo === 'evento' && !datos.titulo) throw new Error('El evento necesita un título')

  // Se limpian los campos que no corresponden al tipo elegido
  const fila = {
    ...datos,
    rival: datos.tipo === 'partido' ? datos.rival : null,
    tipo_partido: datos.tipo === 'partido' ? datos.tipo_partido : null,
    actividad: datos.tipo === 'entrenamiento' ? datos.actividad || 'ENTRENAMIENTO' : null,
    titulo: datos.tipo === 'evento' ? datos.titulo : null,
    descripcion: datos.tipo === 'evento' ? datos.descripcion : null,
    precio_entrada: datos.tipo === 'evento' ? datos.precio_entrada : null,
    edad_gratis: datos.tipo === 'evento' ? datos.edad_gratis : null,
  }

  const supabase = createAdminClient()
  const consulta = id
    ? supabase.from('programacion').update(fila).eq('id', id)
    : supabase.from('programacion').insert(fila)
  const { data, error } = await consulta.select().single()
  if (error) throw new Error(error.message)

  cambios()
  return data as Actividad
}

export async function cambiarConfirmacion(id: string, confirmado: boolean) {
  await requireAdmin()
  const { error } = await createAdminClient().from('programacion').update({ confirmado }).eq('id', id)
  if (error) throw new Error(error.message)
  cambios()
}

export async function eliminarActividad(id: string) {
  await requireAdmin()
  const { error } = await createAdminClient().from('programacion').delete().eq('id', id)
  if (error) throw new Error(error.message)
  cambios()
}
