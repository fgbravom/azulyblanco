import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { crearSupabaseFalso } from '../../helpers/supabase-falso'
import {
  ADMIN_USUARIO,
  generarPasswordTemporal,
  hashPassword,
  validarPasswordNueva,
  verificarCredenciales,
  verifyPassword,
} from '@/lib/auth/password'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
const { createAdminClient } = await import('@/lib/supabase/admin')

// Costo bajo: la seguridad del hash no es lo que se prueba aquí
const HASH = bcrypt.hashSync('clave-larga-del-club', 4)

describe('verifyPassword', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('acepta la contraseña correcta con el hash tal cual', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', HASH)
    expect(await verifyPassword('clave-larga-del-club')).toBe(true)
    expect(await verifyPassword('otra')).toBe(false)
  })

  it('acepta el hash en base64 (los "$" se rompen en algunos .env)', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', Buffer.from(HASH).toString('base64'))
    expect(await verifyPassword('clave-larga-del-club')).toBe(true)
  })

  it('ignora espacios alrededor del hash', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', `  ${HASH}\n`)
    expect(await verifyPassword('clave-larga-del-club')).toBe(true)
  })

  it('en producción sin ADMIN_PASSWORD_HASH el login queda cerrado, incluso con la contraseña de desarrollo', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', '')
    vi.stubEnv('NODE_ENV', 'production')
    expect(await verifyPassword('asd123')).toBe(false)
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('ADMIN_PASSWORD_HASH'))
  })

  it('en desarrollo sin ADMIN_PASSWORD_HASH rige la contraseña de desarrollo', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', '')
    vi.stubEnv('NODE_ENV', 'development')
    expect(await verifyPassword('asd123')).toBe(true)
    expect(await verifyPassword('otra')).toBe(false)
  })

  it('en producción con ADMIN_PASSWORD_HASH la contraseña de desarrollo no sirve', async () => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', HASH)
    vi.stubEnv('NODE_ENV', 'production')
    expect(await verifyPassword('asd123')).toBe(false)
  })
})

describe('hashPassword y validarPasswordNueva', () => {
  it('hashPassword genera un bcrypt de costo 10 que verifica la contraseña', async () => {
    const hash = await hashPassword('una-clave-larga')
    expect(hash).toMatch(/^\$2[aby]\$10\$/)
    expect(await bcrypt.compare('una-clave-larga', hash)).toBe(true)
  })

  it('exige al menos 10 caracteres', () => {
    expect(validarPasswordNueva('123456789')).toMatch(/al menos 10 caracteres/)
    expect(validarPasswordNueva('1234567890')).toBeNull()
  })
})

describe('generarPasswordTemporal', () => {
  it('genera 12 caracteres legibles, sin 0, O, l ni 1, y distintos cada vez', () => {
    const claves = Array.from({ length: 50 }, generarPasswordTemporal)
    for (const clave of claves) expect(clave).toMatch(/^[^0Ol1]{12}$/)
    expect(new Set(claves).size).toBe(50)
    expect(validarPasswordNueva(claves[0])).toBeNull()
  })
})

describe('verificarCredenciales', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('ADMIN_PASSWORD_HASH', HASH)
  })

  function baseCon(cuenta: object | null) {
    const base = crearSupabaseFalso(() => ({ data: cuenta }))
    vi.mocked(createAdminClient).mockReturnValue(base.cliente)
    return base
  }

  it('el usuario del admin es ab06', () => {
    expect(ADMIN_USUARIO).toBe('ab06')
  })

  it('el primer ingreso del admin crea su cuenta con el hash de la variable', async () => {
    const base = crearSupabaseFalso((c) =>
      c.ops.some((o) => o.metodo === 'insert') ? { data: { id: 'nueva', version_sesion: 0 } } : { data: null }
    )
    vi.mocked(createAdminClient).mockReturnValue(base.cliente)
    expect(await verificarCredenciales('Ab06', 'clave-larga-del-club')).toEqual({
      rol: 'admin',
      cuentaId: 'nueva',
      version: 0,
    })
    const insert = base.a('cuentas_panel').flatMap((c) => c.ops).find((o) => o.metodo === 'insert')
    expect(insert?.args[0]).toMatchObject({ usuario: 'ab06', rol: 'admin', password_hash: HASH })
  })

  it('el primer ingreso del admin con la contraseña mala no crea nada', async () => {
    const base = baseCon(null)
    expect(await verificarCredenciales('ab06', 'otra')).toBeNull()
    expect(base.a('cuentas_panel').some((c) => c.ops.some((o) => o.metodo === 'insert'))).toBe(false)
  })

  it('después del primer ingreso la contraseña del admin se valida contra la base', async () => {
    const otro = bcrypt.hashSync('nueva-clave-del-admin', 4)
    baseCon({ id: 'a1', rol: 'admin', password_hash: otro, activa: true, version_sesion: 0 })
    expect(await verificarCredenciales('ab06', 'clave-larga-del-club')).toBeNull()
    expect(await verificarCredenciales('ab06', 'nueva-clave-del-admin')).toEqual({ rol: 'admin', cuentaId: 'a1', version: 0 })
  })

  it('un usuario inexistente igual ejecuta una comparación bcrypt (mismo tiempo que uno real)', async () => {
    baseCon(null)
    const comparar = vi.spyOn(bcrypt, 'compare')
    expect(await verificarCredenciales('nadie', 'clave-larga-del-club')).toBeNull()
    expect(comparar).toHaveBeenCalledOnce()
  })

  it('una cuenta inactiva no entra aunque la contraseña sea correcta', async () => {
    baseCon({ id: 'c1', rol: 'colaborador', password_hash: HASH, activa: false, version_sesion: 0 })
    expect(await verificarCredenciales('redactor1', 'clave-larga-del-club')).toBeNull()
  })

  it('un colaborador activo con la contraseña correcta entra con su cuenta y versión', async () => {
    const base = baseCon({ id: 'c1', rol: 'colaborador', password_hash: HASH, activa: true, version_sesion: 4 })
    expect(await verificarCredenciales('redactor1', 'clave-larga-del-club')).toEqual({
      rol: 'colaborador',
      cuentaId: 'c1',
      version: 4,
    })
    expect(base.a('cuentas_panel').some((c) => c.ops.some((o) => o.metodo === 'update'))).toBe(true)
  })
})
