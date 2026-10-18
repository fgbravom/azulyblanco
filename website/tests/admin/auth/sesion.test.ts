import { beforeEach, describe, expect, it, vi } from 'vitest'
import { REDACTOR_ID, simularSesion } from '../../helpers/sesion'
import { argsDe } from '../../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { obtenerSesion, requireAdmin, requireEditorNoticias, rechazarSinSesion, sesionParaNoticias, verifySession } = await import(
  '@/lib/auth/session'
)

describe('sesión con rol', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sin cookie es null y no toca la base', async () => {
    await simularSesion(false)
    expect(await obtenerSesion()).toBeNull()
    expect(createAdminClient).not.toHaveBeenCalled()
  })

  it('el admin no consulta la base', async () => {
    await simularSesion('admin')
    expect(await obtenerSesion()).toEqual({ rol: 'admin' })
    expect(createAdminClient).not.toHaveBeenCalled()
  })

  it('un redactor con cuenta activa y versión al día entra con su nombre', async () => {
    const { base } = await simularSesion('redactor', { debe_cambiar_password: true })
    expect(await obtenerSesion()).toEqual({
      rol: 'redactor',
      redactorId: REDACTOR_ID,
      nombre: 'Redactora de Prueba',
      debeCambiarPassword: true,
    })
    const [consulta] = base!.a('cuentas_redactores')
    expect(argsDe(consulta, 'eq')).toEqual(['redactor_id', REDACTOR_ID])
  })

  it('con la versión de sesión vencida es null', async () => {
    await simularSesion('redactor', { version_sesion: 1 })
    expect(await obtenerSesion()).toBeNull()
  })

  it('con la cuenta inactiva es null', async () => {
    await simularSesion('redactor', { activa: false })
    expect(await obtenerSesion()).toBeNull()
  })

  it('con la cuenta borrada es null', async () => {
    await simularSesion('redactor', null)
    expect(await obtenerSesion()).toBeNull()
  })

  it('requireAdmin y rechazarSinSesion solo aceptan al admin', async () => {
    await simularSesion('redactor')
    await expect(requireAdmin()).rejects.toThrow('No autorizado')
    expect((await rechazarSinSesion())?.status).toBe(401)
    expect(await verifySession()).toBe(false)

    await simularSesion('admin')
    await expect(requireAdmin()).resolves.toBeUndefined()
    expect(await rechazarSinSesion()).toBeNull()
  })

  it('requireEditorNoticias acepta al admin y al redactor activo, y rechaza al resto', async () => {
    await simularSesion('admin')
    expect(await requireEditorNoticias()).toEqual({ rol: 'admin' })

    await simularSesion('redactor')
    expect(await requireEditorNoticias()).toMatchObject({ rol: 'redactor', redactorId: REDACTOR_ID })

    await simularSesion('redactor', { activa: false })
    await expect(requireEditorNoticias()).rejects.toThrow('No autorizado')

    await simularSesion(false)
    await expect(requireEditorNoticias()).rejects.toThrow('No autorizado')
  })

  it('requireEditorNoticias rechaza al redactor con la contraseña temporal pendiente', async () => {
    await simularSesion('redactor', { debe_cambiar_password: true })
    await expect(requireEditorNoticias()).rejects.toThrow('contraseña temporal')
  })

  it('sesionParaNoticias manda al login sin sesión y a Mi cuenta con contraseña temporal', async () => {
    await simularSesion(false)
    await expect(sesionParaNoticias()).rejects.toThrow('NEXT_REDIRECT')

    await simularSesion('redactor', { debe_cambiar_password: true })
    await expect(sesionParaNoticias()).rejects.toThrow('NEXT_REDIRECT')

    await simularSesion('redactor')
    expect(await sesionParaNoticias()).toMatchObject({ rol: 'redactor', redactorId: REDACTOR_ID })

    await simularSesion('admin')
    expect(await sesionParaNoticias()).toEqual({ rol: 'admin' })
  })
})
