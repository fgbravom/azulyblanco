import type { EventoCalendario, GolPartido } from '@/lib/types/calendario'
import type { Actividad, Estadio, Rival } from './tipos'

const DIAS = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
]

/** "15:00:00" → "15:00" */
export function horaCorta(hora: string | null): string | undefined {
  return hora ? hora.slice(0, 5) : undefined
}

/**
 * Link para abrir el lugar en Google Maps: el del catálogo de estadios si existe,
 * o una búsqueda con el lugar escrito para los antiguos.
 */
export function urlMapaLugar(estadio: string, mapaUrl?: string | null): string {
  return mapaUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(estadio)}`
}

/**
 * Convierte una fila de la tabla programacion al formato que consumen los componentes
 * de components/calendario (el mismo de los antiguos lib/data/eventos-*.ts).
 * `rival` es el equipo del catálogo (tabla rivales) al que apunta rival_id, si existe.
 * `estadio` es la cancha del catálogo (tabla estadios) al que apunta estadio_id, si existe.
 * `goles` son los goleadores de AYB de ese partido (tabla goles).
 */
export function actividadAEvento(a: Actividad, rival?: Rival, goles?: GolPartido[], estadio?: Estadio): EventoCalendario {
  const resultado =
    a.goles_local != null && a.goles_visitante != null
      ? { local: a.goles_local, visitante: a.goles_visitante }
      : undefined

  const [anio, mes, dia] = a.fecha.split('-').map(Number)
  const fecha = new Date(Date.UTC(anio, mes - 1, dia))

  return {
    id: a.id,
    fecha: a.fecha,
    dia: DIAS[fecha.getUTCDay()],
    diaMes: dia,
    mes: MESES[mes - 1],
    tipo: a.tipo,
    rival: a.rival ?? undefined,
    rivalLogo: rival?.logo_url ?? undefined,
    rivalNombre: rival?.nombre ?? undefined,
    rivalSitioWeb: rival?.sitio_web ?? undefined,
    actividad: a.actividad ?? undefined,
    titulo: a.titulo ?? undefined,
    descripcion: a.descripcion ?? undefined,
    estadio: a.estadio,
    estadioMapaUrl: estadio?.mapa_url ?? undefined,
    confirmado: a.confirmado,
    horaInicio: horaCorta(a.hora_inicio),
    horaFin: horaCorta(a.hora_fin),
    tipoPartido: a.tipo_partido ?? undefined,
    llevar: a.llevar ?? undefined,
    series: a.series.length > 0 ? a.series : undefined,
    precioEntrada: a.precio_entrada ?? undefined,
    edadGratis: a.edad_gratis ?? undefined,
    // Sin la migración 012 las columnas no vienen (undefined) y el partido queda sin resultado
    resultado,
    goles: resultado && goles && goles.length > 0 ? goles : undefined,
  }
}

/** Nombre visible de una actividad, según su tipo */
export function nombreActividad(a: Pick<Actividad, 'tipo' | 'rival' | 'actividad' | 'titulo'>): string {
  if (a.tipo === 'partido') return a.rival || 'Partido'
  if (a.tipo === 'entrenamiento') return a.actividad || 'Entrenamiento'
  return a.titulo || 'Evento'
}
