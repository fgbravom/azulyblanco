import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NOMBRE_REDACTOR, REDACTOR_ID, filaCuenta, simularSesion } from '../helpers/sesion'
import { argsDe, crearSupabaseFalso, uso, type Consulta, type Responder } from '../helpers/supabase-falso'
import type { NoticiaInput } from '@/lib/contenido/tipos'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { listarNoticias, obtenerNoticia, guardarNoticia, cambiarPublicacionNoticia, eliminarNoticia } = await import(
  '@/app/(admin)/admin/noticias/actions'
)

const AJENO = '99999999-2222-4333-8444-555555555555'

const NOTICIA: NoticiaInput = {
  slug: 'mi-noticia',
  titulo: 'Mi noticia',
  bajada: '',
  contenido: 'Texto',
  categoria: 'Deportes',
  tags: [],
  autor: 'Otro nombre',
  redactor_id: AJENO,
  fecha: '2026-03-01',
  portada_url: null,
  portada_foco_x: 50,
  portada_foco_y: 50,
  publicado: true,
}

// La cuenta del redactor responde siempre; el resto lo decide cada prueba
function conBase(responder: Responder) {
  const falso = crearSupabaseFalso((c) =>
    c.tabla === 'cuentas_panel' ? { data: filaCuenta() } : c.tabla === 'redactores' ? { data: { nombre: 'Ana' } } : responder(c)
  )
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return falso
}

/** Fila previa de la noticia (la lectura con maybeSingle) o su actualización */
const noticiaPrevia =
  (previa: { slug?: string; redactor_id: string | null; publicado: boolean } | null): Responder =>
  (c: Consulta) =>
    c.tabla !== 'noticias' ? undefined : uso(c, 'maybeSingle') ? { data: previa && { slug: 'mi-noticia', ...previa } } : { data: { id: 'n1', slug: 'mi-noticia' } }

const eqs = (c: Consulta) => c.ops.filter((o) => o.metodo === 'eq').map((o) => o.args)
const hizoUpdate = (falso: ReturnType<typeof conBase>) => falso.a('noticias').some((c) => uso(c, 'update'))

describe('noticias con sesión de redactor', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion('colaborador')
  })

  it('listarNoticias filtra por su redactor_id y no consulta despublicaciones', async () => {
    const falso = conBase(() => ({ data: [{ id: 'n1', publicado: false }] }))
    const noticias = await listarNoticias()

    expect(eqs(falso.a('noticias')[0])).toContainEqual(['redactor_id', REDACTOR_ID])
    expect(noticias[0]).not.toHaveProperty('despublicacion')
    expect(falso.a('noticias_despublicaciones')).toHaveLength(0)
  })

  it('obtenerNoticia pide solo las suyas: una ajena es null', async () => {
    const falso = conBase(() => ({ data: null }))
    expect(await obtenerNoticia('n-ajena')).toBeNull()
    expect(eqs(falso.a('noticias')[0])).toEqual([['id', 'n-ajena'], ['redactor_id', REDACTOR_ID]])
  })

  it('guardar una noticia ajena falla sin escribir', async () => {
    const falso = conBase(noticiaPrevia({ redactor_id: AJENO, publicado: false }))
    await expect(guardarNoticia('n1', { ...NOTICIA, publicado: false })).rejects.toThrow('No autorizado')
    expect(hizoUpdate(falso)).toBe(false)
  })

  it('guardar una noticia sin dueño o inexistente también falla', async () => {
    const sinDueno = conBase(noticiaPrevia({ redactor_id: null, publicado: false }))
    await expect(guardarNoticia('n1', NOTICIA)).rejects.toThrow('No autorizado')
    expect(hizoUpdate(sinDueno)).toBe(false)

    conBase(noticiaPrevia(null))
    await expect(guardarNoticia('n1', NOTICIA)).rejects.toThrow('No autorizado')
  })

  it('crear fuerza su redactor_id y su nombre aunque el input traiga otros', async () => {
    const falso = conBase(() => ({ data: { id: 'n1', slug: 'mi-noticia' } }))
    await guardarNoticia(null, NOTICIA)

    expect(argsDe(falso.a('noticias')[0], 'insert')?.[0]).toMatchObject({ redactor_id: REDACTOR_ID, autor: NOMBRE_REDACTOR })
    expect(falso.a('redactores')).toHaveLength(0)
  })

  it('actualizar una propia fuerza su firma y limita el update a sus filas', async () => {
    const falso = conBase(noticiaPrevia({ redactor_id: REDACTOR_ID, publicado: true }))
    await guardarNoticia('n1', NOTICIA)

    const update = falso.a('noticias').find((c) => uso(c, 'update'))!
    expect(argsDe(update, 'update')?.[0]).toMatchObject({ redactor_id: REDACTOR_ID, autor: NOMBRE_REDACTOR })
    expect(eqs(update)).toEqual([['id', 'n1'], ['redactor_id', REDACTOR_ID]])
    // Sigue publicada: nada que registrar
    expect(falso.a('noticias_despublicaciones')).toHaveLength(0)
  })

  it('despublicar sin motivo falla, con un motivo corto o demasiado largo también', async () => {
    const falso = conBase(noticiaPrevia({ redactor_id: REDACTOR_ID, publicado: true }))
    const borrador = { ...NOTICIA, publicado: false }

    await expect(guardarNoticia('n1', borrador)).rejects.toThrow('motivo')
    await expect(guardarNoticia('n1', borrador, { motivoDespublicacion: 'corto' })).rejects.toThrow('al menos 10')
    await expect(guardarNoticia('n1', borrador, { motivoDespublicacion: 'x'.repeat(501) })).rejects.toThrow('500')
    expect(hizoUpdate(falso)).toBe(false)
  })

  it('despublicar con motivo guarda el borrador y registra la despublicación con su id', async () => {
    const falso = conBase(noticiaPrevia({ redactor_id: REDACTOR_ID, publicado: true }))
    await guardarNoticia('n1', { ...NOTICIA, publicado: false }, { motivoDespublicacion: '  Hay un error en el marcador  ' })

    expect(argsDe(falso.a('noticias_despublicaciones')[0], 'insert')?.[0]).toEqual({
      noticia_id: 'n1',
      redactor_id: REDACTOR_ID,
      motivo: 'Hay un error en el marcador',
    })
  })

  it('guardar un borrador que ya lo era o publicar no pide motivo', async () => {
    const falso = conBase(noticiaPrevia({ redactor_id: REDACTOR_ID, publicado: false }))
    await guardarNoticia('n1', { ...NOTICIA, publicado: false })
    await guardarNoticia('n1', NOTICIA)
    expect(falso.a('noticias_despublicaciones')).toHaveLength(0)
  })

  describe('cambiarPublicacionNoticia', () => {
    it('una ajena falla sin escribir', async () => {
      const falso = conBase(noticiaPrevia({ redactor_id: AJENO, publicado: true }))
      await expect(cambiarPublicacionNoticia('n1', false, 'Un motivo suficiente')).rejects.toThrow('No autorizado')
      expect(hizoUpdate(falso)).toBe(false)
    })

    it('despublicar una propia exige motivo y lo registra', async () => {
      const falso = conBase(noticiaPrevia({ redactor_id: REDACTOR_ID, publicado: true }))
      await expect(cambiarPublicacionNoticia('n1', false)).rejects.toThrow('motivo')
      expect(hizoUpdate(falso)).toBe(false)

      await cambiarPublicacionNoticia('n1', false, 'La noticia quedó desactualizada')
      const update = falso.a('noticias').find((c) => uso(c, 'update'))!
      expect(eqs(update)).toEqual([['id', 'n1'], ['redactor_id', REDACTOR_ID]])
      expect(argsDe(falso.a('noticias_despublicaciones')[0], 'insert')?.[0]).toMatchObject({
        noticia_id: 'n1',
        redactor_id: REDACTOR_ID,
      })
    })

    it('publicar una propia no pide motivo', async () => {
      const falso = conBase(noticiaPrevia({ redactor_id: REDACTOR_ID, publicado: false }))
      await cambiarPublicacionNoticia('n1', true)
      expect(hizoUpdate(falso)).toBe(true)
      expect(falso.a('noticias_despublicaciones')).toHaveLength(0)
    })
  })

  it('eliminar una noticia se rechaza', async () => {
    const falso = conBase(() => ({ data: { slug: 'x' } }))
    await expect(eliminarNoticia('n1')).rejects.toThrow('No autorizado')
    expect(falso.a('noticias')).toHaveLength(0)
  })
})

describe('noticias con sesión de admin', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion('admin')
  })

  it('despublica sin motivo y lo registra con el motivo vacío', async () => {
    const falso = conBase(noticiaPrevia({ redactor_id: AJENO, publicado: true }))
    await cambiarPublicacionNoticia('n1', false)
    await guardarNoticia('n1', { ...NOTICIA, publicado: false })

    expect(falso.a('noticias').filter((c) => uso(c, 'update'))).toHaveLength(2)
    expect(falso.a('noticias_despublicaciones')).toHaveLength(2)
    expect(argsDe(falso.a('noticias_despublicaciones')[0], 'insert')?.[0]).toEqual({
      noticia_id: 'n1',
      redactor_id: null,
      motivo: '',
    })
  })

  it('si escribe un motivo, se guarda con redactor_id null', async () => {
    const falso = conBase(noticiaPrevia({ redactor_id: AJENO, publicado: true }))
    await cambiarPublicacionNoticia('n1', false, 'Revisión editorial')

    expect(argsDe(falso.a('noticias_despublicaciones')[0], 'insert')?.[0]).toEqual({
      noticia_id: 'n1',
      redactor_id: null,
      motivo: 'Revisión editorial',
    })
  })

  it('edita noticias de cualquiera, sin filtrar por redactor', async () => {
    const falso = conBase(noticiaPrevia({ redactor_id: AJENO, publicado: false }))
    await guardarNoticia('n1', { ...NOTICIA, publicado: false })
    const update = falso.a('noticias').find((c) => uso(c, 'update'))!
    expect(eqs(update)).toEqual([['id', 'n1']])
  })

  it('listarNoticias trae la última despublicación de las no publicadas', async () => {
    const falso = conBase((c) =>
      c.tabla === 'noticias'
        ? { data: [{ id: 'a', publicado: true }, { id: 'b', publicado: false }, { id: 'c', publicado: false }] }
        : {
            data: [
              { noticia_id: 'b', motivo: 'Más reciente', created_at: '2026-03-02T10:00:00Z', redactores: { nombre: 'Ana' } },
              { noticia_id: 'b', motivo: 'Antigua', created_at: '2026-03-01T10:00:00Z', redactores: null },
            ],
          }
    )
    const noticias = await listarNoticias()

    expect(argsDe(falso.a('noticias_despublicaciones')[0], 'in')).toEqual(['noticia_id', ['b', 'c']])
    expect(noticias.find((n) => n.id === 'b')?.despublicacion).toEqual({
      motivo: 'Más reciente',
      por: 'Ana',
      fecha: '2026-03-02T10:00:00Z',
    })
    expect(noticias.find((n) => n.id === 'c')?.despublicacion).toBeNull()
    expect(noticias.find((n) => n.id === 'a')?.despublicacion).toBeNull()
  })

  it('una despublicación hecha por el admin se muestra como Administración', async () => {
    conBase((c) =>
      c.tabla === 'noticias'
        ? { data: { id: 'b', publicado: false } }
        : { data: [{ noticia_id: 'b', motivo: 'Revisión', created_at: '2026-03-02T10:00:00Z', redactores: null }] }
    )
    expect((await obtenerNoticia('b'))?.despublicacion?.por).toBe('Administración')
  })
})
