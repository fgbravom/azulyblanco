import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SESSION_COOKIE, verificarToken } from '@/lib/auth/token'
import { REDACTOR_ID, filaCuenta, simularSesion } from '../helpers/sesion'
import { argsDe, crearSupabaseFalso, uso } from '../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { cambiarMiPassword } = await import('@/app/(admin)/admin/cuenta/actions')

const ACTUAL = 'contrasena-temporal'
const NUEVA = 'una-clave-bien-larga'

function conBase() {
  const hash = bcrypt.hashSync(ACTUAL, 4)
  const falso = crearSupabaseFalso((c) =>
    c.tabla === 'cuentas_redactores' && !uso(c, 'update')
      ? { data: { ...filaCuenta({ debe_cambiar_password: true }), password_hash: hash } }
      : undefined
  )
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return falso
}

describe('cambiarMiPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rechaza al admin (su contraseña vive en una variable de entorno) y sin sesión', async () => {
    await simularSesion('admin')
    await expect(cambiarMiPassword(ACTUAL, NUEVA)).rejects.toThrow('No autorizado')
    await simularSesion(false)
    await expect(cambiarMiPassword(ACTUAL, NUEVA)).rejects.toThrow('No autorizado')
  })

  it('rechaza a un redactor con la cuenta inactiva', async () => {
    await simularSesion('redactor', { activa: false })
    await expect(cambiarMiPassword(ACTUAL, NUEVA)).rejects.toThrow('No autorizado')
  })

  it('falla si la contraseña actual es incorrecta, sin escribir', async () => {
    await simularSesion('redactor')
    const falso = conBase()
    await expect(cambiarMiPassword('otra-clave', NUEVA)).rejects.toThrow('contraseña actual no es correcta')
    expect(falso.a('cuentas_redactores').some((c) => uso(c, 'update'))).toBe(false)
  })

  it.each([
    ['muy corta', 'corta', 'al menos 10'],
    ['igual a la actual', ACTUAL, 'distinta de la actual'],
  ])('falla si la nueva es %s', async (_caso, nueva, mensaje) => {
    await simularSesion('redactor')
    const falso = conBase()
    await expect(cambiarMiPassword(ACTUAL, nueva)).rejects.toThrow(mensaje)
    expect(falso.consultas.some((c) => uso(c, 'update'))).toBe(false)
  })

  it('guarda el hash, sube la versión y reemite la cookie con la nueva versión', async () => {
    const cookies = await simularSesion('redactor')
    const falso = conBase()
    await cambiarMiPassword(ACTUAL, NUEVA)

    const update = falso.a('cuentas_redactores').find((c) => uso(c, 'update'))!
    const cambio = argsDe(update, 'update')?.[0] as Record<string, unknown>
    expect(cambio).toMatchObject({ debe_cambiar_password: false, version_sesion: 1 })
    expect(await bcrypt.compare(NUEVA, cambio.password_hash as string)).toBe(true)
    expect(argsDe(update, 'eq')).toEqual(['redactor_id', REDACTOR_ID])

    const [nombre, valor] = cookies.set.mock.calls[0]
    expect(nombre).toBe(SESSION_COOKIE)
    expect(await verificarToken(valor, process.env.SESSION_SECRET)).toEqual({
      rol: 'redactor',
      redactorId: REDACTOR_ID,
      version: 1,
    })
  })
})
