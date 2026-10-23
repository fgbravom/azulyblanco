import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CUENTA_ADMIN_ID, CUENTA_COLABORADOR_ID, REDACTOR_ID, simularSesion } from '../../helpers/sesion'
import { argsDe } from '../../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const {
  obtenerSesion,
  requireAdmin,
  requireEditorNoticias,
  requirePermiso,
  rechazarSinPermiso,
  rechazarSinSesion,
  sesionParaNoticias,
  sesionParaSeccion,
  verifySession,
} = await import('@/lib/auth/session')

describe('sesión con rol', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sin cookie es null y no toca la base', async () => {
    await simularSesion(false)
    expect(await obtenerSesion()).toBeNull()
    expect(createAdminClient).not.toHaveBeenCalled()
  })

  it('el administrador se valida contra su cuenta en la base', async () => {
    const { base } = await simularSesion('admin')
    expect(await obtenerSesion()).toEqual({ rol: 'admin', cuentaId: CUENTA_ADMIN_ID })
    const [consulta] = base!.sesiones
    expect(argsDe(consulta, 'eq')).toEqual(['id', CUENTA_ADMIN_ID])
  })

  it('un colaborador con cuenta activa y versión al día entra con su nombre', async () => {
    const { base } = await simularSesion('colaborador', { debe_cambiar_password: true })
    expect(await obtenerSesion()).toEqual({
      rol: 'colaborador',
      cuentaId: CUENTA_COLABORADOR_ID,
      redactorId: REDACTOR_ID,
      nombre: 'Redactora de Prueba',
      debeCambiarPassword: true,
    })
    const [consulta] = base!.sesiones
    expect(argsDe(consulta, 'eq')).toEqual(['id', CUENTA_COLABORADOR_ID])
  })

  it('con la versión de sesión vencida es null', async () => {
    await simularSesion('colaborador', { version_sesion: 1 })
    expect(await obtenerSesion()).toBeNull()
  })

  it('con la cuenta inactiva es null', async () => {
    await simularSesion('colaborador', { activa: false })
    expect(await obtenerSesion()).toBeNull()
    await simularSesion('admin', { activa: false })
    expect(await obtenerSesion()).toBeNull()
  })

  it('con la cuenta borrada es null', async () => {
    await simularSesion('colaborador', null)
    expect(await obtenerSesion()).toBeNull()
    await simularSesion('admin', null)
    expect(await obtenerSesion()).toBeNull()
  })

  it('con el rol de la cuenta distinto al del token es null', async () => {
    await simularSesion('colaborador', { rol: 'admin' } as never)
    expect(await obtenerSesion()).toBeNull()
  })

  it('requireAdmin y rechazarSinSesion solo aceptan al administrador', async () => {
    await simularSesion('colaborador')
    await expect(requireAdmin()).rejects.toThrow('No autorizado')
    expect((await rechazarSinSesion())?.status).toBe(401)
    expect(await verifySession()).toBe(false)

    await simularSesion('admin')
    await expect(requireAdmin()).resolves.toEqual({ rol: 'admin', cuentaId: CUENTA_ADMIN_ID })
    expect(await rechazarSinSesion()).toBeNull()
    expect(await verifySession()).toBe(true)
  })

  it('requireEditorNoticias acepta al admin y al colaborador activo, y rechaza al resto', async () => {
    await simularSesion('admin')
    expect(await requireEditorNoticias()).toEqual({ rol: 'admin', cuentaId: CUENTA_ADMIN_ID })

    await simularSesion('colaborador')
    expect(await requireEditorNoticias()).toMatchObject({ rol: 'colaborador', redactorId: REDACTOR_ID })

    await simularSesion('colaborador', { activa: false })
    await expect(requireEditorNoticias()).rejects.toThrow('No autorizado')

    await simularSesion(false)
    await expect(requireEditorNoticias()).rejects.toThrow('No autorizado')
  })

  it('requireEditorNoticias rechaza al colaborador con la contraseña temporal pendiente', async () => {
    await simularSesion('colaborador', { debe_cambiar_password: true })
    await expect(requireEditorNoticias()).rejects.toThrow('contraseña temporal')
  })

  it('requirePermiso deja al colaborador solo en sus secciones', async () => {
    await simularSesion('colaborador')
    for (const seccion of ['noticias', 'portada', 'programacion', 'galeria', 'medios', 'plantel'] as const) {
      await expect(requirePermiso(seccion), seccion).resolves.toMatchObject({ rol: 'colaborador' })
    }
  })

  it('requirePermiso rechaza al colaborador con contraseña temporal aunque la sección sea suya', async () => {
    await simularSesion('colaborador', { debe_cambiar_password: true })
    await expect(requirePermiso('plantel')).rejects.toThrow('contraseña temporal')
  })

  it('requirePermiso deja pasar al administrador en cualquier sección', async () => {
    await simularSesion('admin')
    await expect(requirePermiso('plantel')).resolves.toMatchObject({ rol: 'admin' })
  })

  it('rechazarSinPermiso deja pasar al colaborador en sus secciones y responde 401 o 403 si no', async () => {
    await simularSesion('colaborador')
    expect(await rechazarSinPermiso('plantel')).toBeNull()

    await simularSesion('colaborador', { debe_cambiar_password: true })
    expect((await rechazarSinPermiso('plantel'))?.status).toBe(403)

    await simularSesion(false)
    expect((await rechazarSinPermiso('plantel'))?.status).toBe(401)
  })

  it('sesionParaNoticias manda al login sin sesión y a Mi cuenta con contraseña temporal', async () => {
    await simularSesion(false)
    await expect(sesionParaNoticias()).rejects.toThrow('NEXT_REDIRECT')

    await simularSesion('colaborador', { debe_cambiar_password: true })
    await expect(sesionParaNoticias()).rejects.toThrow('NEXT_REDIRECT')

    await simularSesion('colaborador')
    expect(await sesionParaNoticias()).toMatchObject({ rol: 'colaborador', redactorId: REDACTOR_ID })

    await simularSesion('admin')
    expect(await sesionParaNoticias()).toEqual({ rol: 'admin', cuentaId: CUENTA_ADMIN_ID })
  })

  it('sesionParaSeccion manda a Noticias a un colaborador fuera de sus secciones', async () => {
    await simularSesion('colaborador')
    await expect(sesionParaSeccion('portada')).resolves.toMatchObject({ rol: 'colaborador' })
    await simularSesion(false)
    await expect(sesionParaSeccion('portada')).rejects.toThrow('NEXT_REDIRECT')
  })
})
