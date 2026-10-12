import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { revalidarSitio } from '@/lib/admin/revalidar'
import { parseTags, slugify } from '@/lib/admin/slug'
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
    ['estado desconocido', { estado: 'Retirado' }],
    ['nacionalidad fuera del listado', { nacionalidad: 'España' }],
  ])('rechaza %s', (_caso, cambio) => {
    expect(jugadorSchema.safeParse({ ...VALIDO, ...cambio }).success).toBe(false)
  })

  it('permite dejar email y foto vacíos', () => {
    expect(jugadorSchema.safeParse({ ...VALIDO, email: '', foto_url: '' }).success).toBe(true)
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
