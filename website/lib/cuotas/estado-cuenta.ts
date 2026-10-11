import { createAdminClient } from '@/lib/supabase/admin'
import { CODIGO_VALIDO, type Cuota, type Pago } from './tipos'

export interface EstadoCuenta {
  nombre: string
  serie: string
  activo: boolean
  datos_pago: string | null
  deuda: number
  cuotas: Cuota[]
  pagos: (Pick<Pago, 'id' | 'monto' | 'fecha' | 'medio'> & { periodo: string })[]
}

/**
 * Estado de cuenta del link personal /cuotas/<código>. Lee con la service_role
 * (las cuotas no son públicas), así que solo debe llamarse desde el servidor
 * y devuelve únicamente lo que el jugador puede ver: nada de su ficha personal.
 */
export async function getEstadoCuenta(codigo: string): Promise<EstadoCuenta | null> {
  if (!CODIGO_VALIDO.test(codigo)) return null
  const supabase = createAdminClient()

  const { data: jugador } = await supabase
    .from('vista_jugadores_completa')
    .select('id, nombre_completo, activo, equipo_id, categoria')
    .eq('codigo_cuotas', codigo)
    .maybeSingle()
  if (!jugador) return null

  const [{ data: equipo }, { data: cuotas, error }] = await Promise.all([
    supabase.from('equipos').select('cuota_datos_pago').eq('id', jugador.equipo_id).single(),
    supabase.from('vista_cuotas').select('*').eq('jugador_id', jugador.id).order('periodo', { ascending: false }),
  ])
  if (error) throw new Error(error.message)

  const lista = (cuotas ?? []) as Cuota[]
  const periodoDe = new Map(lista.map((c) => [c.id, c.periodo]))
  const { data: pagos } = await supabase
    .from('pagos')
    .select('id, cuota_id, monto, fecha, medio, cuota:cuotas!inner(jugador_id)')
    .eq('cuota.jugador_id', jugador.id)
    .eq('estado', 'aprobado')
    .order('fecha', { ascending: false })
    .limit(24)

  return {
    nombre: jugador.nombre_completo,
    serie: `Serie ${jugador.categoria}`,
    activo: jugador.activo,
    datos_pago: equipo?.cuota_datos_pago ?? null,
    deuda: lista.reduce((s, c) => s + c.saldo, 0),
    cuotas: lista,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pagos: (pagos ?? []).map(({ cuota_id, cuota, ...p }) => ({ ...p, periodo: periodoDe.get(cuota_id) ?? '' })),
  }
}
