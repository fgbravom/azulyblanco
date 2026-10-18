export type TipoEvento = 'partido' | 'entrenamiento' | 'evento'
export type TipoPartido = 'Amistoso' | 'Oficial' | 'Torneo' | 'Copa'

/** Gol de AYB con su goleador y asistente, ya con los nombres para mostrar */
export interface GolPartido {
  lado: 'local' | 'visitante' // en el orden de `rival`
  autor?: string // "Juan Pérez"; vacío si es autogol
  asistencia?: string
  enContra: boolean // autogol del rival
}

export interface EventoCalendario {
  id: string
  fecha: string // formato: "2024-12-11"
  dia: string // "JUEVES"
  diaMes: number // 11
  mes: string // "DICIEMBRE"
  tipo: TipoEvento
  rival?: string // para partidos
  rivalLogo?: string // logo del rival del catálogo (tabla rivales)
  rivalNombre?: string // nombre completo del rival del catálogo
  rivalSitioWeb?: string // sitio web del rival del catálogo
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
  resultado?: { local: number; visitante: number } // goles, en el orden de `rival`
  goles?: GolPartido[] // goleadores de AYB, solo si hay resultado
}
