'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin as requireSesion } from '@/lib/auth/session'
import { cuotasHabilitadas } from '@/lib/cuotas/habilitado'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CondicionCuota, Cuota, Exencion, Pago } from '@/lib/cuotas/tipos'
import type { EstadoJugador } from '@/types/database'

export interface SerieCuotas {
  equipo_id: number
  nombre: string
  temporada: string
  cuota_monto: number
  cuota_datos_pago: string | null
}

export interface JugadorCuotas {
  id: number
  nombre_completo: string
  dorsal: number | null
  telefono: string | null
  estado: EstadoJugador
  activo: boolean
  cuota_condicion: CondicionCuota
  codigo_cuotas: string
}

export interface Tablero {
  series: SerieCuotas[]
  serie: SerieCuotas | null
  anio: number
  anios: number[]
  jugadores: JugadorCuotas[]
  cuotas: Cuota[]
  pagos: Pago[]
}

const PERIODO = /^\d{4}-\d{2}-01$/

const textoOpcional = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((v) => v || null)

const pagoSchema = z.object({
  jugador_id: z.number().int().positive(),
  equipo_id: z.number().int().positive(),
  periodo: z.string().regex(PERIODO, 'Mes inválido'),
  monto: z.number().int('El monto va sin decimales').positive('El monto debe ser mayor a 0'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  medio: z.enum(['transferencia', 'efectivo', 'otro']),
  referencia: textoOpcional,
  registrado_por: textoOpcional,
  nota: textoOpcional,
})

const cuotaSchema = z.object({
  jugador_id: z.number().int().positive(),
  equipo_id: z.number().int().positive(),
  periodo: z.string().regex(PERIODO, 'Mes inválido'),
  monto: z.number().int('El monto va sin decimales').min(0),
  exencion: z.enum(['lesion', 'ausente', 'retiro', 'refuerzo', 'becado', 'otro']).nullable(),
  nota: textoOpcional,
})

const configSchema = z.object({
  cuota_monto: z.number().int('El monto va sin decimales').min(0),
  cuota_datos_pago: textoOpcional,
})

export type PagoInput = z.input<typeof pagoSchema>
export type CuotaInput = z.input<typeof cuotaSchema>
export type ConfigCuotasInput = z.input<typeof configSchema>

/** Sesión de admin y sistema de cuotas activo (CUOTAS_HABILITADAS) */
async function requireAdmin() {
  await requireSesion()
  if (!cuotasHabilitadas()) throw new Error('El sistema de cuotas no está habilitado')
}

function primerError(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Datos inválidos'
}

function cambios() {
  revalidatePath('/admin/cuotas')
}

/** Series con equipo activo (el de la temporada más reciente de cada categoría) */
async function listarSeries(): Promise<SerieCuotas[]> {
  const { data, error } = await createAdminClient()
    .from('equipos')
    .select('id, temporada, cuota_monto, cuota_datos_pago, categoria:categorias!inner(nombre, titulo, orden)')
    .eq('activo', true)
    .order('temporada', { ascending: false })
  if (error) throw new Error(error.message)

  type Fila = {
    id: number
    temporada: string
    cuota_monto: number
    cuota_datos_pago: string | null
    categoria: { nombre: string; titulo: string | null; orden: number }
  }
  const vistas = new Set<string>()
  return (data as unknown as Fila[])
    .filter((e) => !vistas.has(e.categoria.nombre) && vistas.add(e.categoria.nombre))
    .sort((a, b) => a.categoria.orden - b.categoria.orden)
    .map((e) => ({
      equipo_id: e.id,
      nombre: e.categoria.titulo || `Serie ${e.categoria.nombre}`,
      temporada: e.temporada,
      cuota_monto: e.cuota_monto,
      cuota_datos_pago: e.cuota_datos_pago,
    }))
}

export async function obtenerTablero(equipoId?: number, anio?: number): Promise<Tablero> {
  await requireAdmin()
  const supabase = createAdminClient()
  const series = await listarSeries()
  const anioActual = new Date().getFullYear()
  const anioElegido = anio && anio > 2000 && anio < 2100 ? anio : anioActual
  const serie = series.find((s) => s.equipo_id === equipoId) ?? series[0] ?? null

  if (!serie) return { series, serie, anio: anioElegido, anios: [anioActual], jugadores: [], cuotas: [], pagos: [] }

  const [{ data: cuotas, error }, { data: periodos }] = await Promise.all([
    supabase
      .from('vista_cuotas')
      .select('*')
      .eq('equipo_id', serie.equipo_id)
      .gte('periodo', `${anioElegido}-01-01`)
      .lte('periodo', `${anioElegido}-12-01`)
      .order('periodo'),
    supabase.from('cuotas').select('periodo').eq('equipo_id', serie.equipo_id),
  ])
  if (error) throw new Error(error.message)

  const idsJugadores = Array.from(new Set((cuotas as Cuota[]).map((c) => c.jugador_id)))

  const columnas = 'id, nombre_completo, dorsal, telefono, estado, activo, cuota_condicion, codigo_cuotas'
  const [{ data: pagos, error: errorPagos }, { data: delEquipo, error: errorJugadores }, { data: otros }] = await Promise.all([
    // Filtro por join: un .in() con cientos de ids excede el largo de la URL
    supabase
      .from('pagos')
      .select('*, cuota:cuotas!inner(equipo_id, periodo)')
      .eq('cuota.equipo_id', serie.equipo_id)
      .gte('cuota.periodo', `${anioElegido}-01-01`)
      .lte('cuota.periodo', `${anioElegido}-12-01`)
      .order('fecha')
      .order('created_at'),
    supabase.from('vista_jugadores_completa').select(columnas).eq('equipo_id', serie.equipo_id),
    // Jugadores que pagaron en esta serie y luego se cambiaron de serie
    idsJugadores.length
      ? supabase.from('vista_jugadores_completa').select(columnas).in('id', idsJugadores).neq('equipo_id', serie.equipo_id)
      : Promise.resolve({ data: [] }),
  ])
  if (errorPagos || errorJugadores) throw new Error((errorPagos ?? errorJugadores)!.message)

  const conCuotas = new Set(idsJugadores)
  const jugadores = ([...(delEquipo ?? []), ...(otros ?? [])] as JugadorCuotas[])
    // Un jugador dado de baja sin cuotas este año no aporta nada al tablero
    .filter((j) => j.activo || conCuotas.has(j.id))
    .sort((a, b) => Number(b.activo) - Number(a.activo) || a.nombre_completo.localeCompare(b.nombre_completo, 'es'))

  const anios = Array.from(
    new Set([anioActual, anioElegido, ...(periodos ?? []).map((p) => Number(String(p.periodo).slice(0, 4)))])
  ).sort((a, b) => b - a)

  return {
    series,
    serie,
    anio: anioElegido,
    anios,
    jugadores,
    cuotas: cuotas as Cuota[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pagos: (pagos ?? []).map(({ cuota, ...p }) => p as Pago),
  }
}

export async function guardarConfigCuotas(equipoId: number, input: ConfigCuotasInput) {
  await requireAdmin()
  const parsed = configSchema.safeParse(input)
  if (!parsed.success) throw new Error(primerError(parsed.error))

  const { error } = await createAdminClient().from('equipos').update(parsed.data).eq('id', equipoId)
  if (error) throw new Error(error.message)
  cambios()
}

async function montoSerie(equipoId: number) {
  const { data, error } = await createAdminClient().from('equipos').select('cuota_monto').eq('id', equipoId).single()
  if (error) throw new Error(error.message)
  if (!data.cuota_monto) throw new Error('Primero define el monto de la cuota de esta serie')
  return data.cuota_monto as number
}

/**
 * Crea la cuota del mes para cada jugador activo de la serie que aún no la
 * tenga. Refuerzos, becados y lesionados quedan exentos de partida.
 */
export async function generarCuotas(equipoId: number, periodo: string): Promise<number> {
  await requireAdmin()
  if (!PERIODO.test(periodo)) throw new Error('Mes inválido')
  const supabase = createAdminClient()
  const monto = await montoSerie(equipoId)

  const { data: jugadores, error } = await supabase
    .from('jugadores')
    .select('id, estado, cuota_condicion')
    .eq('equipo_id', equipoId)
    .eq('activo', true)
    .neq('estado', 'Inactivo')
  if (error) throw new Error(error.message)

  const filas = (jugadores ?? []).map((j) => ({
    jugador_id: j.id,
    equipo_id: equipoId,
    periodo,
    monto,
    exencion: (j.cuota_condicion !== 'regular'
      ? j.cuota_condicion
      : j.estado === 'Lesionado'
        ? 'lesion'
        : null) as Exencion | null,
  }))
  if (!filas.length) return 0

  const { data, error: errorInsert } = await supabase
    .from('cuotas')
    .upsert(filas, { onConflict: 'jugador_id,periodo', ignoreDuplicates: true })
    .select('id')
  if (errorInsert) throw new Error(errorInsert.message)
  cambios()
  return data?.length ?? 0
}

/** Id de la cuota del jugador en ese mes; la crea si no existe */
async function asegurarCuota(jugadorId: number, equipoId: number, periodo: string, monto?: number) {
  const supabase = createAdminClient()
  const { data: existente } = await supabase
    .from('cuotas')
    .select('id')
    .eq('jugador_id', jugadorId)
    .eq('periodo', periodo)
    .maybeSingle()
  if (existente) return existente.id as string

  const { data, error } = await supabase
    .from('cuotas')
    .insert({ jugador_id: jugadorId, equipo_id: equipoId, periodo, monto: monto ?? (await montoSerie(equipoId)) })
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data.id as string
}

export async function registrarPago(input: PagoInput) {
  await requireAdmin()
  const parsed = pagoSchema.safeParse(input)
  if (!parsed.success) throw new Error(primerError(parsed.error))
  const { jugador_id, equipo_id, periodo, ...pago } = parsed.data

  const cuotaId = await asegurarCuota(jugador_id, equipo_id, periodo)
  const { error } = await createAdminClient().from('pagos').insert({ ...pago, cuota_id: cuotaId })
  if (error) throw new Error(error.message)
  cambios()
}

/** Un pago mal registrado se anula (no se borra) para que quede el rastro */
export async function anularPago(pagoId: string) {
  await requireAdmin()
  const { error } = await createAdminClient().from('pagos').update({ estado: 'anulado' }).eq('id', pagoId)
  if (error) throw new Error(error.message)
  cambios()
}

/** Monto, exención y nota de la cuota de un mes (la crea si no existe) */
export async function guardarCuota(input: CuotaInput) {
  await requireAdmin()
  const parsed = cuotaSchema.safeParse(input)
  if (!parsed.success) throw new Error(primerError(parsed.error))
  const { jugador_id, equipo_id, periodo, ...datos } = parsed.data

  const cuotaId = await asegurarCuota(jugador_id, equipo_id, periodo, datos.monto)
  const { error } = await createAdminClient().from('cuotas').update(datos).eq('id', cuotaId)
  if (error) throw new Error(error.message)
  cambios()
}

/** Quita una cuota creada por error. Si tiene pagos válidos, hay que anularlos antes. */
export async function eliminarCuota(cuotaId: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('pagos')
    .select('id', { count: 'exact', head: true })
    .eq('cuota_id', cuotaId)
    .eq('estado', 'aprobado')
  if (count) throw new Error('La cuota tiene pagos. Anúlalos antes de eliminarla.')

  const { error } = await supabase.from('cuotas').delete().eq('id', cuotaId)
  if (error) throw new Error(error.message)
  cambios()
}

export async function guardarCondicion(jugadorId: number, condicion: CondicionCuota) {
  await requireAdmin()
  const valor = z.enum(['regular', 'refuerzo', 'becado']).parse(condicion)
  const { error } = await createAdminClient().from('jugadores').update({ cuota_condicion: valor }).eq('id', jugadorId)
  if (error) throw new Error(error.message)
  cambios()
}

/** Invalida el link personal anterior (por ejemplo, si se compartió por error) */
export async function regenerarCodigo(jugadorId: number): Promise<string> {
  await requireAdmin()
  const codigo = crypto.randomUUID().replace(/-/g, '')
  const { error } = await createAdminClient().from('jugadores').update({ codigo_cuotas: codigo }).eq('id', jugadorId)
  if (error) throw new Error(error.message)
  cambios()
  return codigo
}
