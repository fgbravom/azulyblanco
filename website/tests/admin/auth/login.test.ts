import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SESSION_COOKIE, SESSION_MAX_AGE, verificarToken } from '@/lib/auth/token'
import { simularSesion } from '../../helpers/sesion'

vi.mock('@/lib/auth/intentos', () => ({
  ipDe: vi.fn(() => '1.1.1.1'),
  loginBloqueado: vi.fn(async () => false),
  registrarFallo: vi.fn(async () => {}),
  limpiarIntentos: vi.fn(async () => {}),
}))

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

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_PASSWORD_HASH', bcrypt.hashSync('clave-correcta', 4))
    vi.mocked(intentos.loginBloqueado).mockResolvedValue(false)
  })

  it('con la contraseña correcta crea la sesión con una cookie segura', async () => {
    const cookies = await simularSesion(false)
    const res = await intentar({ password: 'clave-correcta' })

    expect(res.status).toBe(200)
    expect(cookies.set).toHaveBeenCalledOnce()
    const [nombre, valor, opciones] = cookies.set.mock.calls[0]
    expect(nombre).toBe(SESSION_COOKIE)
    expect(await verificarToken(valor, process.env.SESSION_SECRET)).toEqual({ rol: 'admin' })
    expect(opciones).toMatchObject({ httpOnly: true, sameSite: 'strict', path: '/', maxAge: SESSION_MAX_AGE })
    expect(intentos.limpiarIntentos).toHaveBeenCalledWith('1.1.1.1')
  })

  it('en producción la cookie solo viaja por HTTPS', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const cookies = await simularSesion(false)
    await intentar({ password: 'clave-correcta' })
    expect(cookies.set.mock.calls[0][2]).toMatchObject({ secure: true })
  })

  it('con la contraseña incorrecta responde 401, registra el fallo y no crea sesión', async () => {
    const cookies = await simularSesion(false)
    const res = await intentar({ password: 'mala' })

    expect(res.status).toBe(401)
    expect(intentos.registrarFallo).toHaveBeenCalledWith('1.1.1.1')
    expect(cookies.set).not.toHaveBeenCalled()
  })

  it('bloqueada la IP responde 429 sin siquiera revisar la contraseña', async () => {
    vi.mocked(intentos.loginBloqueado).mockResolvedValue(true)
    const cookies = await simularSesion(false)
    const res = await intentar({ password: 'clave-correcta' })

    expect(res.status).toBe(429)
    expect(cookies.set).not.toHaveBeenCalled()
  })

  it.each([
    ['sin contraseña', {}],
    ['contraseña vacía', { password: '' }],
    ['contraseña que no es texto', { password: ['clave-correcta'] }],
    ['objeto en vez de texto', { password: { $ne: null } }],
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
