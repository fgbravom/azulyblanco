/**
 * Cuotas de los jugadores (migración 004). Lo usan el admin y el link
 * personal /cuotas/<código>.
 */

export type Exencion = 'lesion' | 'ausente' | 'retiro' | 'refuerzo' | 'becado' | 'otro'
export type EstadoCuota = 'pagada' | 'parcial' | 'pendiente' | 'exenta'
export type MedioPago = 'transferencia' | 'efectivo' | 'mercadopago' | 'flow' | 'otro'
export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado' | 'anulado'
export type CondicionCuota = 'regular' | 'refuerzo' | 'becado'

/** Fila de vista_cuotas */
export interface Cuota {
  id: string
  jugador_id: number
  equipo_id: number
  /** Primer día del mes, YYYY-MM-01 */
  periodo: string
  monto: number
  exencion: Exencion | null
  nota: string | null
  pagado: number
  saldo: number
  estado: EstadoCuota
}

export interface Pago {
  id: string
  cuota_id: string
  monto: number
  fecha: string
  medio: MedioPago
  estado: EstadoPago
  referencia: string | null
  registrado_por: string | null
  nota: string | null
  created_at: string
}

export const EXENCIONES: Record<Exencion, string> = {
  lesion: 'Lesión',
  ausente: 'Ausente',
  retiro: 'Retiro',
  refuerzo: 'Refuerzo',
  becado: 'Becado',
  otro: 'Exento',
}

export const MEDIOS: Record<MedioPago, string> = {
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  mercadopago: 'Mercado Pago',
  flow: 'Flow',
  otro: 'Otro',
}

/** Medios que el tesorero puede elegir al registrar a mano */
export const MEDIOS_MANUALES: MedioPago[] = ['transferencia', 'efectivo', 'otro']

export const CONDICIONES: Record<CondicionCuota, { label: string; descripcion: string }> = {
  regular: { label: 'Regular', descripcion: 'Paga la cuota mensual' },
  refuerzo: { label: 'Refuerzo', descripcion: 'Juega por la serie pero no paga cuota' },
  becado: { label: 'Becado', descripcion: 'Exento de cuota por decisión del club' },
}

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

export function formatoCLP(monto: number) {
  return clp.format(monto)
}

export function nombreMes(periodo: string, formato: 'long' | 'short' = 'long') {
  const texto = new Date(`${periodo.slice(0, 7)}-15T12:00:00`).toLocaleDateString('es-CL', { month: formato })
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace('.', '')
}

/** YYYY-MM-01 del mes de una fecha (por defecto, hoy en Chile) */
export function periodoDe(fecha = new Date()) {
  const [anio, mes] = fecha.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' }).split('-')
  return `${anio}-${mes}-01`
}

export function etiquetaCuota(cuota: Pick<Cuota, 'estado' | 'exencion'>) {
  switch (cuota.estado) {
    case 'pagada':
      return 'Pagada'
    case 'parcial':
      return 'Abono'
    case 'pendiente':
      return 'Debe'
    case 'exenta':
      return EXENCIONES[cuota.exencion ?? 'otro']
  }
}

/** El código del link personal: 32 caracteres hex (migración 004) */
export const CODIGO_VALIDO = /^[0-9a-f]{32}$/
