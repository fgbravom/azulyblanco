import { afterEach, describe, expect, it, vi } from 'vitest'
import { actividadAEvento, horaCorta, nombreActividad, urlMapaLugar } from '@/lib/contenido/calendario'
import {
  agruparPorDia,
  desenlaceAYB,
  equiposDeEvento,
  equiposDelPartido,
  esEquipoAYB,
  esFechaHoy,
  fechaLarga,
  filtrarSoloPartidos,
  formatearNombrePartido,
  obtenerProximosEventos,
  separarProgramacion,
  serieDeAYB,
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

  it('arma el resultado solo con los goles de ambos lados', () => {
    expect(actividadAEvento(actividad({ goles_local: 2, goles_visitante: 0 })).resultado).toEqual({ local: 2, visitante: 0 })
    expect(actividadAEvento(actividad({ goles_local: 0, goles_visitante: 0 })).resultado).toEqual({ local: 0, visitante: 0 })
    expect(actividadAEvento(actividad({ goles_local: null, goles_visitante: null })).resultado).toBeUndefined()
    // Sin la migración 012 las columnas no llegan
    expect(actividadAEvento(actividad({})).resultado).toBeUndefined()
  })

  it('incluye los goleadores solo si el partido tiene resultado', () => {
    const goles = [{ lado: 'local' as const, autor: 'Juan Pérez', enContra: false }]
    expect(actividadAEvento(actividad({ goles_local: 1, goles_visitante: 0 }), undefined, goles).goles).toEqual(goles)
    expect(actividadAEvento(actividad({ goles_local: null, goles_visitante: null }), undefined, goles).goles).toBeUndefined()
    expect(actividadAEvento(actividad({ goles_local: 0, goles_visitante: 0 }), undefined, []).goles).toBeUndefined()
  })

  it('lleva el link al mapa del estadio del catálogo, o busca el lugar escrito', () => {
    const estadio = {
      id: 'e1', nombre: 'ESTADIO ANFA', ubicacion: 'Curicó', mapa_url: 'https://maps.app.goo.gl/abc',
      created_at: '', updated_at: '',
    }
    expect(actividadAEvento(actividad({ estadio: 'ESTADIO ANFA' }), undefined, undefined, estadio).estadioMapaUrl).toBe('https://maps.app.goo.gl/abc')
    expect(actividadAEvento(actividad({ estadio: 'ESTADIO ANFA' })).estadioMapaUrl).toBeUndefined()
  })

  it('urlMapaLugar abre el link guardado o busca el lugar en Google Maps', () => {
    expect(urlMapaLugar('ESTADIO ANFA', 'https://maps.app.goo.gl/abc')).toBe('https://maps.app.goo.gl/abc')
    expect(urlMapaLugar('LA GRANJA')).toBe('https://www.google.com/maps/search/?api=1&query=LA%20GRANJA')
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

describe('detalle del partido', () => {
  it.each([
    ['AYB', undefined],
    ['AYB35', 'Serie 35'],
    ['SERIE HONOR', 'Serie Honor'],
    ['Primera', 'Serie Primera'],
  ])('serieDeAYB(%j) → %j', (sigla, serie) => {
    expect(serieDeAYB(sigla)).toBe(serie)
  })

  it('usa el nombre completo y el logo del rival del catálogo', () => {
    const { local, visitante } = equiposDelPartido({ rival: 'AYB35 VS SM', rivalNombre: 'San Martín', rivalLogo: '/sm.png' })
    expect(local).toEqual({ sigla: 'AYB35', nombre: 'Azul y Blanco', detalle: 'Serie 35', esAYB: true })
    expect(visitante).toEqual({ sigla: 'SM', nombre: 'San Martín', detalle: 'SM', esAYB: false, logo: '/sm.png' })
  })

  it('pone el rival a la izquierda cuando AYB es visita', () => {
    const { local, visitante } = equiposDelPartido({ rival: 'SM VS AYB', rivalNombre: 'San Martín' })
    expect(local).toMatchObject({ nombre: 'San Martín', esAYB: false })
    expect(visitante).toMatchObject({ nombre: 'Azul y Blanco', esAYB: true })
  })

  it('sin rival del catálogo deja la sigla como nombre', () => {
    expect(equiposDelPartido({ rival: 'AYB VS CLUB AMÉRICA' }).visitante).toMatchObject({ nombre: 'CLUB AMÉRICA', detalle: undefined })
  })

  it('sin "vs" asume AYB de local', () => {
    const { local, visitante } = equiposDelPartido({ rival: 'Unión' })
    expect(local.esAYB).toBe(true)
    expect(visitante.sigla).toBe('Unión')
  })

  it.each([
    ['AYB VS SM', 3, 1, 'victoria'],
    ['SM VS AYB', 3, 1, 'derrota'],
    ['AYB VS SM', 1, 1, 'empate'],
    ['SERIE HONOR VS SERIE 35', 2, 0, undefined],
  ])('%s %i-%i → %s para AYB', (rival, l, v, esperado) => {
    expect(desenlaceAYB({ ...evento('2026-01-01'), rival, resultado: { local: l, visitante: v } })).toBe(esperado)
  })

  it('sin resultado no hay desenlace', () => {
    expect(desenlaceAYB({ ...evento('2026-01-01'), rival: 'AYB VS SM' })).toBeUndefined()
  })

  it('arma los equipos de partidos y entrenamientos "X vs Y", y de nada más', () => {
    expect(equiposDeEvento({ ...evento('2026-01-01'), rival: 'AYB VS SM' })?.visitante.sigla).toBe('SM')
    expect(equiposDeEvento({ ...evento('2026-01-01', 'entrenamiento'), actividad: 'Serie Honor vs Serie 35' })?.local.sigla).toBe('Serie Honor')
    expect(equiposDeEvento({ ...evento('2026-01-01', 'entrenamiento'), actividad: 'Físico' })).toBeNull()
    expect(equiposDeEvento({ ...evento('2026-01-01', 'evento'), titulo: 'Asado' })).toBeNull()
  })

  it('fechaLarga capitaliza solo el día', () => {
    expect(fechaLarga({ dia: 'MIÉRCOLES', diaMes: 7, mes: 'OCTUBRE' })).toBe('Miércoles 7 de octubre')
  })
})

describe('página de partidos', () => {
  const lista = [
    { ...evento('2026-10-10'), id: 'a' },
    { ...evento('2026-10-17', 'entrenamiento'), id: 'b' },
    { ...evento('2026-10-17'), id: 'c' },
    { ...evento('2026-10-18'), id: 'd1' },
    { ...evento('2026-10-18'), id: 'd2' },
    { ...evento('2026-10-03'), id: 'e1' },
    { ...evento('2026-10-03'), id: 'e2' },
    { ...evento('2026-10-12', 'evento'), id: 'f' },
  ]

  it('separa lo de hoy en adelante de los partidos ya jugados', () => {
    const { proximos, jugados } = separarProgramacion(lista, '2026-10-17')
    expect(proximos.map((e) => e.id)).toEqual(['b', 'c', 'd1', 'd2'])
    // Del más reciente al más antiguo, sin entrenamientos ni eventos, y por hora dentro del día
    expect(jugados.map((e) => e.id)).toEqual(['a', 'e1', 'e2'])
  })

  it('agrupa por día conservando el orden', () => {
    const { proximos } = separarProgramacion(lista, '2026-10-17')
    expect(agruparPorDia(proximos).map((g) => [g.fecha, g.eventos.length])).toEqual([
      ['2026-10-17', 2],
      ['2026-10-18', 2],
    ])
    expect(agruparPorDia([])).toEqual([])
  })
})
