import type { EventoCalendario } from '@/lib/types/calendario'
import type { Actividad } from './tipos'

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
 * Convierte una fila de la tabla programacion al formato que consumen los componentes
 * de components/calendario (el mismo de los antiguos lib/data/eventos-*.ts).
 */
export function actividadAEvento(a: Actividad): EventoCalendario {
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
    actividad: a.actividad ?? undefined,
    titulo: a.titulo ?? undefined,
    descripcion: a.descripcion ?? undefined,
    estadio: a.estadio,
    confirmado: a.confirmado,
    horaInicio: horaCorta(a.hora_inicio),
    horaFin: horaCorta(a.hora_fin),
    tipoPartido: a.tipo_partido ?? undefined,
    llevar: a.llevar ?? undefined,
    series: a.series.length > 0 ? a.series : undefined,
    precioEntrada: a.precio_entrada ?? undefined,
    edadGratis: a.edad_gratis ?? undefined,
  }
}

/** Nombre visible de una actividad, según su tipo */
export function nombreActividad(a: Pick<Actividad, 'tipo' | 'rival' | 'actividad' | 'titulo'>): string {
  if (a.tipo === 'partido') return a.rival || 'Partido'
  if (a.tipo === 'entrenamiento') return a.actividad || 'Entrenamiento'
  return a.titulo || 'Evento'
}
