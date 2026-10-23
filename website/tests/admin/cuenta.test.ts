import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SESSION_COOKIE, verificarToken } from '@/lib/auth/token'
import { CUENTA_ADMIN_ID, CUENTA_COLABORADOR_ID, REDACTOR_ID, filaCuenta, simularSesion } from '../helpers/sesion'
import { argsDe, crearSupabaseFalso, uso } from '../helpers/supabase-falso'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const { cambiarMiPassword, cambiarMiAvatar } = await import('@/app/(admin)/admin/cuenta/actions')

const ACTUAL = 'contrasena-temporal'
const NUEVA = 'una-clave-bien-larga'

function conBase(cuenta: Record<string, unknown> = {}) {
  const hash = bcrypt.hashSync(ACTUAL, 4)
  const falso = crearSupabaseFalso((c) =>
    c.tabla === 'cuentas_panel' && !uso(c, 'update')
      ? { data: { ...filaCuenta({ debe_cambiar_password: true }), password_hash: hash, ...cuenta } }
      : undefined
  )
  vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
  return falso
}

describe('cambiarMiPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sin sesión no hace nada', async () => {
    await simularSesion(false)
    await expect(cambiarMiPassword(ACTUAL, NUEVA)).rejects.toThrow('No autorizado')
  })

  it('el admin cambia su propia contraseña en la base y reemite su cookie', async () => {
    const cookies = await simularSesion('admin')
    const falso = conBase({ rol: 'admin', redactor_id: null, redactores: null, debe_cambiar_password: false })
    await cambiarMiPassword(ACTUAL, NUEVA)

    const update = falso.a('cuentas_panel').find((c) => uso(c, 'update'))!
    const cambio = argsDe(update, 'update')?.[0] as Record<string, unknown>
    expect(cambio).toMatchObject({ debe_cambiar_password: false, version_sesion: 1 })
    expect(await bcrypt.compare(NUEVA, cambio.password_hash as string)).toBe(true)
    expect(argsDe(update, 'eq')).toEqual(['id', CUENTA_ADMIN_ID])

    expect(await verificarToken(cookies.set.mock.calls[0][1], process.env.SESSION_SECRET)).toEqual({
      rol: 'admin',
      cuentaId: CUENTA_ADMIN_ID,
      version: 1,
    })
  })

  it('rechaza a un colaborador con la cuenta inactiva', async () => {
    await simularSesion('colaborador', { activa: false })
    await expect(cambiarMiPassword(ACTUAL, NUEVA)).rejects.toThrow('No autorizado')
  })

  it('falla si la contraseña actual es incorrecta, sin escribir', async () => {
    await simularSesion('colaborador')
    const falso = conBase()
    await expect(cambiarMiPassword('otra-clave', NUEVA)).rejects.toThrow('contraseña actual no es correcta')
    expect(falso.a('cuentas_panel').some((c) => uso(c, 'update'))).toBe(false)
  })

  it.each([
    ['muy corta', 'corta', 'al menos 10'],
    ['igual a la actual', ACTUAL, 'distinta de la actual'],
  ])('falla si la nueva es %s', async (_caso, nueva, mensaje) => {
    await simularSesion('colaborador')
    const falso = conBase()
    await expect(cambiarMiPassword(ACTUAL, nueva)).rejects.toThrow(mensaje)
    expect(falso.consultas.some((c) => uso(c, 'update'))).toBe(false)
  })

  it('el colaborador guarda el hash, sube la versión y reemite la cookie con la nueva versión', async () => {
    const cookies = await simularSesion('colaborador')
    const falso = conBase()
    await cambiarMiPassword(ACTUAL, NUEVA)

    const update = falso.a('cuentas_panel').find((c) => uso(c, 'update'))!
    const cambio = argsDe(update, 'update')?.[0] as Record<string, unknown>
    expect(cambio).toMatchObject({ debe_cambiar_password: false, version_sesion: 1 })
    expect(await bcrypt.compare(NUEVA, cambio.password_hash as string)).toBe(true)
    expect(argsDe(update, 'eq')).toEqual(['id', CUENTA_COLABORADOR_ID])

    const [nombre, valor] = cookies.set.mock.calls[0]
    expect(nombre).toBe(SESSION_COOKIE)
    expect(await verificarToken(valor, process.env.SESSION_SECRET)).toEqual({
      rol: 'colaborador',
      cuentaId: CUENTA_COLABORADOR_ID,
      version: 1,
    })
  })
})

describe('cambiarMiAvatar', () => {
  const URL_BUCKET = 'https://falso.supabase.co/storage/v1/object/public/medios'

  function conAvatar(avatarActual: string | null) {
    const falso = crearSupabaseFalso((c) =>
      c.tabla === 'cuentas_panel' && !uso(c, 'update')
        ? { data: filaCuenta() }
        : c.tabla === 'redactores' && !uso(c, 'update')
          ? { data: { avatar_url: avatarActual } }
          : undefined
    )
    const remove = vi.fn(async () => ({ data: [], error: null }))
    const storage = falso.cliente.storage.from()
    falso.cliente.storage.from = () => ({ ...storage, remove })
    vi.mocked(createAdminClient).mockReturnValue(falso.cliente)
    return { ...falso, remove }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('el admin no tiene ficha de redactor y no puede cambiar avatar', async () => {
    await simularSesion('admin')
    await expect(cambiarMiAvatar('redactores/a.webp')).rejects.toThrow('No autorizado')
  })

  it('un colaborador con contraseña temporal no puede cambiar avatar todavía', async () => {
    await simularSesion('colaborador', { debe_cambiar_password: true })
    await expect(cambiarMiAvatar('redactores/a.webp')).rejects.toThrow('contraseña temporal')
  })

  it('guarda el avatar en su propia ficha y borra el anterior del bucket', async () => {
    await simularSesion('colaborador')
    const falso = conAvatar(`${URL_BUCKET}/redactores/viejo.webp`)
    await expect(cambiarMiAvatar('redactores/nuevo.webp')).resolves.toBe(`${URL_BUCKET}/redactores/nuevo.webp`)

    const update = falso.a('redactores').find((c) => uso(c, 'update'))!
    expect(argsDe(update, 'update')?.[0]).toEqual({ avatar_url: `${URL_BUCKET}/redactores/nuevo.webp` })
    expect(argsDe(update, 'eq')).toEqual(['id', REDACTOR_ID])
    expect(falso.remove).toHaveBeenCalledWith(['redactores/viejo.webp'])
  })

  it('quita el avatar sin tocar un archivo de public/', async () => {
    await simularSesion('colaborador')
    const falso = conAvatar('/images/redactores/felipe.webp')
    await expect(cambiarMiAvatar(null)).resolves.toBeNull()
    expect(argsDe(falso.a('redactores').find((c) => uso(c, 'update'))!, 'update')?.[0]).toEqual({ avatar_url: null })
    expect(falso.remove).not.toHaveBeenCalled()
  })

  it.each(['biblioteca/2026/03/a.webp', 'redactores/../hero/x.webp'])('rechaza la ruta %s sin escribir', async (path) => {
    await simularSesion('colaborador')
    const falso = conAvatar(null)
    await expect(cambiarMiAvatar(path)).rejects.toThrow('Ruta de avatar inválida')
    expect(falso.consultas.some((c) => uso(c, 'update'))).toBe(false)
  })
})
