import { EventoCalendario } from '@/lib/types/calendario'

/**
 * Formatea el nombre del rival reemplazando "AYB" con el componente visual del escudo
 * @param rivalText Texto del rival (ej: "AYB VS CLUB AMÉRICA")
 * @returns Objeto con las partes separadas para renderizado
 */
export function formatearNombrePartido(rivalText: string): {
  esAyBLocal: boolean
  equipoLocal: string
  equipoVisitante: string
} {
  if (!rivalText.includes(' VS ')) {
    return {
      esAyBLocal: false,
      equipoLocal: '',
      equipoVisitante: rivalText
    }
  }

  const [equipoLocal, equipoVisitante] = rivalText.split(' VS ').map(e => e.trim())

  return {
    esAyBLocal: equipoLocal.toUpperCase() === 'AYB',
    equipoLocal,
    equipoVisitante
  }
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * Esta función garantiza consistencia en la comparación de fechas
 */
export function getFechaHoy(): string {
  const hoy = new Date()
  const año = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

/**
 * Filtra eventos futuros (incluyendo hoy)
 * @param eventos Array de eventos a filtrar
 * @returns Eventos que ocurren hoy o en el futuro
 */
export function filtrarEventosFuturos(eventos: EventoCalendario[]): EventoCalendario[] {
  const fechaHoy = getFechaHoy()
  return eventos.filter(evento => evento.fecha >= fechaHoy)
}

/**
 * Ordena eventos por fecha ascendente
 * @param eventos Array de eventos a ordenar
 * @returns Eventos ordenados por fecha
 */
export function ordenarEventosPorFecha(eventos: EventoCalendario[]): EventoCalendario[] {
  return [...eventos].sort((a, b) => a.fecha.localeCompare(b.fecha))
}

/**
 * Obtiene los próximos N eventos
 * @param eventos Array de eventos
 * @param limite Número máximo de eventos a retornar
 * @returns Array con los próximos eventos ordenados
 */
export function obtenerProximosEventos(
  eventos: EventoCalendario[],
  limite: number = 3
): EventoCalendario[] {
  const eventosFuturos = filtrarEventosFuturos(eventos)
  const eventosOrdenados = ordenarEventosPorFecha(eventosFuturos)
  return eventosOrdenados.slice(0, limite)
}

/**
 * Verifica si una fecha es hoy
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns true si la fecha es hoy
 */
export function esFechaHoy(fecha: string): boolean {
  return fecha === getFechaHoy()
}

/**
 * Filtra solo partidos de un array de eventos
 * @param eventos Array de eventos
 * @returns Solo eventos de tipo 'partido'
 */
export function filtrarSoloPartidos(eventos: EventoCalendario[]): EventoCalendario[] {
  return eventos.filter(evento => evento.tipo === 'partido')
}
