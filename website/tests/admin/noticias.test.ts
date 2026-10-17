import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simularSesion } from '../helpers/sesion'
import { argsDe, crearSupabaseFalso, uso, type Responder } from '../helpers/supabase-falso'
import type { NoticiaInput } from '@/lib/contenido/tipos'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { guardarNoticia } = await import('@/app/(admin)/admin/noticias/actions')
const { guardarSerie } = await import('@/app/(admin)/admin/series/actions')

const NOTICIA: NoticiaInput = {
  slug: '',
  titulo: 'Gran Final: AYB vs Unión',
  bajada: 'Resumen',
  contenido: '# Crónica',
  categoria: 'Deportes',
  tags: ['final'],
  autor: '  ',
  redactor_id: null,
  fecha: '2026-03-01',
  portada_url: 'https://falso.supabase.co/storage/v1/object/public/medios/portada.webp',
  publicado: true,
}

function conBase(responder: Responder) {
  const falso = crearSupabaseFalso(responder)
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return falso
}

describe('guardarNoticia', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(true)
  })

  it('una noticia nueva toma el slug del título y regenera la portada y /noticias', async () => {
    const falso = conBase(() => ({ data: { id: 'n1' } }))
    await guardarNoticia(null, NOTICIA)

    const fila = argsDe(falso.a('noticias')[0], 'insert')?.[0]
    expect(fila).toMatchObject({ slug: 'gran-final-ayb-vs-union', autor: null })
    expect(revalidatePath).toHaveBeenCalledWith('/noticias', 'layout')
    expect(revalidatePath).toHaveBeenCalledWith('/noticias/gran-final-ayb-vs-union')
  })

  it('al cambiar el slug regenera también la URL antigua', async () => {
    const falso = conBase((c) => (uso(c, 'maybeSingle') ? { data: { slug: 'viejo' } } : { data: { id: 'n1' } }))
    await guardarNoticia('n1', { ...NOTICIA, slug: 'nuevo' })

    expect(argsDe(falso.a('noticias')[1], 'update')?.[0]).toMatchObject({ slug: 'nuevo' })
    expect(revalidatePath).toHaveBeenCalledWith('/noticias/viejo')
  })

  it('respeta tal cual un slug que no cambió (enlaces ya compartidos)', async () => {
    const falso = conBase((c) => (uso(c, 'maybeSingle') ? { data: { slug: 'Carta-Aniversario' } } : { data: {} }))
    await guardarNoticia('n1', { ...NOTICIA, slug: 'Carta-Aniversario' })
    expect(argsDe(falso.a('noticias')[1], 'update')?.[0]).toMatchObject({ slug: 'Carta-Aniversario' })
  })

  it('con un redactor del catálogo firma con su nombre', async () => {
    const REDACTOR = '7d1c2a4e-3b5f-4c6d-8e9f-0a1b2c3d4e5f'
    const falso = conBase((c) => (c.tabla === 'redactores' ? { data: { nombre: 'Felipe Bravo' } } : { data: { id: 'n1' } }))
    await guardarNoticia(null, { ...NOTICIA, autor: 'otro texto', redactor_id: REDACTOR })

    expect(argsDe(falso.a('redactores')[0], 'eq')).toEqual(['id', REDACTOR])
    expect(argsDe(falso.a('noticias')[0], 'insert')?.[0]).toMatchObject({ autor: 'Felipe Bravo', redactor_id: REDACTOR })
  })

  it('rechaza un redactor que ya no existe', async () => {
    const falso = conBase(() => ({ data: null }))
    await expect(guardarNoticia(null, { ...NOTICIA, redactor_id: '7d1c2a4e-3b5f-4c6d-8e9f-0a1b2c3d4e5f' })).rejects.toThrow(
      'El redactor elegido ya no existe'
    )
    expect(falso.a('noticias')).toHaveLength(0)
  })

  it('explica el error cuando el slug ya existe', async () => {
    conBase((c) => (uso(c, 'insert') ? { error: { message: 'duplicate', code: '23505' } } : { data: null }))
    await expect(guardarNoticia(null, NOTICIA)).rejects.toThrow('Ya existe una noticia con la dirección "gran-final-ayb-vs-union"')
  })

  it.each([
    ['sin título', { titulo: '  ' }, 'El título es obligatorio'],
    ['fecha inválida', { fecha: '01-03-2026' }, 'Fecha inválida'],
    ['un título sin letras ni números (slug vacío)', { titulo: '¡¡¡!!!' }, 'slug'],
  ])('rechaza %s', async (_caso, cambio, mensaje) => {
    conBase(() => ({ data: null }))
    await expect(guardarNoticia(null, { ...NOTICIA, ...cambio })).rejects.toThrow(mensaje)
  })

  it.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'ftp://x/y.png', '/images/a.png'])(
    'rechaza la portada %j',
    async (portada_url) => {
      const falso = conBase(() => ({ data: null }))
      await expect(guardarNoticia(null, { ...NOTICIA, portada_url })).rejects.toThrow()
      expect(falso.consultas).toHaveLength(0)
    }
  )
})

describe('guardarSerie', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(true)
  })

  const SERIE = {
    titulo: 'Serie Honor',
    descripcion: null,
    contenido: null,
    imagen_url: 'https://falso.supabase.co/x.webp',
    horario_entrenamiento: ' ',
    lugar_entrenamiento: null,
    competencia: null,
  }

  it('guarda y convierte los textos vacíos en null', async () => {
    const falso = conBase(() => ({ data: null }))
    await guardarSerie(2, SERIE)
    expect(argsDe(falso.a('categorias')[0], 'update')?.[0]).toMatchObject({ horario_entrenamiento: null })
    expect(argsDe(falso.a('categorias')[0], 'eq')).toEqual(['id', 2])
  })

  it('rechaza una imagen que no es http(s)', async () => {
    conBase(() => ({ data: null }))
    await expect(guardarSerie(2, { ...SERIE, imagen_url: 'javascript:alert(1)' })).rejects.toThrow()
  })
})
