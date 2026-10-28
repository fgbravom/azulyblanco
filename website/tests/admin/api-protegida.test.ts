import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simularSesion } from '../helpers/sesion'

type Handler = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<Response>

// La capa de datos se reemplaza por espías: una ruta sin sesión no debe tocarla
vi.mock('@/lib/data/jugadores', () => ({
  getJugadores: vi.fn(async () => ({ data: [{ id: 1 }], total: 1, page: 1, pageSize: 50, totalPages: 1 })),
  getJugadorById: vi.fn(async (id: number) => (id === 1 ? { id: 1, nombre: 'Juan' } : null)),
  createJugador: vi.fn(async (j: object) => ({ id: 99, ...j })),
  updateJugador: vi.fn(async (id: number, j: object) => ({ id, ...j })),
  deleteJugador: vi.fn(async () => {}),
  deleteJugadorPermanente: vi.fn(async () => {}),
  setPosicionesJugador: vi.fn(async () => {}),
  setActivoJugadores: vi.fn(async (ids: number[]) => ids.length),
  resumenDatosJugadores: vi.fn(async () => ({ cuotas: 0, pagos: 0, montoPagado: 0 })),
  eliminarInactivosPermanente: vi.fn(async (ids: number[]) => ids.length),
}))
vi.mock('@/lib/data/equipos', () => ({
  COLUMNAS_EQUIPO: 'id, nombre',
  getEquipos: vi.fn(async () => []),
  getEquiposTemporadaActual: vi.fn(async () => []),
  getCategorias: vi.fn(async () => []),
  getPosiciones: vi.fn(async () => []),
}))
vi.mock('@/lib/data/estadisticas', () => ({
  getEstadisticasPartido: vi.fn(async () => []),
  getEstadisticasJugador: vi.fn(async () => []),
  createEstadisticaPartido: vi.fn(async () => ({})),
  createEstadisticasPartido: vi.fn(async () => []),
  getMaximosGoleadores: vi.fn(async () => []),
  getMaximosAsistentes: vi.fn(async () => []),
  updateEstadisticaPartido: vi.fn(async () => ({})),
  deleteEstadisticaPartido: vi.fn(async () => {}),
}))
vi.mock('@/lib/data/partidos', () => ({
  getPartidos: vi.fn(async () => ({ data: [], total: 0, page: 1, pageSize: 50, totalPages: 0 })),
  createPartido: vi.fn(async () => ({})),
  getPartidoById: vi.fn(async () => null),
  updatePartido: vi.fn(async () => ({})),
  updateResultadoPartido: vi.fn(async () => ({})),
  deletePartido: vi.fn(async () => {}),
}))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const datos = {
  jugadores: await import('@/lib/data/jugadores'),
  equipos: await import('@/lib/data/equipos'),
  estadisticas: await import('@/lib/data/estadisticas'),
  partidos: await import('@/lib/data/partidos'),
}
const { createClient } = await import('@/lib/supabase/server')
const { createAdminClient } = await import('@/lib/supabase/admin')

// Todas las rutas /api salvo login/logout, descubiertas solas: una ruta nueva
// queda cubierta sin tocar esta prueba
const rutas = Object.fromEntries(
  Object.entries(import.meta.glob('/app/api/**/route.ts', { eager: true }))
    .filter(([archivo]) => !archivo.startsWith('/app/api/auth/'))
    .map(([archivo, modulo]) => [archivo.replace(/^\/app/, '').replace(/\/route\.ts$/, ''), modulo])
) as Record<string, Record<string, Handler>>

const METODOS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const

const casos = Object.entries(rutas).flatMap(([ruta, modulo]) =>
  METODOS.filter((m) => m in modulo).map((metodo) => ({
    ruta,
    metodo,
    handler: modulo[metodo],
  }))
)

function llamar(handler: Handler, metodo: string, url: string, body?: unknown) {
  const req = new NextRequest(`https://azulyblanco.com${url}`, {
    method: metodo,
    ...(body !== undefined && { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  })
  return handler(req, { params: Promise.resolve({ id: '1' }) })
}

function capaDeDatosIntacta() {
  for (const modulo of Object.values(datos)) {
    for (const fn of Object.values(modulo)) {
      if (vi.isMockFunction(fn)) expect(fn).not.toHaveBeenCalled()
    }
  }
  expect(createClient).not.toHaveBeenCalled()
  expect(createAdminClient).not.toHaveBeenCalled()
}

describe('rutas /api sin sesión (por si el middleware fallara)', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(false)
  })

  it('encuentra todas las rutas del admin', () => {
    expect(Object.keys(rutas)).toEqual(
      expect.arrayContaining(['/api/jugadores', '/api/jugadores/[id]', '/api/equipos', '/api/partidos'])
    )
    expect(casos.length).toBeGreaterThanOrEqual(15)
  })

  it.each(casos)('$metodo $ruta responde 401 sin leer ni escribir datos', async ({ handler, metodo, ruta }) => {
    const body = metodo === 'GET' ? undefined : { nombre: 'Atacante' }
    const res = await llamar(handler, metodo, ruta.replace('[id]', '1'), body)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'No autorizado' })
    capaDeDatosIntacta()
  })
})

describe('rutas /api con sesión', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(true)
  })

  it('GET /api/jugadores devuelve los jugadores y la paginación', async () => {
    const res = await llamar(rutas['/api/jugadores'].GET, 'GET', '/api/jugadores?activo=true&equipo_id=2&busqueda=juan')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual([{ id: 1 }])
    expect(body.pagination.total).toBe(1)
    expect(datos.jugadores.getJugadores).toHaveBeenCalledWith(
      { activo: true, equipo_id: 2, busqueda: 'juan' },
      {}
    )
  })

  it('GET /api/jugadores/[id] responde 404 si no existe y 400 si el id no es número', async () => {
    const { GET } = rutas['/api/jugadores/[id]']
    const req = new NextRequest('https://azulyblanco.com/api/jugadores/5')
    expect((await GET(req, { params: Promise.resolve({ id: '5' }) })).status).toBe(404)
    expect((await GET(req, { params: Promise.resolve({ id: 'abc' }) })).status).toBe(400)
  })

  it('POST /api/jugadores exige nombre, apellidos, equipo y al menos una posición', async () => {
    const { POST } = rutas['/api/jugadores']
    const sinPosicion = await llamar(POST, 'POST', '/api/jugadores', { nombre: 'A', apellidos: 'B', equipo_id: 1, posiciones_ids: [] })
    expect(sinPosicion.status).toBe(400)
    expect(datos.jugadores.createJugador).not.toHaveBeenCalled()
  })

  it('POST /api/jugadores usa la primera posición como principal y guarda todas', async () => {
    const { POST } = rutas['/api/jugadores']
    const res = await llamar(POST, 'POST', '/api/jugadores', {
      nombre: 'Ana',
      apellidos: 'Pérez',
      equipo_id: 1,
      posiciones_ids: [3, 5],
    })
    expect(res.status).toBe(201)
    expect(datos.jugadores.createJugador).toHaveBeenCalledWith(expect.objectContaining({ posicion_id: 3 }))
    expect(datos.jugadores.setPosicionesJugador).toHaveBeenCalledWith(99, [3, 5])
  })

  it('POST /api/jugadores no deja fijar campos internos como el código de cuotas', async () => {
    const { POST } = rutas['/api/jugadores']
    await llamar(POST, 'POST', '/api/jugadores', {
      nombre: 'Ana',
      apellidos: 'Pérez',
      equipo_id: 1,
      posiciones_ids: [3],
      codigo_cuotas: 'a'.repeat(32),
      id: 1,
    })
    const insertado = vi.mocked(datos.jugadores.createJugador).mock.calls[0][0]
    expect(insertado).not.toHaveProperty('codigo_cuotas')
    expect(insertado).not.toHaveProperty('id')
  })

  it('PATCH /api/jugadores/[id] rechaza dejar al jugador sin posiciones', async () => {
    const { PATCH } = rutas['/api/jugadores/[id]']
    const res = await llamar(PATCH, 'PATCH', '/api/jugadores/1', { posiciones_ids: [] })
    expect(res.status).toBe(400)
    expect(datos.jugadores.updateJugador).not.toHaveBeenCalled()
  })

  it('PATCH /api/jugadores/[id] solo envía los campos que vienen en el cuerpo', async () => {
    const { PATCH } = rutas['/api/jugadores/[id]']
    await llamar(PATCH, 'PATCH', '/api/jugadores/1', { telefono: '+56 9 1111 2222' })
    expect(datos.jugadores.updateJugador).toHaveBeenCalledWith(1, { telefono: '+56 9 1111 2222' })
    expect(datos.jugadores.setPosicionesJugador).not.toHaveBeenCalled()
  })

  it('POST /api/jugadores/masivo valida los ids y la acción antes de tocar datos', async () => {
    const { POST } = rutas['/api/jugadores/masivo']
    for (const body of [
      { ids: [], accion: 'baja' },
      { ids: ['1'], accion: 'baja' },
      { ids: [1.5], accion: 'baja' },
      { ids: [1], accion: 'borrar-todo' },
    ]) {
      expect((await llamar(POST, 'POST', '/api/jugadores/masivo', body)).status).toBe(400)
    }
    expect(datos.jugadores.setActivoJugadores).not.toHaveBeenCalled()
    expect(datos.jugadores.eliminarInactivosPermanente).not.toHaveBeenCalled()
  })

  it('POST /api/jugadores/masivo da de baja, reactiva y elimina sin repetir ids', async () => {
    const { POST } = rutas['/api/jugadores/masivo']

    await llamar(POST, 'POST', '/api/jugadores/masivo', { ids: [1, 2, 2], accion: 'baja' })
    expect(datos.jugadores.setActivoJugadores).toHaveBeenLastCalledWith([1, 2], false)

    await llamar(POST, 'POST', '/api/jugadores/masivo', { ids: [3], accion: 'reactivar' })
    expect(datos.jugadores.setActivoJugadores).toHaveBeenLastCalledWith([3], true)

    const res = await llamar(POST, 'POST', '/api/jugadores/masivo', { ids: [4, 5], accion: 'eliminar' })
    expect(datos.jugadores.eliminarInactivosPermanente).toHaveBeenCalledWith([4, 5])
    expect((await res.json()).data).toEqual({ afectados: 2 })
  })

  it('GET /api/jugadores/masivo resume las cuotas y pagos que se perderían', async () => {
    const { GET } = rutas['/api/jugadores/masivo']
    const res = await llamar(GET, 'GET', '/api/jugadores/masivo?ids=1,2')
    expect(datos.jugadores.resumenDatosJugadores).toHaveBeenCalledWith([1, 2])
    expect((await res.json()).data).toEqual({ cuotas: 0, pagos: 0, montoPagado: 0 })
    expect((await llamar(GET, 'GET', '/api/jugadores/masivo?ids=abc')).status).toBe(400)
  })

  it('DELETE /api/jugadores/[id] es baja lógica salvo que se pida permanente', async () => {
    const { DELETE } = rutas['/api/jugadores/[id]']
    await llamar(DELETE, 'DELETE', '/api/jugadores/1')
    expect(datos.jugadores.deleteJugador).toHaveBeenCalledWith(1)
    expect(datos.jugadores.deleteJugadorPermanente).not.toHaveBeenCalled()

    await llamar(DELETE, 'DELETE', '/api/jugadores/1?permanente=true')
    expect(datos.jugadores.deleteJugadorPermanente).toHaveBeenCalledWith(1)
  })
})
