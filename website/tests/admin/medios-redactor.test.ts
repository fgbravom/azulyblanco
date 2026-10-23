import { beforeEach, describe, expect, it, vi } from 'vitest'
import { simularSesion } from '../helpers/sesion'
import { crearSupabaseFalso } from '../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { prepararSubida, listarMedios, registrarMedio, eliminarMedio } = await import('@/app/(admin)/admin/medios/actions')

const MEDIO = { path: 'biblioteca/2026/03/a.webp', nombre: 'a', mime: 'image/webp', bytes: 1, ancho: 1, alto: 1 }

describe('medios con sesión de colaborador', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await simularSesion('colaborador')
  })

  it('puede subir a la biblioteca, su avatar, portadas y galerías, listar y registrar medios', async () => {
    const falso = crearSupabaseFalso(() => ({ data: [] }))
    vi.mocked(createAdminClient).mockReturnValue(falso.cliente)

    expect((await prepararSubida({ tipo: 'biblioteca' }, 'image/webp')).path).toMatch(/^biblioteca\//)
    expect((await prepararSubida({ tipo: 'redactor' }, 'image/webp')).path).toMatch(/^redactores\//)
    expect((await prepararSubida({ tipo: 'hero' }, 'image/webp')).path).toMatch(/^hero\//)
    expect((await prepararSubida({ tipo: 'album', albumId: 'x' }, 'image/webp')).path).toMatch(/^galeria\/x\//)
    await expect(listarMedios()).resolves.toEqual([])
    await expect(registrarMedio(MEDIO)).resolves.toBeDefined()
  })

  it('no sube escudos de rivales, que son del admin', async () => {
    await expect(prepararSubida({ tipo: 'rival' }, 'image/webp')).rejects.toThrow('No autorizado')
  })

  it('no puede eliminar medios', async () => {
    await expect(eliminarMedio('m1')).rejects.toThrow('No autorizado')
  })
})
