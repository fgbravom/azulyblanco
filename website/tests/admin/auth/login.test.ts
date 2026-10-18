import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SESSION_COOKIE, SESSION_MAX_AGE, verificarToken } from '@/lib/auth/token'
import { REDACTOR_ID, simularSesion } from '../../helpers/sesion'
import { crearSupabaseFalso } from '../../helpers/supabase-falso'

vi.mock('@/lib/auth/intentos', () => ({
  ipDe: vi.fn(() => '1.1.1.1'),
  loginBloqueado: vi.fn(async () => false),
  registrarFallo: vi.fn(async () => {}),
  limpiarIntentos: vi.fn(async () => {}),
}))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))

const { createAdminClient } = await import('@/lib/supabase/admin')
const intentos = await import('@/lib/auth/intentos')
const { POST: login } = await import('@/app/api/auth/login/route')
const { POST: logout } = await import('@/app/api/auth/logout/route')

function intentar(body: unknown) {
  return login(
    new NextRequest('https://azulyblanco.com/api/auth/login', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })
  )
}

const HASH_REDACTOR = bcrypt.hashSync('clave-del-redactor', 4)

/** Base falsa con una cuenta de redactor (o ninguna); devuelve el cliente para revisar qué se le pidió */
function cuentaEnBase(cuenta: { activa?: boolean; version_sesion?: number } | null) {
  const base = crearSupabaseFalso((c) =>
    c.tabla === 'cuentas_redactores' && !c.ops.some((o) => o.metodo === 'update')
      ? {
          data: cuenta && {
            redactor_id: REDACTOR_ID,
            password_hash: HASH_REDACTOR,
            activa: true,
            version_sesion: 2,
            ...cuenta,
          },
        }
      : undefined
  )
  vi.mocked(createAdminClient).mockReturnValue(base.cliente)
  return base
}

const anotoIngreso = (base: ReturnType<typeof crearSupabaseFalso>) =>
  base.a('cuentas_redactores').some((c) => c.ops.some((o) => o.metodo === 'update'))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('ADMIN_PASSWORD_HASH', bcrypt.hashSync('clave-correcta', 4))
    vi.mocked(intentos.loginBloqueado).mockResolvedValue(false)
  })

  it('el admin entra con el usuario ab06 (sin distinguir mayúsculas) y se crea una cookie segura', async () => {
    const cookies = await simularSesion(false)
    const res = await intentar({ usuario: 'AB06', password: 'clave-correcta' })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, rol: 'admin' })
    expect(cookies.set).toHaveBeenCalledOnce()
    const [nombre, valor, opciones] = cookies.set.mock.calls[0]
    expect(nombre).toBe(SESSION_COOKIE)
    expect(await verificarToken(valor, process.env.SESSION_SECRET)).toEqual({ rol: 'admin' })
    expect(opciones).toMatchObject({ httpOnly: true, sameSite: 'strict', path: '/', maxAge: SESSION_MAX_AGE })
    expect(intentos.limpiarIntentos).toHaveBeenCalledWith('1.1.1.1')
    expect(createAdminClient).not.toHaveBeenCalled()
  })

  it('en producción la cookie solo viaja por HTTPS', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const cookies = await simularSesion(false)
    await intentar({ usuario: 'ab06', password: 'clave-correcta' })
    expect(cookies.set.mock.calls[0][2]).toMatchObject({ secure: true })
  })

  it('un redactor entra con su usuario: la sesión lleva su id y la versión de la cuenta', async () => {
    const base = cuentaEnBase({})
    const cookies = await simularSesion(false)
    const res = await intentar({ usuario: ' Redactor1 ', password: 'clave-del-redactor' })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, rol: 'redactor' })
    expect(await verificarToken(cookies.set.mock.calls[0][1], process.env.SESSION_SECRET)).toEqual({
      rol: 'redactor',
      redactorId: REDACTOR_ID,
      version: 2,
    })
    // Busca el usuario en minúscula y anota el ingreso
    expect(base.a('cuentas_redactores')[0].ops.find((o) => o.metodo === 'eq')?.args).toEqual(['usuario', 'redactor1'])
    expect(anotoIngreso(base)).toBe(true)
  })

  it('la contraseña del admin no abre una cuenta de redactor ni al revés', async () => {
    cuentaEnBase({})
    await simularSesion(false)
    expect((await intentar({ usuario: 'redactor1', password: 'clave-correcta' })).status).toBe(401)
    expect((await intentar({ usuario: 'ab06', password: 'clave-del-redactor' })).status).toBe(401)
  })

  it.each([
    ['con la contraseña mala', { activa: true }, 'otra-clave'],
    ['con la cuenta inactiva', { activa: false }, 'clave-del-redactor'],
    ['con un usuario inexistente', null, 'clave-del-redactor'],
  ])('un redactor %s recibe el mismo 401 y no se crea sesión', async (_caso, cuenta, password) => {
    const base = cuentaEnBase(cuenta)
    const cookies = await simularSesion(false)
    const res = await intentar({ usuario: 'redactor1', password })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Usuario o contraseña incorrectos' })
    expect(intentos.registrarFallo).toHaveBeenCalledWith('1.1.1.1')
    expect(cookies.set).not.toHaveBeenCalled()
    expect(anotoIngreso(base)).toBe(false)
  })

  it('con la contraseña del admin incorrecta responde 401, registra el fallo y no crea sesión', async () => {
    const cookies = await simularSesion(false)
    const res = await intentar({ usuario: 'ab06', password: 'mala' })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Usuario o contraseña incorrectos' })
    expect(intentos.registrarFallo).toHaveBeenCalledWith('1.1.1.1')
    expect(cookies.set).not.toHaveBeenCalled()
  })

  it('bloqueada la IP responde 429 sin siquiera revisar la contraseña', async () => {
    vi.mocked(intentos.loginBloqueado).mockResolvedValue(true)
    const cookies = await simularSesion(false)
    const res = await intentar({ usuario: 'ab06', password: 'clave-correcta' })

    expect(res.status).toBe(429)
    expect(cookies.set).not.toHaveBeenCalled()
  })

  it.each([
    ['sin nada', {}],
    ['sin contraseña', { usuario: 'ab06' }],
    ['sin usuario', { password: 'clave-correcta' }],
    ['usuario vacío', { usuario: '  ', password: 'clave-correcta' }],
    ['contraseña vacía', { usuario: 'ab06', password: '' }],
    ['contraseña que no es texto', { usuario: 'ab06', password: ['clave-correcta'] }],
    ['usuario que no es texto', { usuario: { $ne: null }, password: 'clave-correcta' }],
  ])('responde 400 %s', async (_caso, body) => {
    await simularSesion(false)
    expect((await intentar(body)).status).toBe(400)
  })

  it('responde 500 sin detalles ante un cuerpo que no es JSON', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await simularSesion(false)
    const res = await intentar('esto no es json')
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Error al iniciar sesión' })
  })
})

describe('POST /api/auth/logout', () => {
  it('borra la cookie de sesión, también la de la versión anterior bajo /admin', async () => {
    const cookies = await simularSesion(true)
    const res = await logout()

    expect(res.status).toBe(200)
    expect(cookies.delete).toHaveBeenCalledWith({ name: SESSION_COOKIE, path: '/' })
    expect(cookies.delete).toHaveBeenCalledWith({ name: SESSION_COOKIE, path: '/admin' })
  })
})
