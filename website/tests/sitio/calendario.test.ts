import { afterEach, describe, expect, it, vi } from 'vitest'
import { actividadAEvento, horaCorta, nombreActividad } from '@/lib/contenido/calendario'
import {
  esEquipoAYB,
  esFechaHoy,
  filtrarSoloPartidos,
  formatearNombrePartido,
  obtenerProximosEventos,
} from '@/lib/utils/calendario'
import type { Actividad } from '@/lib/contenido/tipos'
import type { EventoCalendario } from '@/lib/types/calendario'

function actividad(parcial: Partial<Actividad>): Actividad {
  return {
    id: 'a1', tipo: 'partido', fecha: '2026-01-01', hora_inicio: null, hora_fin: null, rival: null,
    tipo_partido: null, actividad: null, titulo: null, descripcion: null, estadio: '', confirmado: false,
    llevar: null, precio_entrada: null, edad_gratis: null, series: [], publicado: true, legacy_id: null,
    created_at: '', updated_at: '',
    ...parcial,
  } as Actividad
}

function evento(fecha: string, tipo: EventoCalendario['tipo'] = 'partido'): EventoCalendario {
  return { id: fecha + tipo, fecha, tipo } as EventoCalendario
}

describe('actividadAEvento', () => {
  it.each([
    ['2026-03-07', 'SÁBADO', 7, 'MARZO'],
    ['2026-01-01', 'JUEVES', 1, 'ENERO'],
    ['2026-12-31', 'JUEVES', 31, 'DICIEMBRE'],
    ['2028-02-29', 'MARTES', 29, 'FEBRERO'],
  ])('%s → %s %i de %s, sin correrse por la zona horaria', (fecha, dia, diaMes, mes) => {
    expect(actividadAEvento(actividad({ fecha }))).toMatchObject({ dia, diaMes, mes })
  })

  it('acorta las horas y omite lo vacío', () => {
    const e = actividadAEvento(actividad({ hora_inicio: '09:00:00', hora_fin: '10:30:00', series: [] }))
    expect(e.horaInicio).toBe('09:00')
    expect(e.horaFin).toBe('10:30')
    expect(e.series).toBeUndefined()
    expect(e.rival).toBeUndefined()
  })

  it('horaCorta sin hora devuelve undefined', () => {
    expect(horaCorta(null)).toBeUndefined()
  })
})

describe('nombreActividad', () => {
  it('usa el campo que corresponde a cada tipo, con un texto por defecto', () => {
    expect(nombreActividad({ tipo: 'partido', rival: 'AYB VS X', actividad: null, titulo: null })).toBe('AYB VS X')
    expect(nombreActividad({ tipo: 'partido', rival: null, actividad: null, titulo: null })).toBe('Partido')
    expect(nombreActividad({ tipo: 'entrenamiento', rival: null, actividad: 'FÍSICO', titulo: null })).toBe('FÍSICO')
    expect(nombreActividad({ tipo: 'evento', rival: null, actividad: null, titulo: null })).toBe('Evento')
  })
})

describe('equipos de Azul y Blanco', () => {
  it.each(['AYB', 'ayb35', 'Azul y Blanco', 'Serie Honor', ' serie 35 '])('reconoce %j', (nombre) => {
    expect(esEquipoAYB(nombre)).toBe(true)
  })

  it.each(['Club América', 'Unión Española', 'Colo-Colo'])('no confunde a %j', (nombre) => {
    expect(esEquipoAYB(nombre)).toBe(false)
  })

  it('separa local y visitante con "vs" en cualquier mayúscula', () => {
    expect(formatearNombrePartido('AYB VS Club América')).toEqual({
      esAyBLocal: true, esAyBVisitante: false, equipoLocal: 'AYB', equipoVisitante: 'Club América',
    })
    expect(formatearNombrePartido('Unión vs Serie Honor')).toMatchObject({ esAyBLocal: false, esAyBVisitante: true })
  })

  it('sin "vs" deja todo el texto como un solo nombre', () => {
    expect(formatearNombrePartido('Final de copa')).toMatchObject({ equipoLocal: '', equipoVisitante: 'Final de copa' })
  })
})

describe('próximos eventos', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('incluye hoy, descarta el pasado, ordena y limita', () => {
    vi.useFakeTimers({ now: new Date(2026, 2, 10, 20, 0) })
    const eventos = ['2026-03-20', '2026-03-09', '2026-03-10', '2026-04-01', '2026-03-15'].map((f) => evento(f))
    expect(obtenerProximosEventos(eventos, 3).map((e) => e.fecha)).toEqual(['2026-03-10', '2026-03-15', '2026-03-20'])
    expect(esFechaHoy('2026-03-10')).toBe(true)
  })

  it('no modifica el arreglo original', () => {
    vi.useFakeTimers({ now: new Date(2026, 0, 1) })
    const eventos = [evento('2026-02-01'), evento('2026-01-15')]
    obtenerProximosEventos(eventos)
    expect(eventos.map((e) => e.fecha)).toEqual(['2026-02-01', '2026-01-15'])
  })

  it('filtrarSoloPartidos deja fuera entrenamientos y eventos', () => {
    const eventos = [evento('2026-01-01', 'partido'), evento('2026-01-02', 'entrenamiento'), evento('2026-01-03', 'evento')]
    expect(filtrarSoloPartidos(eventos)).toHaveLength(1)
  })
})
