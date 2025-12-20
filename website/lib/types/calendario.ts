export type TipoEvento = 'partido' | 'entrenamiento'

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
}
