import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simularSesion } from '../helpers/sesion'
import { planificarImportacion, type DatosReferencia } from '@/lib/jugadores/importar-csv'

const referencia: DatosReferencia = {
  posiciones: [
    { id: 1, abreviatura: 'POR' },
    { id: 2, abreviatura: 'DFC' },
    { id: 5, abreviatura: 'MDC' },
    { id: 7, abreviatura: 'MO' },
    { id: 32, abreviatura: 'VOL I' },
  ],
  categorias: [
    { id: 1, nombre: 'Primera' },
    { id: 3, nombre: '35' },
  ],
  equipos: [
    { id: 10, nombre: 'Azul y Blanco - Primera', categoria_id: 1, temporada: '2025', activo: true },
    { id: 11, nombre: 'Azul y Blanco - Primera', categoria_id: 1, temporada: '2026', activo: true },
    { id: 12, nombre: 'Azul y Blanco - Primera', categoria_id: 1, temporada: '2027', activo: false },
    { id: 20, nombre: 'Azul y Blanco - 35', categoria_id: 3, temporada: '2026', activo: true },
  ],
  existentes: [{ nombre: 'Pedro', apellidos: 'Crisosto San Martín' }],
}

// Cabecera tal como la exporta Notion: BOM, espacio inicial y emoji
const CABECERA =
  '﻿Nombres,Apellido Paterno," Apellido Materno",Serie,Pierna habil,Posicion preferida⭐,Posición 2,Posición 3,Posición 4'

function csv(...filas: string[]) {
  return [CABECERA, ...filas].join('\n')
}

describe('planificarImportacion', () => {
  it('normaliza nombres, traduce siglas del formulario y elige el equipo activo más reciente', () => {
    const [fila] = planificarImportacion(
      csv('"gabriel benjamin ","Arriaza ","de la fuente ",Primera,"Derecha, Izquierda",MCD,MCO,MCD,PT'),
      referencia
    )
    expect(fila.estado).toBe('nuevo')
    expect(fila.jugador).toEqual({
      nombre: 'Gabriel Benjamin',
      apellidos: 'Arriaza De la Fuente',
      equipo_id: 11,
      posicion_id: 5,
      pie_preferido: 'Ambidiestro',
      nacionalidad: 'Chile',
    })
    expect(fila.posiciones).toEqual(['MDC', 'MO', 'POR'])
    expect(fila.posicionesIds).toEqual([5, 7, 1])
  })

  it('salta a los que ya están en la base (sin importar tildes) y los repetidos del archivo', () => {
    const filas = planificarImportacion(
      csv(
        'Pedro,Crisosto,San Martin,35,Derecha,VOL I,,,',
        'Ana,Pérez,Soto,35,Derecha,DFC,,,',
        'ana,perez,soto,35,Derecha,DFC,,,'
      ),
      referencia
    )
    expect(filas.map((f) => [f.linea, f.estado])).toEqual([
      [2, 'ya existe'],
      [3, 'nuevo'],
      [4, 'repetido en el CSV'],
    ])
  })

  it('marca con error las filas con serie o posición desconocida, o sin posiciones', () => {
    const filas = planificarImportacion(
      csv('Ana,Pérez,Soto,Sub 17,Derecha,DFC,,,', 'Eva,Rojas,Lara,35,Derecha,XYZ,,,', 'Iván,Mora,Vera,35,Derecha,,,,'),
      referencia
    )
    expect(filas.map((f) => [f.estado, f.detalle])).toEqual([
      ['error', 'serie desconocida "Sub 17"'],
      ['error', 'posición desconocida "XYZ"'],
      ['error', 'sin posiciones'],
    ])
  })

  it('rechaza un archivo que no es el del formulario', () => {
    expect(() => planificarImportacion('nombre,email\nAna,a@b.cl', referencia)).toThrow(/columna "nombres"/)
  })
})

vi.mock('@/lib/data/jugadores', () => ({
  createJugador: vi.fn(async (j: object) => ({ id: 99, ...j })),
  setPosicionesJugador: vi.fn(async () => {}),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (tabla: string) => ({
      select: async () => ({
        data: tabla === 'jugadores' ? referencia.existentes : referencia[tabla as keyof DatosReferencia],
        error: null,
      }),
    }),
  }),
}))

const { POST } = await import('@/app/api/jugadores/importar/route')
const datos = await import('@/lib/data/jugadores')

function llamar(body: unknown) {
  return POST(
    new NextRequest('https://azulyblanco.com/api/jugadores/importar', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  )
}

describe('POST /api/jugadores/importar', () => {
  const archivo = csv('Pedro,Crisosto,San Martin,35,Derecha,VOL I,,,', 'Ana,Pérez,Soto,Primera,Izquierda,DFC,MCO,,')

  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(true)
  })

  it('sin aplicar solo devuelve el plan', async () => {
    const res = await llamar({ csv: archivo })
    expect(res.status).toBe(200)
    const { data } = await res.json()
    expect(data.filas.map((f: { estado: string }) => f.estado)).toEqual(['ya existe', 'nuevo'])
    expect(data.importados).toBe(0)
    expect(datos.createJugador).not.toHaveBeenCalled()
  })

  it('con aplicar crea solo los nuevos, con todas sus posiciones', async () => {
    const res = await llamar({ csv: archivo, aplicar: true })
    const { data } = await res.json()
    expect(data.importados).toBe(1)
    expect(datos.createJugador).toHaveBeenCalledTimes(1)
    expect(datos.createJugador).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Ana', apellidos: 'Pérez Soto', equipo_id: 11, posicion_id: 2, pie_preferido: 'Izquierdo' })
    )
    expect(datos.setPosicionesJugador).toHaveBeenCalledWith(99, [2, 7])
  })

  it('informa el jugador que no se pudo crear y sigue con el resto', async () => {
    vi.mocked(datos.createJugador).mockRejectedValueOnce(new Error('Error al crear jugador: duplicado'))
    const res = await llamar({ csv: csv('Ana,Pérez,Soto,35,Derecha,DFC,,,', 'Eva,Rojas,Lara,35,Derecha,DFC,,,'), aplicar: true })
    const { data } = await res.json()
    expect(data.importados).toBe(1)
    expect(data.fallidos).toEqual([{ linea: 2, error: 'Error al crear jugador: duplicado' }])
  })

  it('responde 400 a un archivo vacío o que no es el del formulario', async () => {
    expect((await llamar({ csv: '' })).status).toBe(400)
    const res = await llamar({ csv: 'nombre,email\nAna,a@b.cl', aplicar: true })
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/columna/)
    expect(datos.createJugador).not.toHaveBeenCalled()
  })
})
