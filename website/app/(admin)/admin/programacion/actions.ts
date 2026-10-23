'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requirePermiso } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidarSitio } from '@/lib/admin/revalidar'
import { formatearNombrePartido } from '@/lib/utils/calendario'
import type { Actividad, ActividadInput, GolInput, JugadorGoles } from '@/lib/contenido/tipos'

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

const goles = z.number().int('Los goles deben ser un número entero').min(0, 'Los goles no pueden ser negativos').max(99).nullable()

const actividadSchema = z.object({
  tipo: z.enum(['partido', 'entrenamiento', 'evento']),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  hora_inicio: horaOpcional,
  hora_fin: horaOpcional,
  rival: textoOpcional,
  rival_id: z.string().uuid().nullable(),
  tipo_partido: z.enum(['Amistoso', 'Oficial', 'Torneo', 'Copa']).nullable(),
  actividad: textoOpcional,
  titulo: textoOpcional,
  descripcion: textoOpcional,
  estadio: z.string().trim(),
  estadio_id: z.string().uuid().nullable(),
  confirmado: z.boolean(),
  llevar: textoOpcional,
  precio_entrada: textoOpcional,
  edad_gratis: textoOpcional,
  series: z.array(z.string()),
  goles_local: goles,
  goles_visitante: goles,
  publicado: z.boolean(),
})

const idJugador = z.number().int().positive().nullable()

const golesSchema = z
  .array(
    z.object({
      lado: z.enum(['local', 'visitante']),
      autor_id: idJugador,
      asistencia_id: idJugador,
      en_contra: z.boolean(),
    })
  )
  .refine((g) => g.every((x) => x.asistencia_id === null || x.asistencia_id !== x.autor_id), 'Un jugador no puede asistirse a sí mismo')

function cambios() {
  revalidatePath('/admin/programacion')
  revalidatePath('/admin')
  revalidarSitio('programacion')
}

export async function listarActividades(): Promise<Actividad[]> {
  await requirePermiso('programacion')
  const { data, error } = await createAdminClient()
    .from('programacion')
    .select('*')
    .order('fecha', { ascending: true })
    .order('hora_inicio', { ascending: true, nullsFirst: true })
  if (error) throw new Error(error.message)
  return data as Actividad[]
}

/** Jugadores que se pueden elegir como goleadores o asistentes, activos primero */
export async function listarJugadoresGoles(): Promise<JugadorGoles[]> {
  await requirePermiso('programacion')
  const { data, error } = await createAdminClient()
    .from('vista_jugadores_completa')
    .select('id, nombre, apellidos, dorsal, categoria, activo')
    .order('activo', { ascending: false })
    .order('categoria')
    .order('nombre')
  if (error) throw new Error(error.message)
  return data as JugadorGoles[]
}

/** Goles de un partido, en orden dentro de cada lado */
export async function obtenerGoles(programacionId: string): Promise<GolInput[]> {
  await requirePermiso('programacion')
  const { data, error } = await createAdminClient()
    .from('goles')
    .select('lado, autor_id, asistencia_id, en_contra')
    .eq('programacion_id', programacionId)
    .order('lado')
    .order('orden')
  if (error) throw new Error(error.message)
  return data as GolInput[]
}

/** goles null = no tocar los goleadores guardados (el formulario no alcanzó a cargarlos) */
export async function guardarActividad(id: string | null, input: ActividadInput, goles: GolInput[] | null = []): Promise<Actividad> {
  await requirePermiso('programacion')

  const parsed = actividadSchema.safeParse(input)
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  const golesParsed = golesSchema.nullable().safeParse(goles)
  if (!golesParsed.success) throw new Error(golesParsed.error.issues[0]?.message ?? 'Goles inválidos')

  const datos = parsed.data
  if (datos.tipo === 'partido' && !datos.rival) throw new Error('Indica los equipos del partido')
  if (datos.tipo === 'evento' && !datos.titulo) throw new Error('El evento necesita un título')
  if ((datos.goles_local === null) !== (datos.goles_visitante === null)) {
    throw new Error('Completa los goles de ambos equipos o deja el resultado vacío')
  }
  // Los goleadores solo se guardan con resultado, y nunca más que los goles de su lado
  const conResultado = datos.tipo === 'partido' && datos.goles_local !== null
  const detalle = golesParsed.data === null ? null : conResultado ? golesParsed.data : []
  const partido = formatearNombrePartido(datos.rival ?? '')
  const esAYB = { local: partido.esAyBLocal, visitante: partido.esAyBVisitante }
  for (const lado of ['local', 'visitante'] as const) {
    const marcador = lado === 'local' ? datos.goles_local : datos.goles_visitante
    if (detalle && detalle.filter((g) => g.lado === lado).length > (marcador ?? 0)) {
      throw new Error('Hay más goleadores que goles en el resultado')
    }
  }
  for (const g of detalle ?? []) {
    // Lado de AYB: gol de un jugador, o autogol del rival (sin autor).
    // Lado del rival: solo se registran autogoles de jugadores de AYB.
    const valido = esAYB[g.lado]
      ? g.en_contra ? g.autor_id === null : g.autor_id !== null
      : g.en_contra && g.autor_id !== null
    if (!valido) throw new Error(esAYB[g.lado] ? 'Cada gol necesita su goleador' : 'En los goles del rival solo se registran autogoles de AYB')
    if (g.en_contra && g.asistencia_id !== null) throw new Error('Un autogol no lleva asistencia')
  }

  // Se limpian los campos que no corresponden al tipo elegido
  const fila = {
    ...datos,
    rival: datos.tipo === 'partido' ? datos.rival : null,
    rival_id: datos.tipo === 'partido' ? datos.rival_id : null,
    // Sin lugar escrito no hay estadio que referenciar
    estadio_id: datos.estadio ? datos.estadio_id : null,
    tipo_partido: datos.tipo === 'partido' ? datos.tipo_partido : null,
    goles_local: datos.tipo === 'partido' ? datos.goles_local : null,
    goles_visitante: datos.tipo === 'partido' ? datos.goles_visitante : null,
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
  const guardada = data as Actividad

  // Los goles se reemplazan completos: es más simple que calcular qué cambió
  if (detalle) {
    const { error: errorBorrado } = await supabase.from('goles').delete().eq('programacion_id', guardada.id)
    if (errorBorrado) throw new Error(`El partido se guardó, pero no los goleadores: ${errorBorrado.message}`)
    if (detalle.length > 0) {
      const orden = { local: 0, visitante: 0 }
      const filas = detalle.map((g) => ({ ...g, programacion_id: guardada.id, orden: orden[g.lado]++ }))
      const { error: errorGoles } = await supabase.from('goles').insert(filas)
      if (errorGoles) throw new Error(`El partido se guardó, pero no los goleadores: ${errorGoles.message}`)
    }
  }

  cambios()
  return guardada
}

export async function cambiarConfirmacion(id: string, confirmado: boolean) {
  await requirePermiso('programacion')
  const { error } = await createAdminClient().from('programacion').update({ confirmado }).eq('id', id)
  if (error) throw new Error(error.message)
  cambios()
}

export async function eliminarActividad(id: string) {
  await requirePermiso('programacion')
  const { error } = await createAdminClient().from('programacion').delete().eq('id', id)
  if (error) throw new Error(error.message)
  cambios()
}
