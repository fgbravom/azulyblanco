import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simularSesion } from '../helpers/sesion'
import { argsDe, crearSupabaseFalso, uso, type Responder } from '../helpers/supabase-falso'
import type { ActividadInput, GolInput } from '@/lib/contenido/tipos'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { guardarActividad } = await import('@/app/(admin)/admin/programacion/actions')
const { golesAGuardar, golVacio } = await import('@/components/admin/programacion/GolesPartido')

function conBase(responder: Responder = () => ({ data: { id: 'p1' } })) {
  const falso = crearSupabaseFalso(responder)
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return falso
}

function partido(parcial: Partial<ActividadInput> = {}): ActividadInput {
  return {
    tipo: 'partido', fecha: '2026-10-18', hora_inicio: null, hora_fin: null, rival: 'AYB VS SM', rival_id: null,
    tipo_partido: 'Amistoso', actividad: null, titulo: null, descripcion: null, estadio: '', estadio_id: null, confirmado: true,
    llevar: null, precio_entrada: null, edad_gratis: null, series: [], goles_local: 2, goles_visitante: 1,
    publicado: true,
    ...parcial,
  }
}

const gol = (parcial: Partial<GolInput>): GolInput => ({ ...golVacio('local'), ...parcial })

describe('guardarActividad con goleadores', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(true)
  })

  it('reemplaza los goles del partido y los numera dentro de cada lado', async () => {
    const falso = conBase()
    await guardarActividad('p1', partido(), [
      gol({ autor_id: 7, asistencia_id: 9 }),
      gol({ en_contra: true }),
    ])

    const [borrado, insercion] = falso.a('goles')
    expect(uso(borrado, 'delete')).toBe(true)
    expect(argsDe(borrado, 'eq')).toEqual(['programacion_id', 'p1'])
    expect(argsDe(insercion, 'insert')?.[0]).toEqual([
      { lado: 'local', autor_id: 7, asistencia_id: 9, en_contra: false, programacion_id: 'p1', orden: 0 },
      { lado: 'local', autor_id: null, asistencia_id: null, en_contra: true, programacion_id: 'p1', orden: 1 },
    ])
  })

  it('guarda el autogol de un jugador de AYB en el lado del rival', async () => {
    const falso = conBase()
    await guardarActividad('p1', partido({ goles_local: 0, goles_visitante: 1 }), [
      gol({ lado: 'visitante', autor_id: 7, en_contra: true }),
    ])

    expect(argsDe(falso.a('goles')[1], 'insert')?.[0]).toEqual([
      { lado: 'visitante', autor_id: 7, asistencia_id: null, en_contra: true, programacion_id: 'p1', orden: 0 },
    ])
  })

  it('sin resultado borra los goleadores', async () => {
    const falso = conBase()
    await guardarActividad('p1', partido({ goles_local: null, goles_visitante: null }), [gol({ autor_id: 7 })])

    const goles = falso.a('goles')
    expect(goles).toHaveLength(1)
    expect(uso(goles[0], 'delete')).toBe(true)
  })

  it('con goles null no toca los goleadores guardados', async () => {
    const falso = conBase()
    await guardarActividad('p1', partido(), null)
    expect(falso.a('goles')).toHaveLength(0)
  })

  it.each([
    ['más goleadores que goles', [gol({ autor_id: 1 }), gol({ autor_id: 2 }), gol({ autor_id: 3 })], /más goleadores/],
    ['un gol sin goleador', [gol({})], /goleador/],
    ['un jugador que se asiste a sí mismo', [gol({ autor_id: 4, asistencia_id: 4 })], /sí mismo/],
    ['un autogol del rival con autor en el lado de AYB', [gol({ autor_id: 4, en_contra: true })], /goleador/],
    ['un gol normal en el lado del rival', [gol({ lado: 'visitante', autor_id: 4 })], /solo se registran autogoles/],
    ['un autogol sin autor en el lado del rival', [gol({ lado: 'visitante', en_contra: true })], /solo se registran autogoles/],
    ['un autogol con asistencia', [gol({ lado: 'visitante', autor_id: 4, asistencia_id: 5, en_contra: true })], /asistencia/],
  ])('rechaza %s sin guardar nada', async (_caso, goles, mensaje) => {
    const falso = conBase()
    await expect(guardarActividad('p1', partido(), goles)).rejects.toThrow(mensaje)
    expect(falso.consultas).toHaveLength(0)
  })
})

describe('golesAGuardar', () => {
  it('toma solo las filas que caben en el resultado y tienen goleador', () => {
    const goles = {
      local: [gol({ autor_id: 1 }), golVacio('local'), gol({ en_contra: true }), gol({ autor_id: 2 })],
      visitante: [gol({ lado: 'visitante', autor_id: 5 })],
    }
    expect(golesAGuardar(goles, [{ lado: 'local', cantidad: 3 }])).toEqual([
      gol({ autor_id: 1 }),
      gol({ en_contra: true }),
    ])
  })
})
