export type TipoEvento = 'partido' | 'entrenamiento' | 'evento'
export type TipoPartido = 'Amistoso' | 'Oficial' | 'Torneo' | 'Copa'

export interface EventoCalendario {
  id: string
  fecha: string // formato: "2024-12-11"
  dia: string // "JUEVES"
  diaMes: number // 11
  mes: string // "DICIEMBRE"
  tipo: TipoEvento
  rival?: string // para partidos
  actividad?: string // para entrenamientos u otros
  estadio: string
  confirmado: boolean
  horaInicio?: string // formato: "15:00"
  horaFin?: string // formato: "13:00" - para eventos con duración
  tipoPartido?: TipoPartido // Amistoso, Oficial, etc.
  llevar?: string // monto a llevar para el evento
  titulo?: string // título del evento (para tipo 'evento')
  descripcion?: string // descripción del evento (para tipo 'evento')
  series?: string[] // series que participan en el evento
  precioEntrada?: string // precio de entrada para eventos
  edadGratis?: string // edad hasta la cual no se paga
}
