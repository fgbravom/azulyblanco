import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simularSesion } from '../helpers/sesion'
import { crearSupabaseFalso } from '../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { prepararSubida, listarMedios, registrarMedio, eliminarMedio } = await import('@/app/(admin)/admin/medios/actions')

const MEDIO = { path: 'biblioteca/2026/03/a.webp', nombre: 'a', mime: 'image/webp', bytes: 1, ancho: 1, alto: 1 }

describe('medios con sesión de redactor', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion('redactor')
  })

  it('puede subir a la biblioteca y su avatar, listar y registrar medios', async () => {
    const falso = crearSupabaseFalso((c) => (c.tabla === 'cuentas_redactores' ? { data: { activa: true, version_sesion: 0 } } : { data: [] }))
    vi.mocked(createAdminClient).mockReturnValue(falso.cliente)

    const subida = await prepararSubida({ tipo: 'biblioteca' }, 'image/webp')
    expect(subida.path).toMatch(/^biblioteca\//)
    expect((await prepararSubida({ tipo: 'redactor' }, 'image/webp')).path).toMatch(/^redactores\//)
    await expect(listarMedios()).resolves.toEqual([])
    await expect(registrarMedio(MEDIO)).resolves.toBeDefined()
  })

  it.each([
    [{ tipo: 'album', albumId: 'x' }],
    [{ tipo: 'hero' }],
    [{ tipo: 'rival' }],
  ] as const)('prepararSubida con destino %j se rechaza', async (destino) => {
    await expect(prepararSubida(destino, 'image/webp')).rejects.toThrow('No autorizado')
  })

  it('no puede eliminar medios', async () => {
    await expect(eliminarMedio('m1')).rejects.toThrow('No autorizado')
  })
})
