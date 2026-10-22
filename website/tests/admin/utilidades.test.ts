import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { revalidarSitio } from '@/lib/admin/revalidar'
import { parseTags, slugify } from '@/lib/admin/slug'
import { arrastrarFoco, desbordeImagen, focoDe, FOCO_CENTRO, posicionCSS } from '@/lib/contenido/foco'
import { jugadorSchema, parsePosiciones } from '@/lib/validations/jugador'

describe('slugify', () => {
  it.each([
    ['Gran Final: AYB vs Unión', 'gran-final-ayb-vs-union'],
    ['  ¡Campeones 2026!  ', 'campeones-2026'],
    ['Ñuñoa & Peñalolén', 'nunoa-penalolen'],
    ['---', ''],
  ])('%j → %j', (texto, esperado) => {
    expect(slugify(texto)).toBe(esperado)
  })

  it('no supera 80 caracteres y solo usa caracteres seguros para una URL', () => {
    const slug = slugify('Una noticia con un título larguísimo '.repeat(10))
    expect(slug.length).toBeLessThanOrEqual(80)
    expect(slugify('<script>alert(1)</script> ../../etc')).toMatch(/^[a-z0-9-]*$/)
  })
})

describe('parseTags', () => {
  it('separa por comas, recorta y descarta vacíos', () => {
    expect(parseTags(' final, honor ,, 2026 ,')).toEqual(['final', 'honor', '2026'])
    expect(parseTags('')).toEqual([])
  })
})

describe('parsePosiciones', () => {
  it('sin arreglo devuelve undefined (el cuerpo no trae posiciones)', () => {
    expect(parsePosiciones(undefined)).toBeUndefined()
    expect(parsePosiciones('3')).toBeUndefined()
  })

  it('convierte a número y descarta ids inválidos', () => {
    expect(parsePosiciones(['3', 5, 0, -1, 2.5, 'abc', null])).toEqual([3, 5])
  })
})

describe('jugadorSchema', () => {
  const VALIDO = { nombre: 'Ana', apellidos: 'Pérez', equipo_id: 1, posiciones_ids: [3] }

  it('acepta lo mínimo', () => {
    expect(jugadorSchema.safeParse(VALIDO).success).toBe(true)
  })

  it.each([
    ['sin nombre', { nombre: '' }],
    ['sin posiciones', { posiciones_ids: [] }],
    ['dorsal 0', { dorsal: 0 }],
    ['dorsal 100', { dorsal: 100 }],
    ['email inválido', { email: 'no-es-email' }],
    ['foto que no es URL', { foto_url: 'javascript:alert(1)' }],
    ['encuadre de la foto fuera de rango', { foto_foco_x: 101 }],
    ['encuadre de la foto con decimales', { foto_foco_y: 12.5 }],
    ['estado desconocido', { estado: 'Retirado' }],
    ['nacionalidad fuera del listado', { nacionalidad: 'España' }],
  ])('rechaza %s', (_caso, cambio) => {
    expect(jugadorSchema.safeParse({ ...VALIDO, ...cambio }).success).toBe(false)
  })

  it('permite dejar email y foto vacíos', () => {
    expect(jugadorSchema.safeParse({ ...VALIDO, email: '', foto_url: '' }).success).toBe(true)
  })

  it('permite la foto sin ajustar y con encuadre', () => {
    expect(jugadorSchema.safeParse({ ...VALIDO, foto_foco_x: null, foto_foco_y: null }).success).toBe(true)
    expect(jugadorSchema.safeParse({ ...VALIDO, foto_foco_x: 30, foto_foco_y: 70 }).success).toBe(true)
  })
})

describe('encuadre de las fotos', () => {
  it('focoDe junta el encuadre guardado, o null si la foto está sin ajustar', () => {
    expect(focoDe(30, 70)).toEqual({ x: 30, y: 70 })
    expect(focoDe(30, null)).toBeNull()
    expect(focoDe(undefined, undefined)).toBeNull()
  })

  it('posicionCSS arma el object-position y respeta una fila sin encuadre', () => {
    expect(posicionCSS({ x: 30, y: 70 })).toBe('30% 70%')
    expect(posicionCSS(FOCO_CENTRO)).toBe('50% 50%')
    expect(posicionCSS({ x: 30 })).toBeUndefined()
    expect(posicionCSS(undefined)).toBeUndefined()
  })

  it('desbordeImagen mide cuánto sobra la foto al cubrir el marco', () => {
    expect(desbordeImagen(300, 200, 150, 150)).toEqual({ x: 75, y: 0 })
    expect(desbordeImagen(200, 300, 150, 150)).toEqual({ x: 0, y: 75 })
    // Una foto que aún no cargó no tiene dónde moverse
    expect(desbordeImagen(0, 0, 150, 150)).toEqual({ x: 0, y: 0 })
  })

  it('arrastrarFoco mueve la foto, no el encuadre, y solo donde la foto sobra', () => {
    expect(arrastrarFoco({ x: 50, y: 50 }, 25, 0, { x: 100, y: 0 })).toEqual({ x: 25, y: 50 })
    expect(arrastrarFoco({ x: 50, y: 50 }, 0, 25, { x: 100, y: 0 })).toEqual({ x: 50, y: 50 })
  })

  it('el encuadre se queda entre 0 y 100', () => {
    expect(arrastrarFoco({ x: 50, y: 50 }, -200, 0, { x: 100, y: 0 })).toEqual({ x: 100, y: 50 })
    expect(arrastrarFoco({ x: 50, y: 50 }, 200, 0, { x: 100, y: 0 })).toEqual({ x: 0, y: 50 })
    expect(arrastrarFoco({ x: 50, y: 50 }, 0, 200, { x: 0, y: 100 })).toEqual({ x: 50, y: 0 })
  })
})

describe('revalidarSitio', () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear()
  })

  it.each([
    ['programacion', [['/'], ['/partidos']]],
    ['noticias', [['/'], ['/noticias', 'layout']]],
    ['galeria', [['/galeria', 'layout']]],
    ['series', [['/series', 'layout']]],
  ] as const)('%s regenera sus páginas públicas', (seccion, rutas) => {
    revalidarSitio(seccion)
    expect(vi.mocked(revalidatePath).mock.calls).toEqual(rutas)
  })
})
