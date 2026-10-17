import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simularSesion } from '../helpers/sesion'
import { argsDe, crearSupabaseFalso, uso, type Responder } from '../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { guardarRedactor, eliminarRedactor } = await import('@/app/(admin)/admin/redactores/actions')

const URL_BUCKET = 'https://falso.supabase.co/storage/v1/object/public/medios'

function conBase(responder: Responder) {
  const falso = crearSupabaseFalso(responder)
  const remove = vi.fn(async () => ({ data: [], error: null }))
  const storage = falso.cliente.storage.from()
  falso.cliente.storage.from = () => ({ ...storage, remove })
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return { ...falso, remove }
}

describe('guardarRedactor', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(true)
  })

  it('crea un redactor con el avatar subido y regenera las noticias', async () => {
    const falso = conBase(() => ({ data: { id: 'r1' } }))
    await guardarRedactor(null, { nombre: '  Felipe Bravo ', avatarPath: 'redactores/a.webp' })

    expect(argsDe(falso.a('redactores')[0], 'insert')?.[0]).toEqual({
      nombre: 'Felipe Bravo',
      avatar_url: `${URL_BUCKET}/redactores/a.webp`,
    })
    expect(falso.a('noticias')).toHaveLength(0)
    expect(revalidatePath).toHaveBeenCalledWith('/noticias', 'layout')
  })

  it('al renombrar, actualiza la firma de sus noticias', async () => {
    const falso = conBase((c) => (uso(c, 'maybeSingle') ? { data: { avatar_url: null } } : { data: { id: 'r1' } }))
    await guardarRedactor('r1', { nombre: 'Felipe G. Bravo' })

    const noticias = falso.a('noticias')[0]
    expect(argsDe(noticias, 'update')?.[0]).toEqual({ autor: 'Felipe G. Bravo' })
    expect(argsDe(noticias, 'eq')).toEqual(['redactor_id', 'r1'])
  })

  it('al reemplazar el avatar borra el archivo anterior del bucket', async () => {
    const falso = conBase((c) =>
      uso(c, 'maybeSingle') ? { data: { avatar_url: `${URL_BUCKET}/redactores/viejo.webp` } } : { data: { id: 'r1' } }
    )
    await guardarRedactor('r1', { nombre: 'Felipe Bravo', avatarPath: 'redactores/nuevo.webp' })
    expect(falso.remove).toHaveBeenCalledWith(['redactores/viejo.webp'])
  })

  it('al quitar un avatar de public/ no intenta borrarlo del bucket', async () => {
    const falso = conBase((c) =>
      uso(c, 'maybeSingle') ? { data: { avatar_url: '/images/authors/cristina-reyes.jpg' } } : { data: { id: 'r1' } }
    )
    await guardarRedactor('r1', { nombre: 'Cristina Reyes', avatarPath: null })

    expect(argsDe(falso.a('redactores')[1], 'update')?.[0]).toMatchObject({ avatar_url: null })
    expect(falso.remove).not.toHaveBeenCalled()
  })

  it('rechaza una ruta de avatar fuera de redactores/', async () => {
    conBase(() => ({ data: null }))
    await expect(guardarRedactor(null, { nombre: 'X', avatarPath: 'hero/x.webp' })).rejects.toThrow('Ruta de avatar inválida')
  })

  it('explica el error cuando el nombre ya existe', async () => {
    conBase((c) => (uso(c, 'insert') ? { error: { message: 'duplicate', code: '23505' } } : { data: null }))
    await expect(guardarRedactor(null, { nombre: 'Felipe Bravo' })).rejects.toThrow('Ya existe un redactor con ese nombre')
  })

  it('rechaza un nombre vacío', async () => {
    const falso = conBase(() => ({ data: null }))
    await expect(guardarRedactor(null, { nombre: '   ' })).rejects.toThrow('Indica el nombre del redactor')
    expect(falso.consultas).toHaveLength(0)
  })
})

describe('eliminarRedactor', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion(true)
  })

  it('borra el redactor y su avatar del bucket', async () => {
    const falso = conBase(() => ({ data: { avatar_url: `${URL_BUCKET}/redactores/a.webp` } }))
    await eliminarRedactor('r1')

    expect(uso(falso.a('redactores')[1], 'delete')).toBe(true)
    expect(falso.remove).toHaveBeenCalledWith(['redactores/a.webp'])
  })
})
