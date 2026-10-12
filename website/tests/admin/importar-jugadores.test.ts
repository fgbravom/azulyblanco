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
  existentes: [
    { id: 50, nombre: 'Pedro', apellidos: 'Crisosto San Martín', equipo_id: 20, pie_preferido: 'Derecho', posiciones: [32, 2] },
    { id: 60, nombre: 'Luis', apellidos: 'Soto Rojas', equipo_id: 11, pie_preferido: null, posiciones: [2] },
    { id: 70, nombre: 'Juan', apellidos: 'Díaz Mora', equipo_id: 11, pie_preferido: null, posiciones: [2] },
    { id: 71, nombre: 'Juan', apellidos: 'Diaz Mora', equipo_id: 20, pie_preferido: null, posiciones: [2] },
  ],
}

// Cabecera tal como la exporta Notion: BOM, espacio inicial y emoji
const CABECERA =
  String.fromCharCode(0xfeff) +
  'Nombres,Apellido Paterno," Apellido Materno",Serie,Pierna habil,Posicion preferida⭐,Posición 2,Posición 3,Posición 4'

function csv(...filas: string[]) {
  return [CABECERA, ...filas].join('\n')
}

const CONFLICTO = 'respondió 2 veces con datos distintos (filas 2, 4); deja una sola respuesta en Notion'

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

  it('reconoce al jugador que ya está en el plantel sin importar tildes ni mayúsculas', () => {
    const [fila] = planificarImportacion(csv('pedro,CRISOSTO,San Martin,35,Derecha,VOL I,DFC,,'), referencia)
    expect(fila).toMatchObject({ estado: 'sin cambios', jugadorId: 50, cambios: [], actualizacion: null })
  })

  it('actualiza solo lo que cambió en un jugador que ya existe', () => {
    const [fila] = planificarImportacion(csv('Pedro,Crisosto,San Martín,Primera,Izquierda,DFC,VOL I,,'), referencia)
    expect(fila.estado).toBe('actualizar')
    expect(fila.jugadorId).toBe(50)
    expect(fila.actualizacion).toEqual({ campos: { equipo_id: 11, pie_preferido: 'Izquierdo' }, posicionesIds: [2, 32] })
    expect(fila.cambios).toEqual([
      'Serie: Azul y Blanco - 35 → Azul y Blanco - Primera (2026)',
      'Pie: Derecho → Izquierdo',
      'Posiciones: VOL I, DFC → DFC, VOL I',
    ])
  })

  it('sin pie en el formulario conserva el que tenía', () => {
    const [fila] = planificarImportacion(csv('Pedro,Crisosto,San Martín,35,,VOL I,DFC,,'), referencia)
    expect(fila.estado).toBe('sin cambios')
  })

  it('toma una vez a quien respondió repetido con los mismos datos', () => {
    const filas = planificarImportacion(
      csv('Ana,Pérez,Soto,35,Derecha,DFC,,,', 'ana,perez,soto,35,Derecha,DFC,,,'),
      referencia
    )
    expect(filas.map((f) => f.estado)).toEqual(['nuevo', 'repetido en el CSV'])
  })

  it('no toca a quien respondió repetido con datos distintos: no se sabe cuál respuesta vale', () => {
    const filas = planificarImportacion(
      csv(
        'Pedro,Crisosto,San Martín,35,Derecha,MO,,,',
        'Ana,Pérez,Soto,35,Derecha,DFC,,,',
        'Pedro,Crisosto,San Martín,35,Derecha,MO,MDC,,'
      ),
      referencia
    )
    expect(filas.map((f) => [f.estado, f.detalle])).toEqual([
      ['error', CONFLICTO],
      ['nuevo', ''],
      ['error', CONFLICTO],
    ])
  })

  it('no adivina si hay dos jugadores con el mismo nombre en el plantel', () => {
    const [fila] = planificarImportacion(csv('Juan,Díaz,Mora,35,Derecha,DFC,,,'), referencia)
    expect(fila.estado).toBe('error')
    expect(fila.detalle).toMatch(/hay 2 jugadores con este nombre/)
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
  updateJugador: vi.fn(async (id: number, j: object) => ({ id, ...j })),
  setPosicionesJugador: vi.fn(async () => {}),
}))
// Las tablas como las devuelve Supabase: posiciones en jugador_posiciones, en
// cualquier orden, y jugadores antiguos con solo posicion_id
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (tabla: string) => ({
      select: async () => ({
        data:
          tabla === 'jugadores'
            ? referencia.existentes.map(({ posiciones, ...j }) => ({
                ...j,
                posicion_id: posiciones[0],
                jugador_posiciones:
                  j.id === 60 ? [] : posiciones.map((posicion_id, orden) => ({ posicion_id, orden })).reverse(),
              }))
            : referencia[tabla as keyof DatosReferencia],
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
  const archivo = csv(
    'Pedro,Crisosto,San Martin,35,Derecha,VOL I,DFC,,',
    'Ana,Pérez,Soto,Primera,Izquierda,DFC,MCO,,',
    'Luis,Soto,Rojas,Primera,,DFC,MDC,,'
  )

  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(true)
  })

  it('sin aplicar solo devuelve el plan', async () => {
    const res = await llamar({ csv: archivo })
    expect(res.status).toBe(200)
    const { data } = await res.json()
    expect(data.filas.map((f: { estado: string }) => f.estado)).toEqual(['sin cambios', 'nuevo', 'actualizar'])
    expect(data.importados).toBe(0)
    expect(data.actualizados).toBe(0)
    expect(datos.createJugador).not.toHaveBeenCalled()
    expect(datos.updateJugador).not.toHaveBeenCalled()
    expect(datos.setPosicionesJugador).not.toHaveBeenCalled()
  })

  it('con aplicar crea los nuevos y actualiza solo lo que cambió en los existentes', async () => {
    const res = await llamar({ csv: archivo, aplicar: true })
    const { data } = await res.json()
    expect(data).toMatchObject({ importados: 1, actualizados: 1, fallidos: [] })

    expect(datos.createJugador).toHaveBeenCalledTimes(1)
    expect(datos.createJugador).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Ana', apellidos: 'Pérez Soto', equipo_id: 11, posicion_id: 2, pie_preferido: 'Izquierdo' })
    )
    expect(datos.setPosicionesJugador).toHaveBeenCalledWith(99, [2, 7])

    // Luis solo cambió de posiciones: no hay campos que escribir en jugadores
    expect(datos.updateJugador).not.toHaveBeenCalled()
    expect(datos.setPosicionesJugador).toHaveBeenCalledWith(60, [2, 5])
    expect(datos.setPosicionesJugador).toHaveBeenCalledTimes(2)
  })

  it('escribe la serie y el pie cuando cambian', async () => {
    await llamar({ csv: csv('Pedro,Crisosto,San Martin,Primera,Izquierda,VOL I,DFC,,'), aplicar: true })
    expect(datos.updateJugador).toHaveBeenCalledWith(50, { equipo_id: 11, pie_preferido: 'Izquierdo' })
    expect(datos.setPosicionesJugador).not.toHaveBeenCalled()
  })

  it('informa el jugador que no se pudo guardar y sigue con el resto', async () => {
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
