'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidarSitio } from '@/lib/admin/revalidar'
import type { SerieInfo } from '@/lib/contenido/tipos'
import type { Equipo } from '@/types/database'

export type SerieAdmin = SerieInfo & {
  orden: number
  /** Equipo de la temporada más reciente: el que muestra la página pública */
  equipo: Equipo | null
  total_jugadores: number
}

const opcional = z
  .string()
  .trim()
  .nullable()
  .transform((v) => v || null)

const urlImagen = z.url({ protocol: /^https?$/ }).nullable()

// Encuadre de la foto: punto fijo de 0 a 100 por eje y ancho respecto al marco
// en %; null o ausente = sin ajustar / sin acercar
const foco = z
  .number()
  .int('El encuadre debe ser un número entero')
  .min(0, 'El encuadre debe estar entre 0 y 100')
  .max(100, 'El encuadre debe estar entre 0 y 100')
  .nullable()
  .optional()

const anchoRecorte = z
  .number()
  .int('El tamaño del recorte debe ser un número entero')
  .min(10, 'El tamaño del recorte debe estar entre 10 y 2000')
  .max(2000, 'El tamaño del recorte debe estar entre 10 y 2000')
  .nullable()
  .optional()

const serieSchema = z.object({
  titulo: opcional,
  descripcion: opcional,
  contenido: opcional,
  imagen_url: urlImagen,
  horario_entrenamiento: opcional,
  lugar_entrenamiento: opcional,
  competencia: opcional,
})

const equipoSchema = z.object({
  temporada: z.string().trim().min(1, 'Indica la temporada'),
  entrenador: opcional,
  asistente_tecnico: opcional,
  preparador_fisico: opcional,
  entrenador_foto_url: urlImagen,
  asistente_tecnico_foto_url: urlImagen,
  preparador_fisico_foto_url: urlImagen,
  entrenador_foco_x: foco,
  entrenador_foco_y: foco,
  asistente_tecnico_foco_x: foco,
  asistente_tecnico_foco_y: foco,
  preparador_fisico_foco_x: foco,
  preparador_fisico_foco_y: foco,
  entrenador_foco_ancho: anchoRecorte,
  asistente_tecnico_foco_ancho: anchoRecorte,
  preparador_fisico_foco_ancho: anchoRecorte,
})

export type SerieInput = z.input<typeof serieSchema>
export type EquipoStaffInput = z.input<typeof equipoSchema>

function cambios(id: number) {
  revalidatePath('/admin/series')
  revalidatePath(`/admin/series/${id}`)
  revalidarSitio('series')
}

export async function listarSeries(): Promise<SerieAdmin[]> {
  await requireAdmin()
  const supabase = createAdminClient()

  const [{ data: categorias, error }, { data: equipos, error: errorEquipos }, { data: jugadores }] = await Promise.all([
    supabase
      .from('categorias')
      .select('id, nombre, orden, slug, titulo, descripcion, contenido, imagen_url, horario_entrenamiento, lugar_entrenamiento, competencia')
      .order('orden'),
    supabase.from('equipos').select('*').eq('activo', true).order('temporada', { ascending: false }),
    supabase.from('jugadores').select('equipo_id').eq('activo', true),
  ])
  if (error || errorEquipos) throw new Error((error ?? errorEquipos)!.message)

  return (categorias ?? []).map((c) => {
    const equipo = (equipos as Equipo[]).find((e) => e.categoria_id === c.id) ?? null
    return {
      ...(c as SerieInfo & { orden: number }),
      equipo,
      total_jugadores: equipo ? (jugadores ?? []).filter((j) => j.equipo_id === equipo.id).length : 0,
    }
  })
}

export async function obtenerSerie(id: number): Promise<SerieAdmin | null> {
  const series = await listarSeries()
  return series.find((s) => s.id === id) ?? null
}

export async function guardarSerie(id: number, input: SerieInput) {
  await requireAdmin()
  const parsed = serieSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const { error } = await createAdminClient().from('categorias').update(parsed.data).eq('id', id)
  if (error) throw new Error(error.message)
  cambios(id)
}

export async function guardarCuerpoTecnico(serieId: number, equipoId: number, input: EquipoStaffInput) {
  await requireAdmin()
  const parsed = equipoSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const { error } = await createAdminClient()
    .from('equipos')
    .update(parsed.data)
    .eq('id', equipoId)
    .eq('categoria_id', serieId)
  if (error) throw new Error(error.message)
  cambios(serieId)
}
