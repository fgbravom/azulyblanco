import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simularSesion } from '../helpers/sesion'
import { argsDe, crearSupabaseFalso, uso, type Responder } from '../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { guardarEstadio, eliminarEstadio, listarEstadios } = await import('@/app/(admin)/admin/estadios/actions')

function conBase(responder: Responder) {
  const falso = crearSupabaseFalso(responder)
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return falso
}

describe('guardarEstadio', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(true)
  })

  it('crea una cancha con su ubicación y link al mapa', async () => {
    const falso = conBase(() => ({ data: { id: 'e1' } }))
    const guardado = await guardarEstadio(null, {
      nombre: '  Estadio ANFA  ',
      ubicacion: ' Curicó ',
      mapa_url: 'https://maps.app.goo.gl/abc',
    })

    expect(argsDe(falso.a('estadios')[0], 'insert')?.[0]).toEqual({
      nombre: 'Estadio ANFA',
      ubicacion: 'Curicó',
      mapa_url: 'https://maps.app.goo.gl/abc',
    })
    expect(guardado).toEqual({ id: 'e1' })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/estadios')
  })

  it('guarda sin ubicación ni mapa como null', async () => {
    const falso = conBase(() => ({ data: { id: 'e1' } }))
    await guardarEstadio(null, { nombre: 'LA GRANJA', ubicacion: '', mapa_url: null })

    expect(argsDe(falso.a('estadios')[0], 'insert')?.[0]).toEqual({
      nombre: 'LA GRANJA',
      ubicacion: null,
      mapa_url: null,
    })
  })

  it('al renombrar, actualiza el lugar de las actividades que lo usan', async () => {
    const falso = conBase((c) => (uso(c, 'maybeSingle') ? { data: { nombre: 'LA GRANJA' } } : { data: { id: 'e1' } }))
    await guardarEstadio('e1', { nombre: 'Estadio La Granja', ubicacion: null, mapa_url: null })

    const actividades = falso.a('programacion')[0]
    expect(argsDe(actividades, 'update')?.[0]).toEqual({ estadio: 'Estadio La Granja' })
    expect(argsDe(actividades, 'eq')).toEqual(['estadio_id', 'e1'])
  })

  it('sin cambio de nombre no toca las actividades', async () => {
    const falso = conBase((c) => (uso(c, 'maybeSingle') ? { data: { nombre: 'LA GRANJA' } } : { data: { id: 'e1' } }))
    await guardarEstadio('e1', { nombre: 'LA GRANJA', ubicacion: 'Curicó', mapa_url: null })

    // La primera consulta es la del nombre anterior; la segunda es la actualización
    expect(argsDe(falso.a('estadios')[1], 'update')?.[0]).toEqual({ nombre: 'LA GRANJA', ubicacion: 'Curicó', mapa_url: null })
    expect(falso.a('programacion')).toHaveLength(0)
  })

  it('explica el error cuando el nombre ya existe', async () => {
    conBase((c) => (uso(c, 'insert') ? { error: { message: 'duplicate', code: '23505' } } : { data: null }))
    await expect(guardarEstadio(null, { nombre: 'LA GRANJA', ubicacion: null, mapa_url: null })).rejects.toThrow(
      'Ya existe una cancha o estadio con ese nombre'
    )
  })

  it('rechaza un nombre vacío sin tocar la base', async () => {
    const falso = conBase(() => ({ data: null }))
    await expect(guardarEstadio(null, { nombre: '   ', ubicacion: null, mapa_url: null })).rejects.toThrow(
      'Indica el nombre de la cancha o estadio'
    )
    expect(falso.consultas).toHaveLength(0)
  })

  it('rechaza un link de mapa que no es una URL completa', async () => {
    conBase(() => ({ data: null }))
    await expect(
      guardarEstadio(null, { nombre: 'LA GRANJA', ubicacion: null, mapa_url: 'maps.app.goo.gl/abc' })
    ).rejects.toThrow('Link de mapa inválido')
  })
})

describe('eliminarEstadio', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(true)
  })

  it('borra el estadio y regenera la programación', async () => {
    const falso = conBase(() => ({ data: null }))
    await eliminarEstadio('e1')

    expect(argsDe(falso.a('estadios')[0], 'delete')).toEqual([])
    expect(argsDe(falso.a('estadios')[0], 'eq')).toEqual(['id', 'e1'])
    expect(revalidatePath).toHaveBeenCalledWith('/admin/programacion')
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })
})

describe('listarEstadios', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(true)
  })

  it('trae el catálogo ordenado por nombre', async () => {
    const falso = conBase(() => ({ data: [{ id: 'e1', nombre: 'AGUAS NEGRAS' }] }))
    const estadios = await listarEstadios()

    expect(estadios).toEqual([{ id: 'e1', nombre: 'AGUAS NEGRAS' }])
    expect(argsDe(falso.a('estadios')[0], 'order')).toEqual(['nombre'])
  })
})
